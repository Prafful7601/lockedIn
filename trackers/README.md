# LockedIn Trackers

Two small companion apps that feed time data into LockedIn. **Both POST to the
same endpoint** — they're independent, so coding and YouTube are tracked at the
same time and summed per day, per source.

## The contract

**Endpoint:** `POST {YOUR_LOCKEDIN_URL}/api/track`
- Local dev: `http://localhost:3000/api/track`
- Production: `https://your-app.vercel.app/api/track`

**Request body (JSON):**

| field | type | required | notes |
|---|---|---|---|
| `source` | string | ✅ | `"vscode"` or `"youtube"` (the dashboard charts these two). |
| `seconds` | number | ✅ | Positive. Clamped to ≤ 86400 per ping. |
| `project` | string | ❌ | Optional label (repo name, channel…). |
| `date` | string | ❌ | `"YYYY-MM-DD"`. Defaults to the server's today. |

```jsonc
// example
{ "source": "vscode", "seconds": 60, "project": "lockedin" }
```

**Response:**

```jsonc
{ "ok": true, "source": "vscode", "date": "2026-06-14", "added": 60, "dayTotalSeconds": 3840 }
```

**Idempotent-friendly:** every ping is stored and **summed** on read. Trackers can
fire repeatedly without coordinating — resending never deletes, it just adds.

**Debug:** `GET /api/track` returns the last 7 days grouped by source.

## The two trackers

| Folder | What it watches | Sends |
|---|---|---|
| [`vscode-extension/`](./vscode-extension) | Active coding time in VS Code | `{ source: "vscode", seconds, project }` |
| [`browser-extension/`](./browser-extension) | YouTube video playing in a visible tab | `{ source: "youtube", seconds }` |

See each folder's `README.md` for install steps.

## Roll your own

Anything that can POST JSON works — a phone shortcut, a cron job, `curl`:

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"source":"vscode","seconds":1500,"project":"side-project"}'
```
