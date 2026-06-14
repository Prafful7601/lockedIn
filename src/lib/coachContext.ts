// Builds a compact, factual snapshot of the user's recent activity for the AI
// coach. Keeping this server-side and pre-summarised means we send the model
// only what it needs (cheap + private), not the raw database.

import { prisma } from "./prisma";
import { lastNDays, todayKey, formatSeconds } from "./date";
import { computeStreak } from "./streaks";
import { getSheetProgress } from "./dsa";
import { getInsights } from "./insights";

export type CoachContext = {
  today: string;
  summaryText: string; // human-readable block handed to the model
};

export async function buildCoachContext(): Promise<CoachContext> {
  const today = todayKey();
  const days = lastNDays(7);
  const since = days[0];

  // time: coding vs youtube over the last 7 days
  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: since } },
    select: { source: true, seconds: true, date: true },
  });
  let coding = 0;
  let youtube = 0;
  let codingToday = 0;
  let youtubeToday = 0;
  for (const e of entries) {
    if (e.source === "vscode") {
      coding += e.seconds;
      if (e.date === today) codingToday += e.seconds;
    } else if (e.source === "youtube") {
      youtube += e.seconds;
      if (e.date === today) youtubeToday += e.seconds;
    }
  }

  // DSA sheet progress + streak
  const sheet = await getSheetProgress();
  const doneTasks = await prisma.dsaTask.findMany({
    where: { done: true },
    select: { date: true },
  });
  const dsaStreak = computeStreak(new Set(doneTasks.map((t) => t.date)), today);
  const todayTask = await prisma.dsaTask.findUnique({ where: { date: today } });
  const nextStep = sheet.steps.find((s) => s.done < s.total);

  // habits: today's state + streaks + recent misses
  const habits = await prisma.habit.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { logs: { where: { done: true }, select: { date: true } } },
  });
  const habitLines = habits.map((h) => {
    const doneDays = new Set(h.logs.map((l) => l.date));
    const s = computeStreak(doneDays, today);
    const last7 = days.filter((d) => doneDays.has(d)).length;
    return `- ${h.name}: ${doneDays.has(today) ? "DONE today" : "not done today"}, streak ${s.current}d (best ${s.longest}d), ${last7}/7 last week`;
  });

  // health: today's logged values vs targets
  const goals = await prisma.healthGoal.findMany({
    where: { active: true },
    include: { logs: { where: { date: today } } },
  });
  const healthLines = goals.map(
    (g) => `- ${g.name}: ${g.logs[0]?.value ?? 0}/${g.target} ${g.unit} today`,
  );

  const ins = await getInsights();
  const peakLabel =
    ins.peakHour === null ? "n/a" : `${((ins.peakHour + 11) % 12) + 1}${ins.peakHour < 12 ? "am" : "pm"}`;

  const summaryText = [
    `Date: ${today}`,
    ``,
    `TIME (today / last 7 days):`,
    `- Coding: ${formatSeconds(codingToday)} today, ${formatSeconds(coding)} this week`,
    `- YouTube: ${formatSeconds(youtubeToday)} today, ${formatSeconds(youtube)} this week`,
    ``,
    `TRENDS:`,
    `- Coding this week vs last: ${ins.coding.deltaPct === null ? "n/a" : (ins.coding.deltaPct >= 0 ? "+" : "") + ins.coding.deltaPct + "%"}`,
    `- DSA solved this week: ${ins.dsaThisWeek} (per-week last 4: ${ins.dsaPerWeek.join(", ")})`,
    `- Peak focus hour: ${peakLabel}`,
    `- Not started yet: ${ins.neglectedSteps.map((s) => s.name).join(", ") || "none"}`,
    ``,
    `DSA (Striver A2Z sheet):`,
    `- Solved ${sheet.totalDone}/${sheet.total} problems`,
    `- Current DSA streak: ${dsaStreak.current} days (best ${dsaStreak.longest})`,
    `- Today's DSA task: ${todayTask ? (todayTask.done ? "completed" : `pending — ${todayTask.topicName}`) : "not generated yet"}`,
    `- Next focus area: ${nextStep ? `Step ${nextStep.step} ${nextStep.name} (${nextStep.done}/${nextStep.total})` : "sheet complete!"}`,
    ``,
    `RECURRING HABITS:`,
    ...(habitLines.length ? habitLines : ["- (none defined)"]),
    ``,
    `HEALTH TODAY:`,
    ...(healthLines.length ? healthLines : ["- (no goals defined)"]),
  ].join("\n");

  return { today, summaryText };
}
