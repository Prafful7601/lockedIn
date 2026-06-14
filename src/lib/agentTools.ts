// The agent's toolbox. TOOL_DECLS is what Gemini sees; executeTool runs a tool
// call against the database and returns a human-readable result line.

import { prisma } from "./prisma";
import { todayKey } from "./date";
import { SHEET_PROBLEMS } from "./roadmap";
import { getOrCreateTodayTask } from "./dsa";
import type { ToolCall, ToolDecl } from "./ai";

export const TOOL_DECLS: ToolDecl[] = [
  {
    name: "add_task",
    description: "Add a new recurring daily habit/task (e.g. 'Apply to 1 job', 'Post on LinkedIn').",
    parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
  },
  {
    name: "set_task_done",
    description: "Mark a recurring task as done or not done for today. Match by approximate name.",
    parameters: {
      type: "object",
      properties: { name: { type: "string" }, done: { type: "boolean" } },
      required: ["name", "done"],
    },
  },
  {
    name: "rename_task",
    description: "Rename an existing recurring task.",
    parameters: {
      type: "object",
      properties: { name: { type: "string" }, new_name: { type: "string" } },
      required: ["name", "new_name"],
    },
  },
  {
    name: "delete_task",
    description: "Remove a recurring task from the active list.",
    parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
  },
  {
    name: "generate_dsa_task",
    description: "Generate today's DSA task (the next unsolved problems on Striver's A2Z sheet).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "complete_dsa_today",
    description: "Mark today's DSA task as complete (also checks its problems off the sheet).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "mark_dsa_problems",
    description:
      "Mark the next N unsolved DSA problems on the sheet as solved. Use when the user says they finished some problems/lectures (e.g. 'I did 3 problems' or 'mark lectures up to 4 done').",
    parameters: {
      type: "object",
      properties: { count: { type: "number" } },
      required: ["count"],
    },
  },
  {
    name: "log_custom_problem",
    description:
      "Log a problem the user solved OUTSIDE the Striver sheet (Codeforces, CSES, AtCoder, a contest, etc.). Use when they mention solving a specific problem from another platform.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        source: { type: "string" },
        difficulty: { type: "string" },
      },
      required: ["title"],
    },
  },
  {
    name: "log_health",
    description: "Log today's value for a health goal (e.g. water, sleep, workout). Match goal by name.",
    parameters: {
      type: "object",
      properties: { goal: { type: "string" }, value: { type: "number" } },
      required: ["goal", "value"],
    },
  },
  {
    name: "add_health_goal",
    description: "Create a new health goal with a unit and daily target.",
    parameters: {
      type: "object",
      properties: { name: { type: "string" }, unit: { type: "string" }, target: { type: "number" } },
      required: ["name", "unit", "target"],
    },
  },
];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown) => (typeof v === "number" ? v : Number(v));

async function findHabit(name: string) {
  const habits = await prisma.habit.findMany({ where: { active: true } });
  const q = name.toLowerCase();
  return (
    habits.find((h) => h.name.toLowerCase() === q) ||
    habits.find((h) => h.name.toLowerCase().includes(q) || q.includes(h.name.toLowerCase())) ||
    null
  );
}

async function findGoal(name: string) {
  const goals = await prisma.healthGoal.findMany({ where: { active: true } });
  const q = name.toLowerCase();
  return (
    goals.find((g) => g.name.toLowerCase() === q) ||
    goals.find((g) => g.name.toLowerCase().includes(q) || q.includes(g.name.toLowerCase())) ||
    null
  );
}

