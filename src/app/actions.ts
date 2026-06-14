"use server";

// Server actions used across the app. These run only on the server, talk to
// Prisma directly, then revalidate the affected pages so the UI refreshes.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/date";
import { getOrCreateTodayTask } from "@/lib/dsa";

// Toggle a habit's completion on a specific date (today by default).
export async function toggleHabitOnDate(habitId: number, date: string) {
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date } },
  });
  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } });
  } else {
    await prisma.habitLog.create({ data: { habitId, date, done: true } });
  }
  revalidatePath("/");
  revalidatePath("/tasks");
}

// Convenience wrapper used by the dashboard checklist.
export async function toggleHabitToday(habitId: number) {
  return toggleHabitOnDate(habitId, todayKey());
}

// --- habit CRUD (Tasks manager) ------------------------------------------

export async function addHabit(name: string) {
  const clean = name.trim();
  if (!clean) return;
  const last = await prisma.habit.findFirst({
    where: { active: true },
    orderBy: { order: "desc" },
  });
  await prisma.habit.create({
    data: { name: clean, type: "recurring", order: (last?.order ?? -1) + 1 },
  });
  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function renameHabit(id: number, name: string) {
  const clean = name.trim();
  if (!clean) return;
  await prisma.habit.update({ where: { id }, data: { name: clean } });
  revalidatePath("/");
  revalidatePath("/tasks");
}

// Soft-delete: keeps historical logs but removes it from active views.
export async function deleteHabit(id: number) {
  await prisma.habit.update({ where: { id }, data: { active: false } });
  revalidatePath("/");
  revalidatePath("/tasks");
}

// --- health goals -----------------------------------------------------------

export async function addHealthGoal(name: string, unit: string, target: number) {
  const clean = name.trim();
  if (!clean || !unit.trim() || !(target > 0)) return;
  const last = await prisma.healthGoal.findFirst({
    where: { active: true },
    orderBy: { order: "desc" },
  });
  await prisma.healthGoal.create({
    data: { name: clean, unit: unit.trim(), target, order: (last?.order ?? -1) + 1 },
  });
  revalidatePath("/");
  revalidatePath("/health");
}

export async function deleteHealthGoal(id: number) {
  await prisma.healthGoal.update({ where: { id }, data: { active: false } });
  revalidatePath("/");
  revalidatePath("/health");
}

// Set a goal's logged value for a given day (today by default). Clamps at 0.
export async function logHealth(goalId: number, value: number, date?: string) {
  const day = date ?? todayKey();
  const v = Math.max(0, Math.round(value * 100) / 100);
  await prisma.healthLog.upsert({
    where: { goalId_date: { goalId, date: day } },
    update: { value: v },
    create: { goalId, date: day, value: v },
  });
  revalidatePath("/");
  revalidatePath("/health");
}

// Swap order with the neighbour in the given direction.
export async function moveHabit(id: number, dir: "up" | "down") {
  const habits = await prisma.habit.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  const idx = habits.findIndex((h) => h.id === id);
  if (idx === -1) return;
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= habits.length) return;
  const a = habits[idx];
  const b = habits[swapWith];
  await prisma.$transaction([
    prisma.habit.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.habit.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidatePath("/");
  revalidatePath("/tasks");
}

// Generate today's DSA task (next unsolved problems on the sheet).
export async function generateTodayDsaTask() {
  await getOrCreateTodayTask();
  revalidatePath("/");
  revalidatePath("/dsa");
}

// Mark today's DSA task done / not done. Marking done also checks off its
// problems on the sheet (you solved them to finish the task).
export async function toggleDsaTaskToday() {
  const date = todayKey();
  const task = await prisma.dsaTask.findUnique({ where: { date } });
  if (!task) return;
  const done = !task.done;
  await prisma.dsaTask.update({
    where: { date },
    data: { done, completedAt: done ? new Date() : null },
  });
  if (done) {
    const keys = (JSON.parse(task.problems) as { key: string }[]).map((p) => p.key);
    await prisma.dsaProblem.updateMany({
      where: { key: { in: keys } },
      data: { done: true, completedAt: new Date() },
    });
  }
  revalidatePath("/");
  revalidatePath("/dsa");
}

// Toggle a single problem's solved state on the sheet.
export async function toggleProblemDone(key: string) {
  const p = await prisma.dsaProblem.findUnique({ where: { key } });
  if (!p) return;
  const done = !p.done;
  await prisma.dsaProblem.update({
    where: { key },
    data: { done, completedAt: done ? new Date() : null },
  });
  revalidatePath("/");
  revalidatePath("/dsa");
}
