// The insights engine — turns raw logs into the things a *great* tracker tells
// you: trends, peak focus hours, DSA velocity, what you're neglecting, and
// consistency. All computed server-side from the existing data.

import { prisma } from "./prisma";
import { lastNDays, todayKey, toDayKey, hourInAppTz, dayDiff } from "./date";
import { computeStreak } from "./streaks";
import { SHEET } from "./roadmap";

export type Insights = {
  // week-over-week (rolling 7-day windows)
  coding: { thisWeek: number; lastWeek: number; deltaPct: number | null };
  youtube: { thisWeek: number; lastWeek: number; deltaPct: number | null };
  // 24-hour coding histogram (seconds per hour, IST), + peak hour
  hourly: number[];
  peakHour: number | null;
  // top projects by coding time this week
  topProjects: { name: string; seconds: number }[];
  // DSA velocity: problems solved per rolling week (oldest→newest, 4 weeks)
  dsaPerWeek: number[];
  dsaThisWeek: number;
  customThisWeek: number;
  // neglected: steps not yet started, in order
  neglectedSteps: { step: number; name: string }[];
  // habit consistency over 30 days
  habitConsistency: { name: string; pct: number; streak: number }[];
  // headline focus number
  focusThisWeekSeconds: number;
};

function pctDelta(now: number, prev: number): number | null {
  if (prev === 0) return now > 0 ? 100 : null;
  return Math.round(((now - prev) / prev) * 100);
}

export async function getInsights(): Promise<Insights> {
  const today = todayKey();
  const win14 = lastNDays(14);
  const thisWeekDays = new Set(win14.slice(7));
  const lastWeekDays = new Set(win14.slice(0, 7));
  const since30 = lastNDays(30)[0];

  // --- time entries (30 days for hourly, windows for trends) ---
  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: since30 } },
    select: { source: true, seconds: true, date: true, project: true, createdAt: true },
  });

  let codingThis = 0, codingLast = 0, ytThis = 0, ytLast = 0;
  const hourly = new Array<number>(24).fill(0);
  const projects = new Map<string, number>();

  for (const e of entries) {
    const inThis = thisWeekDays.has(e.date);
    const inLast = lastWeekDays.has(e.date);
    if (e.source === "vscode") {
      if (inThis) {
        codingThis += e.seconds;
        if (e.project) projects.set(e.project, (projects.get(e.project) ?? 0) + e.seconds);
      }
      if (inLast) codingLast += e.seconds;
      hourly[hourInAppTz(e.createdAt)] += e.seconds;
    } else if (e.source === "youtube") {
      if (inThis) ytThis += e.seconds;
      if (inLast) ytLast += e.seconds;
    }
  }

  const peakHour = hourly.some((v) => v > 0) ? hourly.indexOf(Math.max(...hourly)) : null;
  const topProjects = [...projects.entries()]
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 5);

  // --- DSA velocity (solved per rolling week, last 4 weeks) ---
  const doneProblems = await prisma.dsaProblem.findMany({
    where: { done: true, completedAt: { not: null } },
    select: { completedAt: true },
  });
  const dsaPerWeek = [0, 0, 0, 0]; // index 0 = oldest (21-28d ago) … 3 = this week
  for (const p of doneProblems) {
    if (!p.completedAt) continue;
    const diff = dayDiff(today, toDayKey(p.completedAt));
    if (diff < 0 || diff >= 28) continue;
    dsaPerWeek[3 - Math.floor(diff / 7)] += 1;
  }
  const dsaThisWeek = dsaPerWeek[3];

  const customRows = await prisma.customProblem.findMany({ select: { solvedAt: true } });
  const customThisWeek = customRows.filter((c) => thisWeekDays.has(c.solvedAt)).length;

  // --- neglected steps (not started) ---
  const probRows = await prisma.dsaProblem.findMany({ select: { step: true, done: true } });
  const startedSteps = new Set(probRows.filter((p) => p.done).map((p) => p.step));
  const neglectedSteps = SHEET.filter((s) => !startedSteps.has(s.step))
    .slice(0, 4)
    .map((s) => ({ step: s.step, name: s.name }));

  // --- habit consistency (30 days) ---
  const habits = await prisma.habit.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { logs: { where: { done: true, date: { gte: since30 } }, select: { date: true } } },
  });
  const allLogs = await prisma.habit.findMany({
    where: { active: true },
    include: { logs: { where: { done: true }, select: { date: true } } },
  });
  const streakByName = new Map(
    allLogs.map((h) => [h.name, computeStreak(new Set(h.logs.map((l) => l.date)), today).current]),
  );
  const habitConsistency = habits.map((h) => ({
    name: h.name,
    pct: Math.round((h.logs.length / 30) * 100),
    streak: streakByName.get(h.name) ?? 0,
  }));

  return {
    coding: { thisWeek: codingThis, lastWeek: codingLast, deltaPct: pctDelta(codingThis, codingLast) },
    youtube: { thisWeek: ytThis, lastWeek: ytLast, deltaPct: pctDelta(ytThis, ytLast) },
    hourly,
    peakHour,
    topProjects,
    dsaPerWeek,
    dsaThisWeek,
    customThisWeek,
    neglectedSteps,
    habitConsistency,
    focusThisWeekSeconds: codingThis,
  };
}

// Smart, prioritised nudges for the dashboard — the "what should I do right now"
// layer that turns a logger into a coach.
export type Nudge = { icon: string; text: string; tone: "accent" | "amber" | "rose" };

export async function getFocusNudges(): Promise<Nudge[]> {
  const today = todayKey();
  const nudges: Nudge[] = [];

  // DSA streak at risk
  const doneTasks = await prisma.dsaTask.findMany({ where: { done: true }, select: { date: true } });
  const dsaStreak = computeStreak(new Set(doneTasks.map((t) => t.date)), today);
  const todayTask = await prisma.dsaTask.findUnique({ where: { date: today } });
  if (dsaStreak.current > 0 && !(todayTask && todayTask.done)) {
    nudges.push({
      icon: "🔥",
      text: `Your ${dsaStreak.current}-day DSA streak is at risk — finish today's problem to keep it alive.`,
      tone: "rose",
    });
  }

  // habits with a live streak not done today
  const habits = await prisma.habit.findMany({
    where: { active: true },
    include: { logs: { where: { done: true }, select: { date: true } } },
  });
  for (const h of habits) {
    const days = new Set(h.logs.map((l) => l.date));
    const s = computeStreak(days, today);
    if (s.current >= 2 && !days.has(today)) {
      nudges.push({ icon: "✓", text: `Keep "${h.name}" going — ${s.current}-day streak, not done today.`, tone: "amber" });
    }
  }

  // neglected DSA step
  const probRows = await prisma.dsaProblem.findMany({ select: { step: true, stepName: true, done: true } });
  const started = new Set(probRows.filter((p) => p.done).map((p) => p.step));
  const firstNeglected = SHEET.find((s) => !started.has(s.step));
  if (firstNeglected && started.size > 0) {
    nudges.push({ icon: "◆", text: `Next frontier: Step ${firstNeglected.step} — ${firstNeglected.name}. You haven't started it yet.`, tone: "accent" });
  }

  if (nudges.length === 0) {
    nudges.push({ icon: "💪", text: "You're on track. Stack one more win today.", tone: "accent" });
  }
  return nudges.slice(0, 3);
}
