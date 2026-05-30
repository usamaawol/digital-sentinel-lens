package com.privacyguard.ai.data.ai.network

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Named

/**
 * OkHttp interceptor that adds the OpenRouter Authorization header to all requests.
 *
 * Feature 7: AI Integration Layer
 *
 * ⚠️  API KEY INTEGRATION POINT:
 * The API key is injected via Hilt from BuildConfig.OPENROUTER_API_KEY.
 * To configure:
 *
 * 1. Add to local.properties (never commit this file):
 *    OPENROUTER_API_KEY=sk-or-v1-your-key-here
 *
 * 2. In app/build.gradle.kts, add to defaultConfig:
 *    val properties = java.util.Properties()
 *    properties.load(rootProject.file("local.properties").inputStream())
 *    buildConfigField(
 *        "String",
 *        "OPENROUTER_API_KEY",
 *        "\"${properties.getProperty("OPENROUTER_API_KEY", "")}\""
 *    )
 *
 * 3. The key is then available as BuildConfig.OPENROUTER_API_KEY
 *    and injected into this interceptor via the Hilt module.
 */
class OpenRouterAuthInterceptor @Inject constructor(
    @Named("openrouter_api_key") private val apiKey: String,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("Content-Type", "application/json")
            .addHeader("HTTP-Referer", "https://privacy-guard.lovable.app")
            .addHeader("X-Title", "Privacy Guard AI")
            .build()
        return chain.proceed(request)
    }
}
