// POST /api/coach
// body: { mode: "briefing" | "plan" | "post", refresh?: boolean }
//   - "briefing": short daily focus message (cached once per day)
//   - "plan":     concrete ordered task list for today
//   - "post":     a LinkedIn-style build-in-public progress post (never cached;
//                 you edit it before posting)
//
// The Gemini API key is read server-side via the ai layer and never exposed.
// A missing key returns 200 with { configured: false } so the UI can show an
// "add your API key" message instead of crashing.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAiConfigured, generateText } from "@/lib/ai";
import { buildCoachContext } from "@/lib/coachContext";
import { todayKey } from "@/lib/date";

const SYSTEM = `You are LockedIn's AI coach for a beginner programmer who is self-teaching DSA (via Striver's A2Z sheet) and building a tech career in public. You are direct, warm, and practical — never fluffy or generic. You are given a factual snapshot of their recent activity. Base everything on that data; reference real numbers (streaks, time, problems solved). Encourage consistency over intensity.`;

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json({ configured: false });
  }

  let mode: "briefing" | "plan" | "post" = "briefing";
  let refresh = false;
  let instructions = "";
  try {
    const body = await req.json();
    if (body?.mode === "plan" || body?.mode === "post") mode = body.mode;
    refresh = !!body?.refresh;
    if (typeof body?.instructions === "string") instructions = body.instructions.slice(0, 500).trim();
  } catch {
    // empty body → default briefing
  }

  const date = todayKey();

  // briefing is cached per day unless explicitly refreshed
  if (mode === "briefing" && !refresh) {
    const cached = await prisma.coachMessage.findUnique({
      where: { date_kind: { date, kind: "briefing" } },
    });
    if (cached) {
      return NextResponse.json({ configured: true, cached: true, text: cached.content });
    }
  }

  const { summaryText } = await buildCoachContext();

  let prompt: string;
  if (mode === "briefing") {
    prompt = `Here is my activity snapshot:\n\n${summaryText}\n\nWrite my daily briefing: 3-4 short sentences. Call out what's going well (use real numbers), the single most important thing to focus on today, and one specific nudge. No greeting, no sign-off, no markdown headings.`;
  } else if (mode === "plan") {
    const extra = instructions
      ? `\n\nIMPORTANT — tailor the plan to these instructions from me: "${instructions}". Honor them (timing, energy, constraints) while still moving my goals forward.`
      : "";
    prompt = `Here is my activity snapshot:\n\n${summaryText}\n\nPlan my day: produce a concrete, ordered task list of 4-7 items I can do today to move my DSA + career + health forward. Be specific (name the DSA topic/problem to attempt, the habit to hit, etc.). Format as a numbered list only, one line each, no preamble.${extra}`;
  } else {
    prompt = `Here is my activity snapshot for the week:\n\n${summaryText}\n\nWrite a LinkedIn "build in public" progress post about my week. Use my real numbers (coding hours, problems solved on Striver's A2Z sheet, streaks). Voice: first-person, genuine, a little energetic, humble — a beginner sharing the grind, not bragging. ~120-180 words. Start with a hook line. End with one short reflection or what's next. You may use 2-4 relevant hashtags on the last line. No markdown headings, no "Here is your post" preamble — output only the post text.`;
  }

  const result = await generateText({
    system: SYSTEM,
    prompt,
    temperature: mode === "post" ? 0.85 : mode === "briefing" ? 0.6 : 0.5,
    maxOutputTokens: mode === "post" ? 600 : mode === "plan" ? 700 : 350,
  });

  if (!result.ok) {
    return NextResponse.json(
      { configured: true, error: result.message },
      { status: result.reason === "no-key" ? 200 : 502 },
    );
  }

  if (mode === "briefing") {
    await prisma.coachMessage.upsert({
      where: { date_kind: { date, kind: "briefing" } },
      update: { content: result.text },
      create: { date, kind: "briefing", content: result.text },
    });
  }

  return NextResponse.json({ configured: true, cached: false, text: result.text });
}
