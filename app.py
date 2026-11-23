import os
from uuid import UUID

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from postgrest import APIError
from supabase import Client, create_client

load_dotenv()

app = Flask(__name__)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")
supabase: Client | None = (
    create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
)


def error(message: str, status: int):
    return jsonify({"error": message}), status


def valid_uuid(value) -> bool:
    if not isinstance(value, str):
        return False
    try:
        UUID(value)
        return True
    except ValueError:
        return False


@app.errorhandler(APIError)
def handle_database_error(exc):
    app.logger.exception("Supabase request failed")
    return jsonify({"error": "Database request failed"}), 500


@app.get("/")
def index():
    return jsonify({"service": "events-api", "status": "ok"})


@app.get("/api/events")
def list_events():
    """Browse events; optionally filter by status and paginate with limit/offset."""
    if supabase is None:
        return error("Supabase is not configured", 503)

    try:
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return error("limit and offset must be integers", 400)
    if not 1 <= limit <= 100 or offset < 0:
        return error("limit must be 1-100 and offset must be non-negative", 400)

    query = supabase.table("events").select("id,organizer_id,title,capacity,status")
    status = request.args.get("status")
    if status:
        query = query.eq("status", status)
    result = query.order("title").range(offset, offset + limit - 1).execute()
    return jsonify({"data": result.data, "limit": limit, "offset": offset})


@app.get("/api/events/<event_id>")
def get_event(event_id):
    if supabase is None:
        return error("Supabase is not configured", 503)
    if not valid_uuid(event_id):
        return error("event id must be a UUID", 400)

    result = (
        supabase.table("events")
        .select("id,organizer_id,title,capacity,status")
        .eq("id", event_id)
        .maybe_single()
        .execute()
    )
    if result.data is None:
        return error("Event not found", 404)
    return jsonify({"data": result.data})


@app.post("/api/registrations")
def create_registration():
    """Register a user. With auth disabled, user_id is supplied in the JSON body."""
    if supabase is None:
        return error("Supabase is not configured", 503)
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return error("Request body must be a JSON object", 400)

    user_id = payload.get("user_id")
    event_id = payload.get("event_id")
    if not valid_uuid(user_id) or not valid_uuid(event_id):
        return error("user_id and event_id must be UUIDs", 400)

    event_result = (
        supabase.table("events")
        .select("id,capacity,status")
        .eq("id", event_id)
        .maybe_single()
        .execute()
    )
    event = event_result.data
    if event is None:
        return error("Event not found", 404)
    existing = (
        supabase.table("registrations")
        .select("id")
        .eq("user_id", user_id)
        .eq("event_id", event_id)
        .limit(1)
        .execute()
    )
    if existing.data:
        return error("User is already registered for this event", 409)

    registrations = (
        supabase.table("registrations")
        .select("id", count="exact")
        .eq("event_id", event_id)
        .execute()
    )
    if event.get("capacity") is not None and (registrations.count or 0) >= event["capacity"]:
        return error("Event has reached capacity", 409)

    created = (
        supabase.table("registrations")
        .insert({"user_id": user_id, "event_id": event_id})
        .execute()
    )
    return jsonify({"data": created.data[0]}), 201


@app.get("/api/me/registrations")
def my_registrations():
    """List registrations for the user_id query parameter (no auth is enabled)."""
    if supabase is None:
        return error("Supabase is not configured", 503)
    user_id = request.args.get("user_id")
    if not valid_uuid(user_id):
        return error("user_id query parameter must be a UUID", 400)

    result = (
        supabase.table("registrations")
        .select("id,user_id,event_id,created_at,events(id,title,capacity,status)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"data": result.data})


@app.get("/api/events/<event_id>/registrations")
def event_registrations(event_id):
    """List attendees; organizer_id query param is checked against the event owner."""
    if supabase is None:
        return error("Supabase is not configured", 503)
    if not valid_uuid(event_id):
        return error("event id must be a UUID", 400)
    organizer_id = request.args.get("organizer_id")
    if not valid_uuid(organizer_id):
        return error("organizer_id query parameter must be a UUID", 400)

    event_result = (
        supabase.table("events")
        .select("id,organizer_id")
        .eq("id", event_id)
        .maybe_single()
        .execute()
    )
    event = event_result.data
    if event is None:
        return error("Event not found", 404)
    if event["organizer_id"] != organizer_id:
        return error("Only the event organizer can view attendees", 403)

    result = (
        supabase.table("registrations")
        .select("id,user_id,event_id,created_at,users(id,email,role)")
        .eq("event_id", event_id)
        .order("created_at")
        .execute()
    )
    return jsonify({"data": result.data})


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
