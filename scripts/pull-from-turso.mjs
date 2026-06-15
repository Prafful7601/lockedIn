// Mirrors all data Turso → local SQLite (prisma/dev.db). Run once when moving to
// the local desktop app so it opens with your real data. Local becomes the
// source of truth after this.   node scripts/pull-from-turso.mjs

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

if (!process.env.TURSO_DATABASE_URL) {
  console.error("No TURSO_DATABASE_URL — nothing to pull.");
  process.exit(1);
}

// parents before children so foreign keys stay valid
const TABLES = [
  "Habit",
  "HealthGoal",
  "DsaProblem",
  "DsaTask",
  "HabitLog",
  "HealthLog",
  "TimeEntry",
  "CustomProblem",
  "CoachMessage",
];

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const local = createClient({ url: "file:prisma/dev.db" });
const q = (s) => `"${s}"`;

async function main() {
  await local.execute("PRAGMA foreign_keys=OFF");
  for (const t of [...TABLES].reverse()) await local.execute(`DELETE FROM ${q(t)}`);

  let total = 0;
  for (const t of TABLES) {
    let rows;
    try {
      rows = (await turso.execute(`SELECT * FROM ${q(t)}`)).rows;
    } catch {
      continue; // table may not exist on Turso yet
    }
    if (!rows.length) {
      console.log(`  ${t}: 0`);
      continue;
    }
    const cols = Object.keys(rows[0]);
    const sql = `INSERT INTO ${q(t)} (${cols.map(q).join(",")}) VALUES (${cols.map(() => "?").join(",")})`;
    for (let i = 0; i < rows.length; i += 200) {
      await local.batch(rows.slice(i, i + 200).map((r) => ({ sql, args: cols.map((c) => r[c]) })), "write");
    }
    total += rows.length;
    console.log(`  ${t}: ${rows.length}`);
  }
  console.log(`✓ Pulled ${total} rows into local prisma/dev.db`);
  await turso.close();
  await local.close();
}

main().catch((e) => {
  console.error("✗ pull failed:", e.message ?? e);
  process.exit(1);
});
