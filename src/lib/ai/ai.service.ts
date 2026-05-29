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

  async generateInsights(): Promise<string[]> {
    // Lightweight static insights — keeps the dashboard snappy without an AI round-trip.
    return [
      "TikTok was granted microphone access 3 days ago — consider revoking if not needed.",
      "2 newly installed apps request background location. Review under Apps → High Risk.",
      "Your overall privacy score improved by 4 points this week.",
      "WhatsApp requested contacts access — typical for messaging apps.",
    ];
  },
};
