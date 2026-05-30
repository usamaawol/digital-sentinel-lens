package com.privacyguard.ai.data.ai

import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.repository.ChatMessage
import com.privacyguard.ai.domain.repository.ChatRole
import com.privacyguard.ai.domain.repository.PolicyAnalysis
import com.privacyguard.ai.domain.repository.PolicyRiskLevel
import com.privacyguard.ai.data.ai.network.OpenRouterApiService
import com.privacyguard.ai.data.ai.network.OpenRouterMessage
import com.privacyguard.ai.data.ai.network.OpenRouterRequest
import com.google.gson.Gson
import com.google.gson.JsonObject
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Production implementation of [AiRepository] using OpenRouter API.
 *
 * Feature 7: AI Integration Layer
 * Feature 8: Privacy Policy Analysis
 * Feature 9: AI Privacy Assistant
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  API KEY CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * To enable this implementation:
 *
 * 1. Add your OpenRouter API key to local.properties:
 *    OPENROUTER_API_KEY=sk-or-v1-your-key-here
 *
 * 2. In app/build.gradle.kts, expose it via BuildConfig:
 *    buildConfigField("String", "OPENROUTER_API_KEY",
 *        "\"${properties["OPENROUTER_API_KEY"]}\"")
 *
 * 3. In AiModule.kt, change the binding from MockAiRepository to
 *    OpenRouterAiRepository.
 *
 * The API key is NEVER hardcoded in source code.
 * ═══════════════════════════════════════════════════════════════════════════
 */
