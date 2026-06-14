// Pushes your local SQLite schema + data to a Turso database — no Turso CLI needed.
//
// Usage:
//   1. Create a Turso DB + token in the dashboard (https://app.turso.tech).
//   2. Put TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.
//   3. node scripts/push-to-turso.mjs
//
// It copies from prisma/lockedin-turso.db (the clean seeded snapshot) into Turso:
// creates every table + index, then inserts all rows.

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

// --- tiny .env loader (so we don't need an extra dependency) ---------------
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* no .env — rely on real env vars */
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    "\n✗ Missing TURSO_DATABASE_URL and/or TURSO_AUTH_TOKEN.\n" +
      "  Add them to .env (get them from https://app.turso.tech), then re-run.\n",
  );
  process.exit(1);
}

const LOCAL_FILE = "file:prisma/lockedin-turso.db";

const local = createClient({ url: LOCAL_FILE });
const remote = createClient({ url, authToken });

const ident = (s) => `"${s.replace(/"/g, '""')}"`;

async function main() {
  console.log("Reading local schema from prisma/lockedin-turso.db …");

  const tables = (
    await local.execute(
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL",
    )
  ).rows;
  const indexes = (
    await local.execute(
      "SELECT sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL",
    )
  ).rows;

  console.log(`Creating ${tables.length} tables in Turso …`);
  for (const t of tables) {
    await remote.execute(String(t.sql));
  }
  for (const i of indexes) {
    await remote.execute(String(i.sql));
  }

  let total = 0;
  for (const t of tables) {
    const name = String(t.name);
    const rows = (await local.execute(`SELECT * FROM ${ident(name)}`)).rows;
    if (rows.length === 0) {
      console.log(`  ${name}: 0 rows`);
      continue;
    }
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT INTO ${ident(name)} (${cols.map(ident).join(", ")}) VALUES (${placeholders})`;

    // batch in chunks so we don't build one giant transaction
    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const stmts = rows.slice(i, i + CHUNK).map((r) => ({
        sql,
        args: cols.map((c) => r[c]),
      }));
      await remote.batch(stmts, "write");
    }
    total += rows.length;
    console.log(`  ${name}: ${rows.length} rows`);
  }

  console.log(`\n✓ Done. Pushed ${tables.length} tables, ${total} rows to Turso.`);
  await local.close();
  await remote.close();
}

main().catch((e) => {
  console.error("\n✗ Push failed:", e.message ?? e);
  process.exit(1);
});
