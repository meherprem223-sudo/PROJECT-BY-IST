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
backend origin only, with no trailing slash (for example,
`https://events-api.onrender.com`). The browser then calls the backend directly.
Set `FRONTEND_ORIGIN` on the backend to the frontend's origin, without a path.
You can provide multiple allowed origins as a comma-separated list, for example
`https://campus-connect.onrender.com,https://campus.example.edu`.

## Deploy to Render

Create a Render Blueprint from the repository containing this folder. If this
folder is the repository root, `render.yaml` configures the free Flask web
service and the `campus-connect` static site. Set
`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the service environment; the
Blueprint prompts for these values because they are marked `sync: false`.
Set `FRONTEND_ORIGIN` to `https://campus-connect.onrender.com` (or the actual
static site's custom domain). Set the static site's `VITE_API_URL` to the
backend origin, for example `https://events-api.onrender.com`, with no trailing
slash. Render builds `frontend` and publishes `dist`.

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
