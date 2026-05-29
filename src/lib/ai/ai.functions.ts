/**
 * Server functions that proxy AI requests to OpenRouter.
 * The OPENROUTER_API_KEY is read from server env — never exposed to the client.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

async function callOpenRouter(messages: Array<{ role: string; content: string }>, opts?: {
  json?: boolean;
  temperature?: number;
}) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured on the server.");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://privacy-guard.lovable.app",
      "X-Title": "Privacy Guard AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts?.temperature ?? 0.4,
      ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenRouter error", res.status, text);
    throw new Error(`AI request failed (${res.status})`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export const analyzePolicyFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      url: z.string().max(2000).optional(),
      text: z.string().max(50_000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const source = data.text?.trim()
      ? `POLICY TEXT:\n${data.text.slice(0, 30_000)}`
      : data.url?.trim()
        ? `POLICY URL: ${data.url}\n(You do not have web access — reason from the URL and typical policies for that kind of service.)`
        : "";
    if (!source) throw new Error("Provide a policy URL or text.");

    const system =
      "You are a privacy policy analyst. Return STRICT JSON matching this TypeScript type and nothing else: " +
      "{ summary: string; dataCollected: string[]; thirdPartySharing: string[]; retention: string; riskLevel: 'low'|'medium'|'high'; recommendation: string }. " +
      "Be concise, plain-language, and user-protective.";

    const content = await callOpenRouter(
      [
        { role: "system", content: system },
        { role: "user", content: source },
      ],
      { json: true, temperature: 0.3 },
    );

    try {
      const parsed = JSON.parse(content);
      return {
        summary: String(parsed.summary ?? ""),
        dataCollected: Array.isArray(parsed.dataCollected) ? parsed.dataCollected.map(String) : [],
        thirdPartySharing: Array.isArray(parsed.thirdPartySharing) ? parsed.thirdPartySharing.map(String) : [],
        retention: String(parsed.retention ?? ""),
        riskLevel: (["low", "medium", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "medium") as
          | "low"
          | "medium"
          | "high",
        recommendation: String(parsed.recommendation ?? ""),
      };
    } catch {
      return {
        summary: content.slice(0, 600),
        dataCollected: [],
        thirdPartySharing: [],
        retention: "Unknown",
        riskLevel: "medium" as const,
        recommendation: "AI returned a non-JSON response. Try again.",
      };
    }
  });

export const chatFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1).max(8000),
          }),
        )
        .min(1)
        .max(40),
    }),
  )
  .handler(async ({ data }) => {
    const system =
      "You are Privacy Guard, a friendly privacy and mobile security assistant. " +
      "Explain app permissions, privacy risks, and recommendations in clear, plain language. " +
      "Be concise (under ~150 words) unless asked for detail. Never invent specific app behaviors you can't verify.";

    const content = await callOpenRouter(
      [{ role: "system", content: system }, ...data.messages],
      { temperature: 0.6 },
    );
    return { content };
  });
