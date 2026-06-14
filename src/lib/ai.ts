// Provider layer for the AI features. Currently Google Gemini via its REST API
// (no SDK dependency needed). The API key is read from the environment and used
// only here, server-side — it never reaches the browser.
//
// Swapping providers later means only changing this file.

export type AiResult =
  | { ok: true; text: string }
  | { ok: false; reason: "no-key" | "error"; message: string };

export function isAiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// --- function calling (the agent) ------------------------------------------

export type ToolDecl = {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export type ToolCall = { name: string; args: Record<string, unknown> };

export type ToolsResult =
  | { ok: true; calls: ToolCall[]; text: string }
  | { ok: false; reason: "no-key" | "error"; message: string };

// Ask Gemini what to do given the user's instruction + the available tools.
// Returns the function calls it wants to make (we execute them ourselves).
export async function generateWithTools(opts: {
  system?: string;
  prompt: string;
  tools: ToolDecl[];
  temperature?: number;
}): Promise<ToolsResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, reason: "no-key", message: "GEMINI_API_KEY is not set." };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
        tools: [{ functionDeclarations: opts.tools }],
        generationConfig: {
          temperature: opts.temperature ?? 0.2,
          maxOutputTokens: 1024,
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
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: "error", message: `Request to Gemini failed: ${message}` };
  }
}

export async function generateText(opts: {
  system?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { ok: false, reason: "no-key", message: "GEMINI_API_KEY is not set." };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        ...(opts.system
          ? { systemInstruction: { parts: [{ text: opts.system }] } }
          : {}),
        generationConfig: {
          temperature: opts.temperature ?? 0.7,
          maxOutputTokens: opts.maxOutputTokens ?? 1024,
          // gemini-2.5-* are reasoning models that spend "thinking" tokens from
          // the same output budget — disable it so short answers aren't cut off.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      // don't let a slow model hang the request forever
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const body = await res.text();
      // Surface the common, actionable cases clearly.
      const hint =
        res.status === 400 || res.status === 403
          ? "Check that GEMINI_API_KEY is valid and the Generative Language API is enabled."
          : res.status === 429
            ? "Gemini free-tier rate limit hit — wait a minute and try again."
            : "";
      return {
        ok: false,
        reason: "error",
        message: `Gemini API ${res.status}: ${body.slice(0, 300)} ${hint}`.trim(),
      };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      promptFeedback?: { blockReason?: string };
    };

    if (data.promptFeedback?.blockReason) {
      return {
        ok: false,
        reason: "error",
        message: `Gemini blocked the request: ${data.promptFeedback.blockReason}`,
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) {
      return { ok: false, reason: "error", message: "Gemini returned an empty response." };
    }
    return { ok: true, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: "error", message: `Request to Gemini failed: ${message}` };
  }
}