export async function executeTool(call: ToolCall): Promise<string> {
  const a = call.args;
  const date = todayKey();

  switch (call.name) {
    case "add_task": {
      const name = str(a.name);
      if (!name) return "✗ add_task: missing name";
      const last = await prisma.habit.findFirst({ where: { active: true }, orderBy: { order: "desc" } });
      await prisma.habit.create({ data: { name, type: "recurring", order: (last?.order ?? -1) + 1 } });
      return `✓ Added task “${name}”`;
    }
    case "set_task_done": {
      const h = await findHabit(str(a.name));
      if (!h) return `✗ Couldn’t find a task like “${str(a.name)}”`;
      const done = a.done !== false;
      if (done) {
        await prisma.habitLog.upsert({
          where: { habitId_date: { habitId: h.id, date } },
          update: { done: true },
          create: { habitId: h.id, date, done: true },
        });
        return `✓ Marked “${h.name}” done today`;
      }
      await prisma.habitLog.deleteMany({ where: { habitId: h.id, date } });
      return `✓ Unmarked “${h.name}” for today`;
    }
    case "rename_task": {
      const h = await findHabit(str(a.name));
      if (!h) return `✗ Couldn’t find a task like “${str(a.name)}”`;
      const newName = str(a.new_name);
      if (!newName) return "✗ rename_task: missing new_name";
      await prisma.habit.update({ where: { id: h.id }, data: { name: newName } });
      return `✓ Renamed “${h.name}” → “${newName}”`;
    }
    case "delete_task": {
      const h = await findHabit(str(a.name));
      if (!h) return `✗ Couldn’t find a task like “${str(a.name)}”`;
      await prisma.habit.update({ where: { id: h.id }, data: { active: false } });
      return `✓ Removed “${h.name}”`;
    }
    case "generate_dsa_task": {
      const t = await getOrCreateTodayTask();
      return `✓ Today’s DSA task: ${t.topicName}`;
    }
    case "complete_dsa_today": {
      const t = await getOrCreateTodayTask();
      await prisma.dsaTask.update({ where: { date }, data: { done: true, completedAt: new Date() } });
      const keys = (JSON.parse(t.problems) as { key: string }[]).map((p) => p.key);
      await prisma.dsaProblem.updateMany({ where: { key: { in: keys } }, data: { done: true, completedAt: new Date() } });
      return `✓ Completed today’s DSA task (${t.topicName})`;
    }
    case "mark_dsa_problems": {
      const count = Math.max(1, Math.min(50, Math.round(num(a.count) || 1)));
      const doneRows = await prisma.dsaProblem.findMany({ where: { done: true }, select: { key: true } });
      const doneSet = new Set(doneRows.map((r) => r.key));
      const next = SHEET_PROBLEMS.filter((p) => !doneSet.has(p.key)).slice(0, count);
      if (next.length === 0) return "✓ Sheet already complete — nothing to mark";
      await prisma.dsaProblem.updateMany({
        where: { key: { in: next.map((p) => p.key) } },
        data: { done: true, completedAt: new Date() },
      });
      return `✓ Marked ${next.length} problem(s) solved (through “${next[next.length - 1].title}”)`;
    }
    case "log_custom_problem": {
      const title = str(a.title);
      if (!title) return "✗ log_custom_problem: missing title";
      await prisma.customProblem.create({
        data: {
          title,
          source: str(a.source) || null,
          difficulty: str(a.difficulty) || null,
          solvedAt: date,
        },
      });
      return `✓ Logged “${title}”${str(a.source) ? ` (${str(a.source)})` : ""} to My Problems`;
    }
    case "log_health": {
      const g = await findGoal(str(a.goal));
      if (!g) return `✗ Couldn’t find a health goal like “${str(a.goal)}”`;
      const value = Math.max(0, num(a.value) || 0);
      await prisma.healthLog.upsert({
        where: { goalId_date: { goalId: g.id, date } },
        update: { value },
        create: { goalId: g.id, date, value },
      });
      return `✓ Logged ${value} ${g.unit} for ${g.name}`;
    }
    case "add_health_goal": {
      const name = str(a.name);
      const unit = str(a.unit);
      const target = num(a.target);
      if (!name || !unit || !(target > 0)) return "✗ add_health_goal: need name, unit, target";
      const last = await prisma.healthGoal.findFirst({ where: { active: true }, orderBy: { order: "desc" } });
      await prisma.healthGoal.create({ data: { name, unit, target, order: (last?.order ?? -1) + 1 } });
      return `✓ Added health goal ${name} (${target} ${unit})`;
    }
    default:
      return `✗ Unknown tool: ${call.name}`;
  }
}
