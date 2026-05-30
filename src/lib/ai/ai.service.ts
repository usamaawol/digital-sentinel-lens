/**
 * AI service — calls the server functions that proxy OpenRouter.
 * Component-facing API is unchanged.
 */
import { analyzePolicyFn, chatFn } from "./ai.functions";

export type RiskLevel = "low" | "medium" | "high";

export interface PolicyAnalysis {
  summary: string;
  dataCollected: string[];
  thirdPartySharing: string[];
  retention: string;
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiService = {
  async analyzePolicy(input: { url?: string; text?: string }): Promise<PolicyAnalysis> {
    return analyzePolicyFn({ data: { url: input.url, text: input.text } });
  },

  async chat(messages: ChatMessage[]): Promise<string> {
    const { content } = await chatFn({ data: { messages } });
    return content;
  },

  /**
   * Generates AI insights from actual scanned app data.
   * Calls OpenRouter with a summary of the user's apps.
   * Falls back to static insights if AI is unavailable.
   */
  async generateInsights(appSummary?: string): Promise<string[]> {
    if (!appSummary) {
      // Static fallback when no app data is available
      return [
        "Run a scan to get personalised AI insights about your installed apps.",
        "High-risk apps often request permissions unrelated to their purpose.",
        "Review location permissions — set all apps to 'While in use' for better privacy.",
        "Check the Policy Analyzer to understand what your apps' privacy policies say.",
      ];
    }

    try {
      const { content } = await chatFn({
        data: {
          messages: [
            {
              role: "user",
              content: `Based on these scanned apps and their privacy scores, give me exactly 4 short, specific, actionable privacy insights (one sentence each). Be direct and practical.\n\n${appSummary}`,
            },
          ],
        },
      });

      // Split response into bullet points
      const lines = content
        .split(/\n+/)
        .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
        .filter((l) => l.length > 20)
        .slice(0, 4);

      return lines.length >= 2 ? lines : [content];
    } catch {
      return [
        "Scan complete. Review high-risk apps in the Applications section.",
        "Check which apps have background location access and consider revoking it.",
        "Apps with many high-risk permissions should be reviewed carefully.",
        "Use the Policy Analyzer to understand what your apps collect.",
      ];
    }
  },
};
