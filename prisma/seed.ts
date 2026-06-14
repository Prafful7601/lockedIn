// Seeds the roadmap + a handful of example rows so the dashboard has life on
// first run. Safe to run repeatedly: it upserts where it can and clears the
// demo time/log rows before re-inserting.

import { PrismaClient } from "@prisma/client";
import { SHEET_PROBLEMS } from "../src/lib/roadmap";

const prisma = new PrismaClient();

// --- local date helpers (seed can't import the app's path-aliased module) ---
function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dayAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDayKey(d);
}

async function main() {
  console.log("Seeding Grindstone...");

  // 1) Striver A2Z sheet problems. Upsert by stable key so reseeding never
  //    wipes progress. Mark the first 12 as done for demo momentum.
  for (let i = 0; i < SHEET_PROBLEMS.length; i++) {
    const p = SHEET_PROBLEMS[i];
    const done = i < 12;
    await prisma.dsaProblem.upsert({
      where: { key: p.key },
      update: {
        step: p.step,
        stepName: p.stepName,
        topic: p.topic,
        title: p.title,
        difficulty: p.difficulty,
        url: p.url ?? null,
        order: p.order,
      },
      create: {
        key: p.key,
        step: p.step,
        stepName: p.stepName,
        topic: p.topic,
        title: p.title,
        difficulty: p.difficulty,
        url: p.url ?? null,
        order: p.order,
        done,
        completedAt: done ? new Date(dayAgo(2) + "T12:00:00") : null,
      },
    });
  }

  // 2) Recurring habits (DSA itself is tracked via the A2Z sheet, not here).
  await prisma.habit.deleteMany({ where: { type: "dsa" } }); // clean older seeds
  const habitDefs = [
    { name: "Post on LinkedIn", type: "recurring", order: 0 },
    { name: "Apply to 1 job", type: "recurring", order: 1 },
    { name: "Read tech article", type: "recurring", order: 2 },
  ];
  const habits = [];
  for (const h of habitDefs) {
    // No natural unique key on name, so find-or-create.
    let habit = await prisma.habit.findFirst({ where: { name: h.name } });
    if (!habit) habit = await prisma.habit.create({ data: h });
    habits.push(habit);
  }

  // 3) Health goals.
  const goalDefs = [
    { name: "Water", unit: "glasses", target: 8, order: 0 },
    { name: "Sleep", unit: "hours", target: 8, order: 1 },
    { name: "Workout", unit: "minutes", target: 30, order: 2 },
  ];
  const goals = [];
  for (const g of goalDefs) {
    let goal = await prisma.healthGoal.findFirst({ where: { name: g.name } });
    if (!goal) goal = await prisma.healthGoal.create({ data: g });
    goals.push(goal);
  }

  // --- wipe demo time/log rows so reseeding stays clean ---
  await prisma.timeEntry.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.healthLog.deleteMany();
  await prisma.dsaTask.deleteMany();
  await prisma.coachMessage.deleteMany();

  // 4) Time entries: 7 days of coding + youtube, a few pings per day.
  for (let d = 6; d >= 0; d--) {
    const date = dayAgo(d);
    const codingPings = 1 + Math.floor(Math.random() * 3);
    for (let p = 0; p < codingPings; p++) {
      await prisma.timeEntry.create({
        data: {
          source: "vscode",
          seconds: 1200 + Math.floor(Math.random() * 2400),
          project: "grindstone",
          date,
        },
      });
    }
    await prisma.timeEntry.create({
      data: {
        source: "youtube",
        seconds: 600 + Math.floor(Math.random() * 3000),
        project: "fireship",
        date,
      },
    });
  }

  // 5) Habit logs: give each habit a believable history (LinkedIn has a run,
  //    job apps are scattered, reading is most days with a gap).
  const linkedin = habits.find((h) => h.name === "Post on LinkedIn")!;
  const applyJob = habits.find((h) => h.name === "Apply to 1 job")!;
  const reading = habits.find((h) => h.name === "Read tech article")!;
  const logDays: Record<number, number[]> = {
    [linkedin.id]: [6, 5, 4, 2, 1, 0], // current streak of 3
    [applyJob.id]: [5, 3, 1],
    [reading.id]: [6, 5, 4, 3, 1, 0],
  };
  for (const [habitId, ds] of Object.entries(logDays)) {
    for (const d of ds) {
      await prisma.habitLog.create({
        data: { habitId: Number(habitId), date: dayAgo(d), done: true },
      });
    }
  }

  // 6) DSA daily tasks for the last few days, mostly done. Pull real problems
  //    from the sheet so the cards look authentic.
  for (let d = 6; d >= 1; d--) {
    if (d === 3) continue;
    const p = SHEET_PROBLEMS[(6 - d) % SHEET_PROBLEMS.length];
    await prisma.dsaTask.create({
      data: {
        date: dayAgo(d),
        topicName: `Step ${p.step}: ${p.stepName}`,
        difficulty: p.difficulty,
        problems: JSON.stringify([{ key: p.key, title: p.title, difficulty: p.difficulty, url: p.url }]),
        done: true,
        completedAt: new Date(dayAgo(d) + "T18:00:00"),
      },
    });
  }

  // 7) Health logs for the last 7 days.
  for (let d = 6; d >= 0; d--) {
    const date = dayAgo(d);
    for (const goal of goals) {
      const base =
        goal.name === "Water" ? 6 : goal.name === "Sleep" ? 6.5 : 20;
      const jitter =
        goal.name === "Sleep" ? Math.random() * 2 : Math.floor(Math.random() * 4);
      await prisma.healthLog.create({
        data: { goalId: goal.id, date, value: Math.round((base + jitter) * 10) / 10 },
      });
    }
  }

  console.log(
    `Seeded: ${SHEET_PROBLEMS.length} A2Z problems, ${habits.length} habits, ${goals.length} health goals, 7 days of activity.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
