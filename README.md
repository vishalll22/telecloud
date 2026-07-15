# TeleCloud — unlimited cloud storage powered by Telegram

TeleCloud turns a private Telegram channel into a personal cloud drive. Files
are chunked and stored as documents in a channel only a user's own bot can
post to; the web app gives you a normal file-manager experience on top. It
also installs as a PWA, so opening it from your laptop or phone skips the
browser and goes straight to your files.

## Two bots, two jobs

- **Login bot** (one, shared, set up by whoever hosts the site) — only
  verifies identity via the Telegram Login Widget. It never touches files.
- **Storage bot** (one per user, created by each user themselves) — every
  user connects their own bot + private channel from the dashboard. Their
  files live only there, isolated from every other account.

This means the site operator's bot never has access to anyone's files, and no
two users ever share a storage pool.

## Project structure

```
telecloud/
├── backend/     Express API — auth, per-user encrypted storage credentials, chunked upload/download
└── frontend/    React (Vite) app — landing page (with a Privacy section), docs, login, dashboard
```

## 1. One-time setup (site operator)

1. Message **@BotFather** → `/newbot` → save the token as your **login bot**.
2. Run `/setdomain` in BotFather, pointing at the domain you'll host the frontend on.
3. Generate an encryption key: `openssl rand -hex 32`.
4. Fill these into `backend/.env` (copy from `.env.example`):
   `TELEGRAM_AUTH_BOT_TOKEN`, `TELEGRAM_AUTH_BOT_USERNAME`, `JWT_SECRET`, `ENCRYPTION_KEY`.
5. Fill `frontend/.env` (copy from `.env.example`): `VITE_TELEGRAM_AUTH_BOT_USERNAME`.

## 2. Run it

```bash
cd backend && npm install && npm run dev     # http://localhost:4000
cd frontend && npm install && npm run dev    # http://localhost:5173
```

## 3. What each user does

1. Visits the site, logs in via the Telegram widget (identity only).
2. On first visit to the dashboard, they're asked to connect their **own**
   storage: create their own bot with @BotFather, create a private channel,
   add the bot as admin, and paste the bot token + channel ID into the form.
   The app verifies both before saving the token (encrypted).
3. From then on, uploads/downloads/deletes all use that user's own bot and
   channel — visible only to them.

## Installing as an app

Once connected, users get an **Install app** button in the dashboard header
(or their browser's own install prompt). It adds TeleCloud to their laptop or
phone as a standalone app whose start page is the dashboard.

## Deploying

- Host the backend anywhere that runs Node, with the env vars above set.
- Build the frontend with `npm run build` and serve `dist/`, proxying `/api`
  to the backend.
- Restrict who can even log in with `ALLOWED_USER_IDS` in the backend `.env`,
  if this isn't meant to be public.
- Read `/docs` in the running app for the full API reference and privacy notes.
