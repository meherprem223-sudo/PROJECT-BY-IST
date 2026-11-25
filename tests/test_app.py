import unittest
from types import SimpleNamespace
from unittest.mock import patch

from postgrest import APIError

import app as backend_app


class FakeQuery:
    """Minimal fluent mock for Supabase/PostgREST table queries."""

    def __init__(self, handler):
        self.handler = handler
        self.op = "select"
        self.filters = []
        self.payload = None
        self.count_mode = None
        self.orders = []
        self.range_bounds = None
        self.single = False

    def select(self, *_args, count=None):
        self.op = "select"
        self.count_mode = count
        return self

    def insert(self, payload):
        self.op = "insert"
        self.payload = payload
        return self

    def eq(self, col, val):
        self.filters.append(("eq", col, val))
        return self

    def ilike(self, col, val):
        self.filters.append(("ilike", col, val))
        return self

    def order(self, col, desc=False):
        self.orders.append((col, desc))
        return self

    def range(self, start, end):
        self.range_bounds = (start, end)
        return self

    def limit(self, _n):
        return self

    def maybe_single(self):
        self.single = True
        return self

    def execute(self):
        return self.handler(self)


class FakeSupabase:
    def __init__(self, handler):
        self.handler = handler

    def table(self, name):
        return FakeQuery(lambda q: self.handler(name, q))


class EventsApiTestCase(unittest.TestCase):
    USER_ID = "11111111-1111-1111-1111-111111111111"
    ORGANIZER_ID = "22222222-2222-2222-2222-222222222222"
    EVENT_ID = "33333333-3333-3333-3333-333333333333"

    def setUp(self):
        self.client = backend_app.app.test_client()

    def test_index(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["status"], "ok")

    def test_list_events_pagination_validation(self):
        with patch.object(backend_app, "supabase", FakeSupabase(lambda *_: SimpleNamespace(data=[]))):
            res = self.client.get("/api/events?limit=0")
            self.assertEqual(res.status_code, 400)
            res = self.client.get("/api/events?limit=abc")
            self.assertEqual(res.status_code, 400)

    def test_list_events_orders_with_id_tiebreaker(self):
        captured = {}

        def handler(table, q):
            captured["table"] = table
            captured["orders"] = q.orders
            return SimpleNamespace(data=[{"id": self.EVENT_ID, "title": "Hackathon"}])

        with patch.object(backend_app, "supabase", FakeSupabase(handler)):
            res = self.client.get("/api/events?limit=10&offset=0")
            self.assertEqual(res.status_code, 200)
            self.assertEqual(len(res.get_json()["data"]), 1)
            self.assertEqual(captured["orders"], [("title", False), ("id", False)])

    def test_get_event_handles_none_result(self):
        with patch.object(backend_app, "supabase", FakeSupabase(lambda *_: None)):
            res = self.client.get(f"/api/events/{self.EVENT_ID}")
            self.assertEqual(res.status_code, 404)

    def test_create_registration_handles_null_status_safely(self):
        def handler(_table, _q):
            return SimpleNamespace(data={"id": self.EVENT_ID, "capacity": 10, "status": None})

        with patch.object(backend_app, "supabase", FakeSupabase(handler)):
            res = self.client.post(
                "/api/registrations",
                json={"user_id": self.USER_ID, "event_id": self.EVENT_ID},
            )
            self.assertEqual(res.status_code, 409)
            self.assertIn("not open", res.get_json()["error"])

    def test_create_registration_success_and_capacity_full(self):
        def handler_success(table, q):
            if table == "events":
                return SimpleNamespace(data={"id": self.EVENT_ID, "capacity": 2, "status": "open"})
            if table == "registrations" and q.op == "select" and q.count_mode == "exact":
                return SimpleNamespace(data=[], count=1)
            if table == "registrations" and q.op == "select":
                return SimpleNamespace(data=[])
            return SimpleNamespace(data=[{"id": "reg-1", "user_id": self.USER_ID, "event_id": self.EVENT_ID}])

        with patch.object(backend_app, "supabase", FakeSupabase(handler_success)):
            res = self.client.post(
                "/api/registrations",
                json={"user_id": self.USER_ID, "event_id": self.EVENT_ID},
            )
            self.assertEqual(res.status_code, 201)
            self.assertEqual(res.get_json()["data"]["id"], "reg-1")

        def handler_full(table, q):
            if table == "events":
                return SimpleNamespace(data={"id": self.EVENT_ID, "capacity": 1, "status": "open"})
            if table == "registrations" and q.count_mode == "exact":
                return SimpleNamespace(data=[], count=1)
            return SimpleNamespace(data=[])

        with patch.object(backend_app, "supabase", FakeSupabase(handler_full)):
            res = self.client.post(
                "/api/registrations",
                json={"user_id": self.USER_ID, "event_id": self.EVENT_ID},
            )
            self.assertEqual(res.status_code, 409)
            self.assertIn("capacity", res.get_json()["error"])

    def test_create_registration_maps_fk_error_to_404(self):
        def handler(table, q):
            if table == "events":
                return SimpleNamespace(data={"id": self.EVENT_ID, "capacity": 5, "status": "open"})
            if table == "registrations" and q.op == "insert":
                raise APIError({"code": "23503", "message": "foreign key violation"})
            return SimpleNamespace(data=[], count=0)

        with patch.object(backend_app, "supabase", FakeSupabase(handler)):
            res = self.client.post(
                "/api/registrations",
                json={"user_id": self.USER_ID, "event_id": self.EVENT_ID},
            )
            self.assertEqual(res.status_code, 404)

    def test_event_registrations_normalizes_organizer_uuid_case(self):
        def handler(table, _q):
            if table == "events":
                return SimpleNamespace(data={"id": self.EVENT_ID, "organizer_id": self.ORGANIZER_ID})
            return SimpleNamespace(data=[{"id": "reg-1", "user_id": self.USER_ID}])

        with patch.object(backend_app, "supabase", FakeSupabase(handler)):
            res = self.client.get(
                f"/api/events/{self.EVENT_ID}/registrations?organizer_id={self.ORGANIZER_ID.upper()}"
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(len(res.get_json()["data"]), 1)

    def test_event_registrations_rejects_non_organizer(self):
        def handler(_table, _q):
            return SimpleNamespace(data={"id": self.EVENT_ID, "organizer_id": self.ORGANIZER_ID})

        with patch.object(backend_app, "supabase", FakeSupabase(handler)):
            res = self.client.get(
                f"/api/events/{self.EVENT_ID}/registrations?organizer_id={self.USER_ID}"
            )
            self.assertEqual(res.status_code, 403)


if __name__ == "__main__":
    unittest.main()
