// DSA service layer: sheet progress + the daily-task generator.
// "Today's task" = the next 1-2 unsolved problems in sheet order, so finishing
// them is literally advancing through Striver's A2Z sheet.

import { prisma } from "./prisma";
import { todayKey } from "./date";
import { SHEET, SHEET_PROBLEMS, TOTAL_PROBLEMS, type Difficulty } from "./roadmap";

export type DsaProblemView = {
  key: string;
  title: string;
  difficulty: string;
  url?: string | null;
  done: boolean;
};

export type StepProgress = {
  step: number;
  name: string;
  total: number;
  done: number;
  topics: { name: string; problems: DsaProblemView[] }[];
};

// Per-step grouping with each problem's done state pulled from the DB.
export async function getSheetProgress(): Promise<{
  steps: StepProgress[];
  totalDone: number;
  total: number;
}> {
  const rows = await prisma.dsaProblem.findMany({ select: { key: true, done: true } });
  const doneByKey = new Map(rows.map((r) => [r.key, r.done]));

  let totalDone = 0;
  const steps: StepProgress[] = SHEET.map((step) => {
    let done = 0;
    let total = 0;
    const topics = step.topics.map((topic) => {
      const problems: DsaProblemView[] = topic.problems.map((p) => {
        const meta = SHEET_PROBLEMS.find(
          (fp) => fp.step === step.step && fp.title === p.title,
        )!;
        const isDone = doneByKey.get(meta.key) ?? false;
        total++;
        if (isDone) done++;
        return {
          key: meta.key,
          title: p.title,
          difficulty: p.difficulty,
          url: p.url ?? null,
          done: isDone,
        };
      });
      return { name: topic.name, problems };
    });
    totalDone += done;
    return { step: step.step, name: step.name, total, done, topics };
  });

  return { steps, totalDone, total: TOTAL_PROBLEMS };
}

// Generate (or fetch) today's DSA task: the next 1-2 unsolved problems.
export async function getOrCreateTodayTask() {
  const date = todayKey();
  const existing = await prisma.dsaTask.findUnique({ where: { date } });
  if (existing) return existing;

  const doneRows = await prisma.dsaProblem.findMany({
    where: { done: true },
    select: { key: true },
  });
  const doneSet = new Set(doneRows.map((r) => r.key));

  // walk the sheet in order, take the first 1-2 unsolved from the same step
  const next = SHEET_PROBLEMS.filter((p) => !doneSet.has(p.key));
  if (next.length === 0) {
    // sheet complete — celebrate with a review task
    const last = SHEET_PROBLEMS[SHEET_PROBLEMS.length - 1];
    return prisma.dsaTask.create({
      data: {
        date,
        topicName: "Review",
        difficulty: "medium",
        problems: JSON.stringify([{ key: last.key, title: last.title, difficulty: last.difficulty, url: last.url }]),
      },
    });
  }

  const first = next[0];
  const picks = next
    .filter((p) => p.step === first.step)
    .slice(0, 2)
    .map((p) => ({ key: p.key, title: p.title, difficulty: p.difficulty, url: p.url }));

  const hardest = picks.reduce<Difficulty>((acc, p) => {
    const rank = { easy: 0, medium: 1, hard: 2 } as const;
    return rank[p.difficulty as Difficulty] > rank[acc] ? (p.difficulty as Difficulty) : acc;
  }, "easy");

  return prisma.dsaTask.create({
    data: {
      date,
      topicName: `Step ${first.step}: ${first.stepName}`,
      difficulty: hardest,
      problems: JSON.stringify(picks),
    },
  });
}
