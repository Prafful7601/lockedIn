// Day-bucket helpers. Everything in Grindstone keys off a local "YYYY-MM-DD"
// string so "today" means the user's calendar day, not a UTC instant.

export function toDayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

// Returns the last `n` day-keys, oldest first, ending today.
export function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(toDayKey(d));
  }
  return out;
}

// Difference in whole days between two day-keys (a - b).
export function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((da.getTime() - db.getTime()) / 86_400_000);
}

export function addDays(key: string, delta: number): string {
  const d = new Date(key + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toDayKey(d);
}

export function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${total}s`;
}
