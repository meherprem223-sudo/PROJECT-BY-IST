# Campus Connect frontend

Responsive React + Vite UI for the Flask events API in the parent folder.

## Run locally

1. From the repository root, start Flask using the backend README instructions (`http://127.0.0.1:5000`).
2. In this folder, run `npm install` and `npm run dev`.
3. Open the Vite URL shown in the terminal. Vite forwards `/api` requests to Flask.

For a separately deployed frontend, set `VITE_API_URL` to the backend base URL
(for example, `https://events-api.example.com`) and set `FRONTEND_ORIGIN` in the
backend environment to the frontend's exact origin (for example,
`https://events.example.com`).

## Deploy to Vercel

1. Import the frontend's Git repository into Vercel. If the frontend is in a
   monorepo, set the **Root Directory** to `frontend`; if this folder is the
   repository root, use `.`.
2. Use the Vite defaults: build command `npm run build`, output directory `dist`,
   and install command `npm install`.
3. Add `VITE_API_URL` as an environment variable with the deployed backend base
   URL, without a trailing slash (for example, `https://events-api.onrender.com`).
   Set it for Production and Preview if both should connect to an API.
4. Deploy, then set `FRONTEND_ORIGIN` on the backend to the exact Vercel domain,
   such as `https://your-project.vercel.app`. For preview deployments, add their
   origins too, separated by commas.
5. Redeploy the frontend after changing its environment variables.

`vercel.json` routes client-side page requests back to the Vite app. API requests
go to the separate Flask service using `VITE_API_URL` and are permitted by the
backend's `FRONTEND_ORIGIN` allowlist.

The API does not authenticate users. To register, open the account control and
enter the UUID of an existing user row. The frontend stores this ID in local
storage and sends it to the API for registration and the “My events” list.

The backend does not expose event dates, descriptions, venues, images, event
creation, notification preferences, or recap data. The interface uses the fields
the API returns and marks unsupported content as unavailable rather than inventing
event information.
