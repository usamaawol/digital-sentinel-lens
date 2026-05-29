/**
 * AI service abstraction.
 *
 * INTEGRATION POINT: OpenRouter integration is NOT implemented yet.
 * When ready:
 *   1. Add OPENROUTER_API_KEY via Lovable secrets (server-side).
 *   2. Create a server function (createServerFn) that calls
 *      https://openrouter.ai/api/v1/chat/completions with the key.
 *   3. Replace the mock bodies below with calls to that server function.
 *
 * The component-facing API (analyzePolicy, chat, insights) stays the same.
 */

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
    await delay(900);
    const hasUrl = !!input.url?.trim();
    return {
      summary:
        "This policy describes a typical mobile application that collects account and device data to operate its services. It mentions analytics, advertising partners, and limited third-party data sharing for service delivery.",
      dataCollected: [
        "Account information (email, name)",
        "Device information (model, OS version)",
        "Approximate location",
        "Usage analytics and crash reports",
      ],
      thirdPartySharing: [
        "Google Analytics (usage metrics)",
        "Advertising networks (personalised ads)",
        "Cloud service providers (hosting)",
      ],
      retention:
        "Most personal data is retained while your account is active and for up to 24 months after deletion for legal compliance.",
      riskLevel: "medium",
      recommendation: hasUrl
        ? "The policy is reasonable but includes ad tracking. If you are privacy-conscious, disable personalised ads in the app settings and review location permissions."
        : "Common collection practices with moderate ad-tracking. Review whether you want to share approximate location and personalised analytics.",
    };
  },

  async chat(messages: ChatMessage[]): Promise<string> {
    await delay(700);
    const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
    if (last.includes("location"))
      return "Apps request location for features like maps, weather, or nearby content. If a calculator app asks for location, that's a red flag. Grant 'While using the app' instead of 'Always' whenever possible.";
    if (last.includes("uninstall"))
      return "Consider uninstalling if: (1) the app requests permissions unrelated to its purpose, (2) it sends data to many third parties, or (3) it hasn't been updated in over a year. I can run a deeper scan on a specific app if you'd like.";
    if (last.includes("safe"))
      return "Based on my current scan, most of your apps are within a safe profile. Two apps fall into 'medium risk' due to broad permissions — open the Apps tab to review them.";
    return "I'm your Privacy Guard assistant. Ask me about an app's permissions, why something might be risky, or paste a privacy policy and I'll explain it in plain language. (Note: live AI responses activate once OpenRouter is connected.)";
  },

  async generateInsights(): Promise<string[]> {
    await delay(200);
    return [
      "TikTok was granted microphone access 3 days ago — consider revoking if not needed.",
      "2 newly installed apps request background location. Review under Apps → High Risk.",
      "Your overall privacy score improved by 4 points this week.",
      "WhatsApp requested contacts access — typical for messaging apps.",
    ];
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
