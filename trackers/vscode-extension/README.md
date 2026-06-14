# LockedIn — VS Code Time Tracker

Sends your **active coding time** to LockedIn's `POST /api/track` endpoint as:

```json
{ "source": "vscode", "seconds": 60, "project": "your-workspace-name" }
```

A second counts as "active" only when the VS Code window is **focused** and you've
edited/moved the cursor within the idle window (default 120s), so idle time and
background windows don't inflate your numbers.

## Run it (dev mode, no publishing)

1. Open **this folder** (`trackers/vscode-extension`) in VS Code.
2. Press **F5** → "Run Extension". A second VS Code window opens with the tracker active.
3. Make sure LockedIn is running (`npm run dev`) so the endpoint is live.
4. Type some code, wait ~60s, then check the LockedIn dashboard — "Coding today" goes up.

## Install it permanently

Copy this folder into your VS Code extensions directory, then reload VS Code:

- Windows: `%USERPROFILE%\.vscode\extensions\lockedin-vscode-tracker`
- macOS/Linux: `~/.vscode/extensions/lockedin-vscode-tracker`

## Settings (Preferences → Settings → "LockedIn")

| Setting | Default | Meaning |
|---|---|---|
| `lockedin.endpoint` | `http://localhost:3000/api/track` | Where to send pings. Change to your deployed URL after going live. |
| `lockedin.idleSeconds` | `120` | Stop counting after this much inactivity. |
| `lockedin.flushSeconds` | `60` | How often to send accumulated time. |
