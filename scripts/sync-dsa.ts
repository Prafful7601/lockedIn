// Rebuilds the DsaProblem table from the current roadmap (the real A2Z playlist)
// on BOTH the local SQLite file and Turso. Clears old problems + daily tasks,
// then inserts every lecture. Run with: npx tsx scripts/sync-dsa.ts

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { SHEET_PROBLEMS } from "../src/lib/roadmap";

// tiny .env loader
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* no .env */
}

async function sync(name: string, client: ReturnType<typeof createClient>) {
  await client.execute("DELETE FROM DsaTask");
  await client.execute("DELETE FROM DsaProblem");
  const stmts = SHEET_PROBLEMS.map((p) => ({
    sql: "INSERT INTO DsaProblem (key, step, stepName, topic, title, difficulty, url, \"order\", done, completedAt) VALUES (?,?,?,?,?,?,?,?,0,NULL)",
    args: [p.key, p.step, p.stepName, p.topic, p.title, p.difficulty, p.url ?? null, p.order],
  }));
  for (let i = 0; i < stmts.length; i += 200) await client.batch(stmts.slice(i, i + 200), "write");
  const c = (await client.execute("SELECT count(*) c FROM DsaProblem")).rows[0].c;
  console.log(`✓ ${name}: ${c} problems`);
  await client.close();
}

async function main() {
  console.log(`Syncing ${SHEET_PROBLEMS.length} A2Z lectures…`);
  await sync("local", createClient({ url: "file:prisma/dev.db" }));
  if (process.env.TURSO_DATABASE_URL) {
    await sync(
      "Turso",
      createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN }),
    );
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error("✗ sync failed:", e.message ?? e);
  process.exit(1);
});
