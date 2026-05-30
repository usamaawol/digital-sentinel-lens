package com.privacyguard.ai.domain.repository

import com.privacyguard.ai.domain.model.AppInfo

/**
 * Repository interface for AI-powered features.
 *
 * Feature 7: AI Integration Layer
 * Feature 8: Privacy Policy Analysis
 * Feature 9: AI Privacy Assistant
 *
 * The implementation can be swapped between:
 * - MockAiRepository (for testing and when no API key is configured)
 * - OpenRouterAiRepository (for production with a real API key)
 */
interface AiRepository {

    /**
     * Analyzes a privacy policy text and returns a structured analysis.
     *
     * Feature 8: Privacy Policy Analysis
     *
     * @param policyText The raw privacy policy text (max ~30,000 characters)
     * @return [PolicyAnalysis] with summary, data collected, risks, and recommendations
     */
    suspend fun analyzePrivacyPolicy(policyText: String): PolicyAnalysis

    /**
     * Generates a plain-English explanation for a specific permission.
     *
     * Feature 7: AI Integration Layer — RiskExplanation service
     *
     * @param permissionName Android permission name (e.g. android.permission.CAMERA)
     * @param appName The app requesting the permission
     * @param appCategory The app's category
     * @return Human-readable explanation of the risk
     */
    suspend fun explainPermissionRisk(
        permissionName: String,
        appName: String,
        appCategory: String,
    ): String

    /**
     * Generates security recommendations for an app based on its permissions.
     *
     * Feature 7: AI Integration Layer — SecurityRecommendation service
     *
     * @param app The app to analyze
     * @return List of actionable recommendations
     */
    suspend fun generateRecommendations(app: AppInfo): List<String>

    /**
     * Sends a chat message to the AI privacy assistant.
     *
     * Feature 9: AI Privacy Assistant
     *
     * @param messages Conversation history
     * @return AI response text
     */
    suspend fun chat(messages: List<ChatMessage>): String

    /**
     * Generates AI insights for the dashboard.
     *
     * @param apps List of scanned apps
     * @return List of insight strings
     */
    suspend fun generateInsights(apps: List<AppInfo>): List<String>
}

/**
 * Structured result of a privacy policy analysis.
 * Feature 8: Privacy Policy Analysis
 */
data class PolicyAnalysis(
    /** Plain-English summary of the policy */
    val summary: String,

    /** List of data types collected */
    val dataCollected: List<String>,

    /** Third-party services data is shared with */
    val thirdPartySharing: List<String>,

    /** Data retention period */
    val retention: String,

    /** Overall risk level */
    val riskLevel: PolicyRiskLevel,

    /** Actionable recommendation for the user */
    val recommendation: String,
)

enum class PolicyRiskLevel(val displayName: String) {
    LOW("Low Risk"),
    MEDIUM("Medium Risk"),
    HIGH("High Risk"),
}

/**
 * Chat message for the AI assistant conversation.
 * Feature 9: AI Privacy Assistant
 */
data class ChatMessage(
    val role: ChatRole,
    val content: String,
)

enum class ChatRole {
    USER,
    ASSISTANT,
    SYSTEM,
}
