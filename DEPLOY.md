# Deploying Zakhrafa (Neon + Render)

The app is one Node/Express server (`backend/`) that serves both the API and the built React app (`frontend/`) — so it deploys as a **single Render Web Service**, backed by a **Neon Postgres** database.

## 1. Create the Neon database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier is enough).
2. Create a new project (any name/region — pick a region close to where you'll deploy Render).
3. On the project dashboard, copy the **connection string** shown (starts with `postgresql://...`, includes `?sslmode=require`).
4. Keep that connection string handy — it's your `DATABASE_URL`.

You don't need to create any tables yourself — the app creates and seeds them automatically the first time it starts (see `backend/db.js`).

## 2. Deploy to Render

### Option A — Blueprint (recommended, one click)

1. Go to [render.com](https://render.com), sign up, and connect your GitHub account.
2. Click **New > Blueprint**, pick the `zakhrafa` repo. Render reads `render.yaml` at the repo root and proposes the service automatically.
3. When prompted for environment variables, fill in:
   - `DATABASE_URL` — the Neon connection string from step 1.
   - `ADMIN_PASSWORD` — a strong password for your own `/admin.html` login.
   - `JWT_SECRET` — leave as-is (Render generates a random one).
   - The `PAYMOB_*` keys — optional, only needed once you have a Paymob merchant account. Leave blank until then.
4. Click **Apply** / **Create**. Render will build (`npm install` + `npm run build` for the frontend, `npm install` for the backend) and start the service.

### Option B — Manual Web Service (if you'd rather not use the blueprint)

1. **New > Web Service**, connect the `zakhrafa` repo.
2. Runtime: **Node**. Build command:
   ```
   cd frontend && npm install && npm run build && cd ../backend && npm install
   ```
   Start command:
   ```
   cd backend && npm start
   ```
3. Add the same environment variables listed above under **Environment**.
4. Create the service.

## 3. Verify it's live

Once the deploy finishes, Render gives you a URL like `https://zakhrafa.onrender.com`. Check:
- The homepage loads with products.
- `https://zakhrafa.onrender.com/api/health` returns `{"ok":true}`.
- `https://zakhrafa.onrender.com/admin.html` lets you log in with your `ADMIN_PASSWORD`.
- Place a test order end-to-end (cart → checkout → confirmation page).

## Notes

- **Free tier cold starts**: both Neon and Render's free tiers "sleep" after inactivity. The first request after a while can take a few seconds while they wake up — that's expected, not a bug.
- **Re-deploys**: pushing to the connected GitHub branch triggers an automatic redeploy.
- **Local development still works as before** — `backend/.env` needs a `DATABASE_URL` too now (see `backend/.env.example`); point it at the same Neon database (or a second Neon project if you want a separate dev database) and run `npm run dev` in both `backend/` and `frontend/` as usual.
