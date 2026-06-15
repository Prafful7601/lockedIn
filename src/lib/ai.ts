// AI provider layer. Routes the app's AI calls to either a LOCAL model (Ollama —
// free, private, no tokens) or Google Gemini (free cloud), based on AI_PROVIDER.
// The desktop app defaults to Ollama so everything stays on your machine.

export type AiResult =
  | { ok: true; text: string }
  | { ok: false; reason: "no-key" | "error"; message: string };

export type ToolDecl = {
  name: string;
  description: string;
  parameters: { type: "object"; properties: Record<string, unknown>; required?: string[] };
};
export type ToolCall = { name: string; args: Record<string, unknown> };
export type ToolsResult =
  | { ok: true; calls: ToolCall[]; text: string }
  | { ok: false; reason: "no-key" | "error"; message: string };

// --- provider selection -----------------------------------------------------
function provider(): "ollama" | "gemini" {
  if (process.env.AI_PROVIDER === "ollama" || process.env.AI_PROVIDER === "gemini") {
    return process.env.AI_PROVIDER;
  }
  return process.env.LOCKEDIN_DESKTOP === "1" ? "ollama" : "gemini";
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

export function isAiConfigured(): boolean {
  return provider() === "ollama" ? true : !!process.env.GEMINI_API_KEY;
}

// ===========================================================================
// OLLAMA (local)
// ===========================================================================
async function ollamaChat(body: Record<string, unknown>) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: false }),
    signal: AbortSignal.timeout(120_000), // CPU inference can be slow
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Ollama ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<{
    message?: { content?: string; tool_calls?: { function: { name: string; arguments: Record<string, unknown> } }[] };
  }>;
}

async function ollamaText(opts: { system?: string; prompt: string; temperature?: number }): Promise<AiResult> {
  try {
    const data = await ollamaChat({
      model: OLLAMA_MODEL,
      messages: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: opts.prompt },
      ],
      options: { temperature: opts.temperature ?? 0.6 },
    });
    const text = data.message?.content?.trim();
    if (!text) return { ok: false, reason: "error", message: "Local model returned an empty response." };
    return { ok: true, text };
  } catch (err) {
    return { ok: false, reason: "error", message: ollamaErr(err) };
  }
}

async function ollamaTools(opts: { system?: string; prompt: string; tools: ToolDecl[] }): Promise<ToolsResult> {
  try {
    const data = await ollamaChat({
      model: OLLAMA_MODEL,
      messages: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: opts.prompt },
      ],
      tools: opts.tools.map((t) => ({ type: "function", function: t })),
      options: { temperature: 0.2 },
    });
    const calls: ToolCall[] = (data.message?.tool_calls ?? []).map((c) => ({
      name: c.function.name,
      args: c.function.arguments ?? {},
    }));
    return { ok: true, calls, text: data.message?.content?.trim() ?? "" };
  } catch (err) {
    return { ok: false, reason: "error", message: ollamaErr(err) };
  }
}

function ollamaErr(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/fetch failed|ECONNREFUSED|timed out|aborted/i.test(m)) {
    return `Local AI (Ollama) isn't reachable at ${OLLAMA_URL}. Make sure Ollama is running and the model "${OLLAMA_MODEL}" is pulled.`;
  }
  return m;
}

// ===========================================================================
// GEMINI (cloud)
// ===========================================================================
async function geminiText(opts: {
  system?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, reason: "no-key", message: "GEMINI_API_KEY is not set." };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
        generationConfig: {
          temperature: opts.temperature ?? 0.7,
          maxOutputTokens: opts.maxOutputTokens ?? 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, reason: "error", message: `Gemini API ${res.status}: ${body.slice(0, 250)}` };
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) return { ok: false, reason: "error", message: "Gemini returned an empty response." };
    return { ok: true, text };
  } catch (err) {
    return { ok: false, reason: "error", message: `Request to Gemini failed: ${err instanceof Error ? err.message : err}` };
  }
}

async function geminiTools(opts: { system?: string; prompt: string; tools: ToolDecl[]; temperature?: number }): Promise<ToolsResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, reason: "no-key", message: "GEMINI_API_KEY is not set." };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
        tools: [{ functionDeclarations: opts.tools }],
        generationConfig: { temperature: opts.temperature ?? 0.2, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, reason: "error", message: `Gemini API ${res.status}: ${body.slice(0, 250)}` };
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string; functionCall?: { name: string; args?: Record<string, unknown> } }[] } }[];
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const calls: ToolCall[] = [];
    let text = "";
    for (const p of parts) {
      if (p.functionCall) calls.push({ name: p.functionCall.name, args: p.functionCall.args ?? {} });
      else if (p.text) text += p.text;
    }
    return { ok: true, calls, text: text.trim() };
  } catch (err) {
    return { ok: false, reason: "error", message: `Request to Gemini failed: ${err instanceof Error ? err.message : err}` };
  }
}

// ===========================================================================
// public API — dispatches to the active provider
// ===========================================================================
export async function generateText(opts: {
  system?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<AiResult> {
  return provider() === "ollama" ? ollamaText(opts) : geminiText(opts);
}

export async function generateWithTools(opts: {
  system?: string;
  prompt: string;
  tools: ToolDecl[];
  temperature?: number;
}): Promise<ToolsResult> {
  return provider() === "ollama" ? ollamaTools(opts) : geminiTools(opts);
}
