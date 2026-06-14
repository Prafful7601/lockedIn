// Resets activity data to a clean slate on BOTH the local SQLite file and Turso
// (if TURSO_DATABASE_URL is set). Keeps structure (the 211 A2Z problems, your
// habit + health-goal definitions) but clears all logs, time, completions and
// streaks so the dashboard starts from 0.
//
//   node scripts/reset-data.mjs

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

// tiny .env loader
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* no .env */
}

const RESET_SQL = [
  "DELETE FROM TimeEntry",
  "DELETE FROM HabitLog",
  "DELETE FROM HealthLog",
  "DELETE FROM DsaTask",
  "DELETE FROM CoachMessage",
  "UPDATE DsaProblem SET done = 0, completedAt = NULL",
];

const targets = [{ name: "local (prisma/dev.db)", client: createClient({ url: "file:prisma/dev.db" }) }];
if (process.env.TURSO_DATABASE_URL) {
  targets.push({
    name: "Turso (production)",
    client: createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
  });
}

async function reset(name, client) {
  for (const sql of RESET_SQL) {
    try {
      await client.execute(sql);
    } catch (e) {
      // table might not exist on a fresh DB — keep going
      console.warn(`  (skip) ${sql.split(" ").slice(0, 3).join(" ")}…: ${e.message}`);
    }
  }
  const solved = (await client.execute("SELECT count(*) c FROM DsaProblem WHERE done = 1")).rows[0].c;
  const time = (await client.execute("SELECT count(*) c FROM TimeEntry")).rows[0].c;
  console.log(`✓ ${name}: solved=${solved}, timeEntries=${time}`);
  await client.close();
}

async function main() {
  console.log("Resetting activity data…");
  for (const t of targets) await reset(t.name, t.client);
  console.log("\nDone. Dashboard now starts from 0. (DSA sheet + habit/goal templates kept.)");
}

main().catch((e) => {
  console.error("✗ Reset failed:", e.message ?? e);
  process.exit(1);
});
