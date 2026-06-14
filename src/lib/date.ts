// Day-bucket helpers. Everything in LockedIn keys off a local "YYYY-MM-DD"
// string. CRITICAL: the day key is computed in a FIXED timezone (APP_TZ, default
// Asia/Kolkata) — NOT the server's timezone — so the app agrees whether it runs
// on your machine (IST) or on Vercel (UTC). Without this, "today" differs by a
// day between local and production and data looks missing.

const APP_TZ = process.env.APP_TZ || "Asia/Kolkata";

const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDayKey(d: Date = new Date()): string {
  const parts = Object.fromEntries(dayFmt.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

// Day arithmetic done as pure UTC string math → timezone-independent and exact.
export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

// Returns the last `n` day-keys, oldest first, ending today.
export function lastNDays(n: number): string[] {
  const today = todayKey();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i));
  return out;
}

// Difference in whole days between two day-keys (a - b).
export function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86_400_000);
}

export function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${total}s`;
}
