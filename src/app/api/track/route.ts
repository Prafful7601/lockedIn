// POST /api/track  — ingestion endpoint for external time trackers.
//
// Body (JSON):
//   {
//     "source":  "vscode" | "youtube",   // required (any string accepted)
//     "seconds": number,                  // required, > 0
//     "project": "my-repo",               // optional label
//     "date":    "YYYY-MM-DD"             // optional, defaults to server's today
//   }
//
// Idempotent-friendly: every ping is appended as its own row and totals are
// summed on read, so sending the same ping twice simply adds time (trackers can
// fire repeatedly without coordinating). Returns the running day total.
//
// GET /api/track  — quick debug view of the last 7 days, grouped by source.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayKey, lastNDays } from "@/lib/date";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SECONDS = 24 * 60 * 60; // clamp a single ping to one day

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be valid JSON." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const source = typeof b.source === "string" ? b.source.trim().toLowerCase() : "";
  const secondsRaw = typeof b.seconds === "number" ? b.seconds : Number(b.seconds);
  const project = typeof b.project === "string" && b.project.trim() ? b.project.trim() : null;
  const date = typeof b.date === "string" && DAY_RE.test(b.date) ? b.date : todayKey();

  if (!source) {
    return NextResponse.json({ ok: false, error: "`source` is required." }, { status: 400 });
  }
  if (!Number.isFinite(secondsRaw) || secondsRaw <= 0) {
    return NextResponse.json(
      { ok: false, error: "`seconds` must be a positive number." },
      { status: 400 },
    );
  }

  const seconds = Math.min(Math.round(secondsRaw), MAX_SECONDS);

  await prisma.timeEntry.create({ data: { source, seconds, project, date } });

  // running total for this source on this day (so the tracker can show it)
  const agg = await prisma.timeEntry.aggregate({
    where: { source, date },
    _sum: { seconds: true },
  });

  return NextResponse.json({
    ok: true,
    source,
    date,
    added: seconds,
    dayTotalSeconds: agg._sum.seconds ?? seconds,
  });
}

export async function GET() {
  const days = lastNDays(7);
  const since = days[0];
  const rows = await prisma.timeEntry.findMany({
    where: { date: { gte: since } },
    select: { date: true, source: true, seconds: true },
  });

  const byDay: Record<string, Record<string, number>> = {};
  for (const d of days) byDay[d] = {};
  for (const r of rows) {
    byDay[r.date] ??= {};
    byDay[r.date][r.source] = (byDay[r.date][r.source] ?? 0) + r.seconds;
  }

  return NextResponse.json({ ok: true, since, days: byDay });
}
