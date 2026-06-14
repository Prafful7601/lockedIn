# LockedIn 🎯

A personal productivity **control room** for self-teaching DSA and building a tech
career in public. Tracks your coding vs. YouTube time, your progress through
**Striver's A2Z DSA sheet**, daily habits, health goals, and streaks — with an
**AI coach** (Google Gemini) that reads your real data to brief you each day,
plan your day, and draft build-in-public posts.

Local-first (SQLite, zero setup), deployable to Vercel (Turso) when you're ready.

---

## Features

- **Dashboard** — today's tasks, streaks, coding-vs-YouTube totals, a 7-day activity heatmap, and the AI coach's daily briefing up top.
- **DSA tracker** — the full 18-step Striver A2Z sheet with per-problem checkboxes, a daily auto-generated task (next unsolved problems), per-step + overall progress, and a DSA streak.
- **Daily tasks** — your own recurring habits (add / rename / reorder / delete), check off daily, reset automatically, with current + longest streak and a 14-day history you can backfill.
- **Health goals** — define goals (water / sleep / workout), log daily values with steppers, see a 7-day history.
- **Time tracking** — `POST /api/track` ingests pings from companion trackers (VS Code + browser), summed per day per source.
- **AI Coach** (`/api/coach`) — daily briefing + "plan my day", grounded in your real numbers. Gemini key stays server-side.
- **Build in public** — generate an editable LinkedIn progress post from your week's data.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite (local) / Turso (prod) · Google Gemini.

---

## Quick start

### 1. Prerequisites
- **Node.js 18.18+** (you have a newer version — great).

### 2. Install
```bash
npm install
```

### 3. Set up the database (local SQLite)
```bash
npm run db:push     # creates prisma/dev.db from the schema
npm run db:seed     # fills it with example data so nothing is empty
```

### 4. Add your AI key (optional but recommended)
The app **runs fine without it** — the coach just shows an "add your API key"
message. To enable the AI features, get a **free** Google Gemini key:

1. Go to **https://aistudio.google.com/apikey** → **Create API key** (no credit card).
   - Keys may start with `AIza…` **or** `AQ.…` — both are valid.
2. Copy `.env.example` to `.env` (the install may have left a `.env` already):
   ```bash
   cp .env.example .env
   ```
3. Put your key in `.env`:
   ```
   GEMINI_API_KEY=your-key-here
   ```
   > Never commit `.env` or paste your key anywhere public — it's gitignored for a reason.

### 5. Run it
```bash
npm run dev
```
Open **http://localhost:3000**.

> **Model note:** defaults to `gemini-2.5-flash` (free tier). If you hit a `429`,
> it's Gemini's free rate/quota limit — wait a minute, or set a different
> `GEMINI_MODEL` in `.env`.

---

## Connecting the time trackers

LockedIn receives time data; two small companion apps send it. Both live in
[`trackers/`](./trackers) and POST to the same endpoint.

**Endpoint:** `POST /api/track` — body:
```json
{ "source": "vscode" | "youtube", "seconds": 60, "project": "optional", "date": "YYYY-MM-DD optional" }
```
Pings are **summed** per day per source (resending adds time, never deletes).

- **VS Code extension** → [`trackers/vscode-extension`](./trackers/vscode-extension) — open it in VS Code and press **F5** (or copy into your extensions folder). Tracks active coding time.
- **Browser extension** → [`trackers/browser-extension`](./trackers/browser-extension) — load unpacked at `chrome://extensions`. Tracks YouTube watch time.

They run independently, so coding **while** a video plays tracks both at once.
Quick test without the extensions:
```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"source":"vscode","seconds":1500,"project":"test"}'
```

---

## Deploy to Vercel

SQLite files don't persist on Vercel's serverless filesystem, so production uses
**Turso** (hosted SQLite). The app switches automatically when `TURSO_DATABASE_URL`
is set — **local dev keeps using your file DB untouched**.

### 1. Create a Turso database (free)
```bash
# install the CLI: https://docs.turso.tech/cli/installation
turso auth signup
turso db create lockedin
turso db show --url lockedin          # → your TURSO_DATABASE_URL (libsql://...)
turso db tokens create lockedin       # → your TURSO_AUTH_TOKEN
```

### 2. Push the schema to Turso
Point Prisma at Turso once to create the tables (replace the values):
```bash
turso db shell lockedin < <(npx prisma migrate diff \
  --from-empty --to-schema-datamodel prisma/schema.prisma --script)
```
> Or simply open `turso db shell lockedin` and paste the SQL from
> `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`.
> (Optional) seed by running the same insert statements, or just let the app fill up live.

### 3. Push to GitHub & import into Vercel
```bash
git init && git add . && git commit -m "LockedIn"
# create a repo and push, then import it at https://vercel.com/new
```

### 4. Set Environment Variables in Vercel
In the Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | your Gemini key |
| `GEMINI_MODEL` | `gemini-2.5-flash` (optional) |
| `TURSO_DATABASE_URL` | from `turso db show --url` |
| `TURSO_AUTH_TOKEN` | from `turso db tokens create` |

Leave `DATABASE_URL` as-is (only used locally). Deploy — done.

### 5. Point your trackers at production
In each tracker's settings, change the endpoint to
`https://your-app.vercel.app/api/track` (and add that origin to the browser
extension's `manifest.json` host permissions).

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | for AI features | Google Gemini key (free). App degrades gracefully without it. |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash`. |
| `DATABASE_URL` | local | Local SQLite path. Default `file:./dev.db`. |
| `TURSO_DATABASE_URL` | prod | Presence switches the app to Turso. |
| `TURSO_AUTH_TOKEN` | prod | Turso auth token. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server. |
| `npm run build` / `npm start` | Production build / serve. |
| `npm run db:push` | Apply the schema to the DB. |
| `npm run db:seed` | Insert example data. |
| `npm run db:reset` | Wipe + recreate + reseed (local only). |
| `npm run db:studio` | Browse the DB in Prisma Studio. |

## Project structure

```
src/
├─ app/
│  ├─ page.tsx              # dashboard
│  ├─ dsa/ tasks/ health/ build-in-public/   # feature pages
│  ├─ api/coach/route.ts    # AI: briefing / plan / post (Gemini, server-side)
│  ├─ api/track/route.ts    # time-tracking ingestion
│  └─ actions.ts            # server actions (toggles, CRUD)
├─ components/              # UI (client components)
└─ lib/                     # prisma, dates, streaks, roadmap, ai, data
prisma/                     # schema + seed
trackers/                   # VS Code + browser companion trackers
```

## Troubleshooting

- **`500` / `ENOENT .next`** after switching branches/config → stop the server, delete `.next`, `npm run dev`.
- **AI `429`** → Gemini free-tier limit; wait a minute or change `GEMINI_MODEL`.
- **AI shows "offline"** → `GEMINI_API_KEY` not set or server not restarted after adding it.
