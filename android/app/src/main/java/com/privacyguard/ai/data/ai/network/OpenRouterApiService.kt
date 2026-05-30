package com.privacyguard.ai.data.ai.network

import com.google.gson.annotations.SerializedName
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Retrofit interface for the OpenRouter API.
 *
 * Feature 7: AI Integration Layer
 *
 * OpenRouter provides a unified API for multiple AI models.
 * Documentation: https://openrouter.ai/docs
 *
 * ⚠️  API KEY INTEGRATION POINT:
 * The Authorization header is injected by [OpenRouterAuthInterceptor].
 * The API key is read from BuildConfig.OPENROUTER_API_KEY which is
 * populated from local.properties — never hardcoded.
 */
interface OpenRouterApiService {

    @POST("chat/completions")
    suspend fun chat(@Body request: OpenRouterRequest): OpenRouterResponse
}

// ── Request models ───────────────────────────────────────────────────────────

data class OpenRouterRequest(
    @SerializedName("model")
    val model: String,

    @SerializedName("messages")
    val messages: List<OpenRouterMessage>,

    @SerializedName("max_tokens")
    val maxTokens: Int = 1024,

    @SerializedName("temperature")
    val temperature: Double = 0.4,

    @SerializedName("response_format")
    val responseFormat: Map<String, String>? = null,
)

data class OpenRouterMessage(
    @SerializedName("role")
    val role: String,

    @SerializedName("content")
    val content: String,
)

// ── Response models ──────────────────────────────────────────────────────────

data class OpenRouterResponse(
    @SerializedName("id")
    val id: String,

    @SerializedName("choices")
    val choices: List<OpenRouterChoice>,

    @SerializedName("usage")
    val usage: OpenRouterUsage?,
)

data class OpenRouterChoice(
    @SerializedName("index")
    val index: Int,

    @SerializedName("message")
    val message: OpenRouterMessage,

    @SerializedName("finish_reason")
    val finishReason: String?,
)

data class OpenRouterUsage(
    @SerializedName("prompt_tokens")
    val promptTokens: Int,

    @SerializedName("completion_tokens")
    val completionTokens: Int,

    @SerializedName("total_tokens")
    val totalTokens: Int,
)