@Singleton
class OpenRouterAiRepository @Inject constructor(
    private val apiService: OpenRouterApiService,
    private val gson: Gson,
) : AiRepository {

    companion object {
        private const val MODEL = "openai/gpt-4o-mini"
        private const val MAX_TOKENS = 1024
    }

    override suspend fun analyzePrivacyPolicy(policyText: String): PolicyAnalysis {
        val systemPrompt = """
            You are a privacy policy analyst. Analyze the provided privacy policy and return 
            STRICT JSON matching this structure:
            {
              "summary": "string",
              "dataCollected": ["string"],
              "thirdPartySharing": ["string"],
              "retention": "string",
              "riskLevel": "LOW" | "MEDIUM" | "HIGH",
              "recommendation": "string"
            }
            Be concise, plain-language, and user-protective. Return only valid JSON.
        """.trimIndent()

        val truncatedPolicy = policyText.take(30_000)

        val response = apiService.chat(
            OpenRouterRequest(
                model = MODEL,
                messages = listOf(
                    OpenRouterMessage(role = "system", content = systemPrompt),
                    OpenRouterMessage(role = "user", content = truncatedPolicy),
                ),
                maxTokens = MAX_TOKENS,
                responseFormat = mapOf("type" to "json_object"),
            )
        )

        val content = response.choices.firstOrNull()?.message?.content
            ?: throw IllegalStateException("Empty response from AI")

        return try {
            val json = gson.fromJson(content, JsonObject::class.java)
            PolicyAnalysis(
                summary = json.get("summary")?.asString ?: "",
                dataCollected = json.getAsJsonArray("dataCollected")
                    ?.map { it.asString } ?: emptyList(),
                thirdPartySharing = json.getAsJsonArray("thirdPartySharing")
                    ?.map { it.asString } ?: emptyList(),
                retention = json.get("retention")?.asString ?: "Unknown",
                riskLevel = when (json.get("riskLevel")?.asString?.uppercase()) {
                    "HIGH" -> PolicyRiskLevel.HIGH
                    "LOW" -> PolicyRiskLevel.LOW
                    else -> PolicyRiskLevel.MEDIUM
                },
                recommendation = json.get("recommendation")?.asString ?: "",
            )
        } catch (e: Exception) {
            Timber.e(e, "Failed to parse AI policy analysis response")
            throw IllegalStateException("Failed to parse AI response: ${e.message}")
        }
    }

    override suspend fun explainPermissionRisk(
        permissionName: String,
        appName: String,
        appCategory: String,
    ): String {
        val prompt = """
            Explain in 2-3 sentences why the Android permission "$permissionName" 
            is concerning for a "$appCategory" app called "$appName". 
            Be specific about the privacy risk. Use plain language.
        """.trimIndent()

        val response = apiService.chat(
            OpenRouterRequest(
                model = MODEL,
                messages = listOf(
                    OpenRouterMessage(role = "system", content = PRIVACY_SYSTEM_PROMPT),
                    OpenRouterMessage(role = "user", content = prompt),
                ),
                maxTokens = 200,
            )
        )

        return response.choices.firstOrNull()?.message?.content
            ?: "Unable to generate explanation at this time."
    }

    override suspend fun generateRecommendations(app: AppInfo): List<String> {
        val permissionSummary = app.permissions
            .filter { it.isGranted }
            .joinToString(", ") { it.displayName }

        val prompt = """
            App: ${app.appName}
            Category: ${app.category.displayName}
            Privacy Score: ${app.privacyScore}/100
            Granted Permissions: $permissionSummary
            
            Provide 3 specific, actionable privacy recommendations for this app.
            Return as a JSON array of strings: ["recommendation1", "recommendation2", "recommendation3"]
        """.trimIndent()

        val response = apiService.chat(
            OpenRouterRequest(
                model = MODEL,
                messages = listOf(
                    OpenRouterMessage(role = "system", content = PRIVACY_SYSTEM_PROMPT),
                    OpenRouterMessage(role = "user", content = prompt),
                ),
                maxTokens = 400,
                responseFormat = mapOf("type" to "json_object"),
            )
        )

        val content = response.choices.firstOrNull()?.message?.content ?: return emptyList()

        return try {
            val jsonArray = gson.fromJson(content, com.google.gson.JsonArray::class.java)
            jsonArray.map { it.asString }
        } catch (e: Exception) {
            Timber.w(e, "Failed to parse recommendations")
            listOf(content)
        }
    }

    override suspend fun chat(messages: List<ChatMessage>): String {
        val apiMessages = buildList {
            add(OpenRouterMessage(role = "system", content = PRIVACY_SYSTEM_PROMPT))
            addAll(
                messages.map { msg ->
                    OpenRouterMessage(
                        role = when (msg.role) {
                            ChatRole.USER -> "user"
                            ChatRole.ASSISTANT -> "assistant"
                            ChatRole.SYSTEM -> "system"
                        },
                        content = msg.content,
                    )
                }
            )
        }

        val response = apiService.chat(
            OpenRouterRequest(
                model = MODEL,
                messages = apiMessages,
                maxTokens = 512,
            )
        )

        return response.choices.firstOrNull()?.message?.content
            ?: "I'm unable to respond right now. Please try again."
    }

    override suspend fun generateInsights(apps: List<AppInfo>): List<String> {
        val highRiskApps = apps.filter {
            it.riskLevel == com.privacyguard.ai.domain.model.RiskLevel.HIGH
        }
        val appSummary = apps.take(10).joinToString("\n") { app ->
            "- ${app.appName} (${app.category.displayName}): score ${app.privacyScore}/100"
        }

        val prompt = """
            Based on these installed apps and their privacy scores, generate 4 concise insights:
            $appSummary
            
            Return as a JSON array of 4 insight strings.
        """.trimIndent()

        val response = apiService.chat(
            OpenRouterRequest(
                model = MODEL,
                messages = listOf(
                    OpenRouterMessage(role = "system", content = PRIVACY_SYSTEM_PROMPT),
                    OpenRouterMessage(role = "user", content = prompt),
                ),
                maxTokens = 400,
            )
        )

        val content = response.choices.firstOrNull()?.message?.content ?: return emptyList()

        return try {
            val jsonArray = gson.fromJson(content, com.google.gson.JsonArray::class.java)
            jsonArray.map { it.asString }.take(4)
        } catch (e: Exception) {
            listOf(content)
        }
    }

    companion object {
        private const val PRIVACY_SYSTEM_PROMPT =
            "You are Privacy Guard, a friendly Android privacy and security assistant. " +
                "Explain app permissions, privacy risks, and recommendations in clear, plain language. " +
                "Be concise (under 150 words) unless asked for detail. " +
                "Never invent specific app behaviors you cannot verify."
    }
}
