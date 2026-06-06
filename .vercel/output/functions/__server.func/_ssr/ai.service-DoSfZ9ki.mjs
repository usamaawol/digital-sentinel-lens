import { a as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-BQeBvh7z.mjs";
import { o as objectType, a as arrayType, s as stringType, e as enumType } from "../_libs/zod.mjs";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const analyzePolicyFn = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  url: stringType().max(2e3).optional(),
  text: stringType().max(5e4).optional()
})).handler(createSsrRpc("67ee2bc2fd76502dad327aed7a10543c97c458e1abdcee19d46cd162afc9ed2e"));
const chatFn = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  messages: arrayType(objectType({
    role: enumType(["user", "assistant"]),
    content: stringType().min(1).max(8e3)
  })).min(1).max(40)
})).handler(createSsrRpc("7d2cba5301f18b93b7131c9882fd9fe6802b4a335d1702103e32b7cb86be26ae"));
const aiService = {
  async analyzePolicy(input) {
    return analyzePolicyFn({ data: { url: input.url, text: input.text } });
  },
  async chat(messages) {
    const { content } = await chatFn({ data: { messages } });
    return content;
  },
  /**
   * Generates AI insights from actual scanned app data.
   * Calls OpenRouter with a summary of the user's apps.
   * Falls back to static insights if AI is unavailable.
   */
  async generateInsights(appSummary) {
    if (!appSummary) {
      return [
        "Run a scan to get personalised AI insights about your installed apps.",
        "High-risk apps often request permissions unrelated to their purpose.",
        "Review location permissions — set all apps to 'While in use' for better privacy.",
        "Check the Policy Analyzer to understand what your apps' privacy policies say."
      ];
    }
    try {
      const { content } = await chatFn({
        data: {
          messages: [
            {
              role: "user",
              content: `Based on these scanned apps and their privacy scores, give me exactly 4 short, specific, actionable privacy insights (one sentence each). Be direct and practical.

${appSummary}`
            }
          ]
        }
      });
      const lines = content.split(/\n+/).map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter((l) => l.length > 20).slice(0, 4);
      return lines.length >= 2 ? lines : [content];
    } catch {
      return [
        "Scan complete. Review high-risk apps in the Applications section.",
        "Check which apps have background location access and consider revoking it.",
        "Apps with many high-risk permissions should be reviewed carefully.",
        "Use the Policy Analyzer to understand what your apps collect."
      ];
    }
  }
};
export {
  aiService as a
};
