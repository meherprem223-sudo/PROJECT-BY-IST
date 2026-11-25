# Events API

Flask API backed by the `users`, `events`, and `registrations` tables in Supabase.
Authentication is disabled. User-specific endpoints therefore take a caller supplied
UUID; those values are not proof of identity.

## Run

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `.env`, then run:

```powershell
.\venv\Scripts\python.exe app.py
```

The server listens on `http://127.0.0.1:5000`.

## Run the frontend

The Vite app is in `frontend/`. Start the API as above, then in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to `http://127.0.0.1:5000`. Leave `VITE_API_URL`
empty for local development. For a separately hosted frontend, set it to the
backend origin only, with no trailing slash. Set `FRONTEND_ORIGIN` on the
backend to the frontend's origin, without a path. Multiple allowed origins can
be comma-separated.

## Deploy to Render

Create or sync a Render Blueprint from this repository. `render.yaml` configures
the `project-by-ist` Flask service and the `campus-connect` static site. Render
supplies the API's public URL to the frontend at build time, and the API allows
the static site's default origin for CORS. The Blueprint prompts for
`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; enter the values used by the
working API. Render builds the frontend with `npm ci && npm run build` and
publishes `frontend/dist`.

## Endpoints

| Method | Path | Inputs |
| --- | --- | --- |
| GET | `/api/events` | Optional `status`, `limit` (1–100), `offset` |
| GET | `/api/events/{id}` | Event UUID |
| POST | `/api/registrations` | JSON: `{"user_id":"UUID", "event_id":"UUID"}` |
| GET | `/api/me/registrations?user_id={UUID}` | User UUID query parameter |
| GET | `/api/events/{id}/registrations?organizer_id={UUID}` | Event and organizer UUIDs |

Registration creation returns `201` on success and `409` for duplicate or full events.
The attendee endpoint compares the supplied `organizer_id` to the event
record, but without authentication a caller can claim another user's UUID. Enable
authentication and enforce authorization in database policies before exposing private
data publicly.
