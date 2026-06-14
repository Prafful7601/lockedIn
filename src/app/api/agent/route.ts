// POST /api/agent  { instruction }
// The "Jarvis" command endpoint: turns a natural-language instruction into real
// actions (add/complete/delete tasks, mark DSA progress, log health) via Gemini
// function-calling, executes them, and returns what it did.

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAiConfigured, generateWithTools } from "@/lib/ai";
import { TOOL_DECLS, executeTool } from "@/lib/agentTools";
import { getSheetProgress } from "@/lib/dsa";

const SYSTEM = `You are LockedIn's hands-on assistant. The user speaks in natural language and you DO things by calling the provided tools — adding/completing/renaming/deleting their recurring tasks, marking DSA progress on Striver's A2Z sheet, and logging health goals. Call as many tools as needed to fully satisfy the request (you can call several at once). Only answer in plain text if no tool applies (e.g. a question). Never invent tasks the user didn't ask for. Match task/goal names approximately to what already exists.`;

export async function POST(req: Request) {
  if (!isAiConfigured()) return NextResponse.json({ configured: false });

  let instruction = "";
  try {
    instruction = (await req.json())?.instruction ?? "";
  } catch {
    /* ignore */
  }
  instruction = String(instruction).slice(0, 500).trim();
  if (!instruction) return NextResponse.json({ configured: true, error: "Say what you want to do." }, { status: 400 });

  // give the model the current state so it resolves names correctly
  const habits = await prisma.habit.findMany({ where: { active: true }, select: { name: true } });
  const goals = await prisma.healthGoal.findMany({ where: { active: true }, select: { name: true, unit: true } });
  const sheet = await getSheetProgress();
  const nextStep = sheet.steps.find((s) => s.done < s.total);

  const context = [
    `My recurring tasks: ${habits.map((h) => h.name).join(", ") || "(none)"}`,
    `My health goals: ${goals.map((g) => `${g.name} (${g.unit})`).join(", ") || "(none)"}`,
    `DSA: ${sheet.totalDone}/${sheet.total} solved; next up ${nextStep ? `Step ${nextStep.step} ${nextStep.name}` : "complete"}.`,
    ``,
    `My instruction: ${instruction}`,
  ].join("\n");

  const result = await generateWithTools({ system: SYSTEM, prompt: context, tools: TOOL_DECLS });

  if (!result.ok) {
    return NextResponse.json({ configured: true, error: result.message }, { status: 502 });
  }

  // execute every tool call the model asked for
  const actions: string[] = [];
  for (const call of result.calls) {
    try {
      actions.push(await executeTool(call));
    } catch (e) {
      actions.push(`✗ ${call.name} failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // reflect changes everywhere
  revalidatePath("/");
  revalidatePath("/dsa");
  revalidatePath("/tasks");
  revalidatePath("/health");

  const message =
    actions.length > 0
      ? `Done — ${actions.length} action${actions.length > 1 ? "s" : ""}.`
      : result.text || "I didn't find anything to do for that. Try being specific, e.g. \"add a task to apply to 1 job\".";

  return NextResponse.json({ configured: true, message, actions });
}
