// Read-side aggregation. Pages call these to get pre-computed view data so the
// components stay dumb. All time math is in local "YYYY-MM-DD" day-keys.

import { prisma } from "./prisma";
import { lastNDays, todayKey } from "./date";
import { computeStreak, type Streak } from "./streaks";

export type HealthGoalOverview = {
  id: number;
  name: string;
  unit: string;
  target: number;
  step: number; // sensible increment for the +/- buttons
  todayValue: number;
  history: { date: string; value: number }[]; // oldest → newest
  weekAvg: number;
};

// Step size for quick +/- buttons, inferred from the unit.
function stepFor(unit: string): number {
  const u = unit.toLowerCase();
  if (u.includes("hour")) return 0.5;
  if (u.includes("minute")) return 5;
  return 1;
}

export async function getHealthOverview(days = 7): Promise<HealthGoalOverview[]> {
  const today = todayKey();
  const window = lastNDays(days);
  const since = window[0];
  const goals = await prisma.healthGoal.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { logs: { where: { date: { gte: since } } } },
  });
  return goals.map((g) => {
    const byDate = new Map(g.logs.map((l) => [l.date, l.value]));
    const history = window.map((date) => ({ date, value: byDate.get(date) ?? 0 }));
    const sum = history.reduce((a, c) => a + c.value, 0);
    return {
      id: g.id,
      name: g.name,
      unit: g.unit,
      target: g.target,
      step: stepFor(g.unit),
      todayValue: byDate.get(today) ?? 0,
      history,
      weekAvg: Math.round((sum / days) * 10) / 10,
    };
  });
}

export type HabitOverview = {
  id: number;
  name: string;
  order: number;
  doneToday: boolean;
  streak: Streak;
  history: { date: string; done: boolean }[]; // oldest → newest
  rate: number; // % of window days completed
};

// Full per-habit view for the Tasks manager: today's state, streaks, and an
// N-day history strip.
export async function getHabitsOverview(days = 14): Promise<HabitOverview[]> {
  const today = todayKey();
  const window = lastNDays(days);
  const rows = await prisma.habit.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { logs: { where: { done: true }, select: { date: true } } },
  });
  return rows.map((h) => {
    const doneDays = new Set(h.logs.map((l) => l.date));
    const history = window.map((date) => ({ date, done: doneDays.has(date) }));
    const hit = history.filter((c) => c.done).length;
    return {
      id: h.id,
      name: h.name,
      order: h.order,
      doneToday: doneDays.has(today),
      streak: computeStreak(doneDays, today),
      history,
      rate: Math.round((hit / days) * 100),
    };
  });
}

export type SourceTotals = { vscode: number; youtube: number };

export type HeatCell = {
  date: string;
  coding: number; // seconds
  youtube: number; // seconds
  dsaDone: boolean;
};

export type HabitToday = {
  id: number;
  name: string;
  type: string;
  doneToday: boolean;
  streak: Streak;
};

export type DashboardData = {
  today: string;
  todayTotals: SourceTotals;
  weekTotals: SourceTotals;
  heat: HeatCell[];
  dsaTask: {
    exists: boolean;
    topicName?: string;
    difficulty?: string;
    done: boolean;
    problems: { title: string; difficulty: string; url?: string }[];
  };
  dsaStreak: Streak;
  habits: HabitToday[];
  roadmap: { total: number; covered: number };
  healthToday: {
    name: string;
    unit: string;
    target: number;
    value: number;
  }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const today = todayKey();
  const days = lastNDays(7);
  const since = days[0];

  // --- time entries for the 7-day window, grouped client-side ---
  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: since } },
    select: { date: true, source: true, seconds: true },
  });

  const byDay = new Map<string, SourceTotals>();
  for (const d of days) byDay.set(d, { vscode: 0, youtube: 0 });
  for (const e of entries) {
    const bucket = byDay.get(e.date);
    if (!bucket) continue;
    if (e.source === "vscode") bucket.vscode += e.seconds;
    else if (e.source === "youtube") bucket.youtube += e.seconds;
  }

  const weekTotals: SourceTotals = { vscode: 0, youtube: 0 };
  for (const t of byDay.values()) {
    weekTotals.vscode += t.vscode;
    weekTotals.youtube += t.youtube;
  }
  const todayTotals = byDay.get(today) ?? { vscode: 0, youtube: 0 };

  // --- DSA tasks across the window (for heatmap + today + streak) ---
  const dsaTasks = await prisma.dsaTask.findMany({
    where: { date: { gte: since } },
  });
  const dsaByDay = new Map(dsaTasks.map((t) => [t.date, t]));

  const heat: HeatCell[] = days.map((d) => ({
    date: d,
    coding: byDay.get(d)?.vscode ?? 0,
    youtube: byDay.get(d)?.youtube ?? 0,
    dsaDone: dsaByDay.get(d)?.done ?? false,
  }));

  // DSA streak from ALL done tasks, not just the window.
  const allDoneDsa = await prisma.dsaTask.findMany({
    where: { done: true },
    select: { date: true },
  });
  const dsaStreak = computeStreak(new Set(allDoneDsa.map((t) => t.date)), today);

  const todayTask = dsaByDay.get(today);
  const dsaTask = todayTask
    ? {
        exists: true,
        topicName: todayTask.topicName,
        difficulty: todayTask.difficulty,
        done: todayTask.done,
        problems: JSON.parse(todayTask.problems) as DashboardData["dsaTask"]["problems"],
      }
    : { exists: false, done: false, problems: [] };

  // --- habits + today's done state + per-habit streaks ---
  const habitRows = await prisma.habit.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { logs: { where: { done: true }, select: { date: true } } },
  });
  const habits: HabitToday[] = habitRows.map((h) => {
    const doneDays = new Set(h.logs.map((l) => l.date));
    return {
      id: h.id,
      name: h.name,
      type: h.type,
      doneToday: doneDays.has(today),
      streak: computeStreak(doneDays, today),
    };
  });

  // --- sheet progress (problems solved across Striver A2Z) ---
  const total = await prisma.dsaProblem.count();
  const covered = await prisma.dsaProblem.count({ where: { done: true } });

  // --- health goals + today's logged values ---
  const goals = await prisma.healthGoal.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { logs: { where: { date: today } } },
  });
  const healthToday = goals.map((g) => ({
    name: g.name,
    unit: g.unit,
    target: g.target,
    value: g.logs[0]?.value ?? 0,
  }));

  return {
    today,
    todayTotals,
    weekTotals,
    heat,
    dsaTask,
    dsaStreak,
    habits,
    roadmap: { total, covered },
    healthToday,
  };
}
