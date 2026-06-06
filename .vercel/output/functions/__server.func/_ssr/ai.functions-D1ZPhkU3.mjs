import { T as TSS_SERVER_FUNCTION, a as createServerFn } from "./server-BQeBvh7z.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType, e as enumType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/isbot.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";
async function callOpenRouter(messages, opts) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://digital-sentinel-lens.vercel.app",
      "X-Title": "Privacy Guard AI"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts?.temperature ?? 0.4,
      ...opts?.json ? {
        response_format: {
          type: "json_object"
        }
      } : {}
    })
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("OpenRouter error", res.status, text);
    throw new Error(`AI request failed (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
const analyzePolicyFn_createServerFn_handler = createServerRpc({
  id: "67ee2bc2fd76502dad327aed7a10543c97c458e1abdcee19d46cd162afc9ed2e",
  name: "analyzePolicyFn",
  filename: "src/lib/ai/ai.functions.ts"
}, (opts) => analyzePolicyFn.__executeServer(opts));
const analyzePolicyFn = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  url: stringType().max(2e3).optional(),
  text: stringType().max(5e4).optional()
})).handler(analyzePolicyFn_createServerFn_handler, async ({
  data
}) => {
  const source = data.text?.trim() ? `POLICY TEXT:
${data.text.slice(0, 3e4)}` : data.url?.trim() ? `POLICY URL: ${data.url}
(You do not have web access — reason from the URL and typical policies for that kind of service.)` : "";
  if (!source) throw new Error("Provide a policy URL or text.");
  const system = "You are a privacy policy analyst. Return STRICT JSON matching this TypeScript type and nothing else: { summary: string; dataCollected: string[]; thirdPartySharing: string[]; retention: string; riskLevel: 'low'|'medium'|'high'; recommendation: string }. Be concise, plain-language, and user-protective.";
  const content = await callOpenRouter([{
    role: "system",
    content: system
  }, {
    role: "user",
    content: source
  }], {
    json: true,
    temperature: 0.3
  });
  try {
    const parsed = JSON.parse(content);
    return {
      summary: String(parsed.summary ?? ""),
      dataCollected: Array.isArray(parsed.dataCollected) ? parsed.dataCollected.map(String) : [],
      thirdPartySharing: Array.isArray(parsed.thirdPartySharing) ? parsed.thirdPartySharing.map(String) : [],
      retention: String(parsed.retention ?? ""),
      riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "medium",
      recommendation: String(parsed.recommendation ?? "")
    };
  } catch {
    return {
      summary: content.slice(0, 600),
      dataCollected: [],
      thirdPartySharing: [],
      retention: "Unknown",
      riskLevel: "medium",
      recommendation: "AI returned a non-JSON response. Try again."
    };
  }
});
const chatFn_createServerFn_handler = createServerRpc({
  id: "7d2cba5301f18b93b7131c9882fd9fe6802b4a335d1702103e32b7cb86be26ae",
  name: "chatFn",
  filename: "src/lib/ai/ai.functions.ts"
}, (opts) => chatFn.__executeServer(opts));
const chatFn = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  messages: arrayType(objectType({
    role: enumType(["user", "assistant"]),
    content: stringType().min(1).max(8e3)
  })).min(1).max(40)
})).handler(chatFn_createServerFn_handler, async ({
  data
}) => {
  const system = "You are Privacy Guard, a friendly privacy and mobile security assistant. Explain app permissions, privacy risks, and recommendations in clear, plain language. Be concise (under ~150 words) unless asked for detail. Never invent specific app behaviors you can't verify.";
  const content = await callOpenRouter([{
    role: "system",
    content: system
  }, ...data.messages], {
    temperature: 0.6
  });
  return {
    content
  };
});
export {
  analyzePolicyFn_createServerFn_handler,
  chatFn_createServerFn_handler
};
