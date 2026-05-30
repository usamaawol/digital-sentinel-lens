package com.privacyguard.ai.di

import com.privacyguard.ai.BuildConfig
import com.privacyguard.ai.data.ai.MockAiRepository
import com.privacyguard.ai.data.ai.OpenRouterAiRepository
import com.privacyguard.ai.data.ai.network.OpenRouterApiService
import com.privacyguard.ai.data.ai.network.OpenRouterAuthInterceptor
import com.privacyguard.ai.domain.repository.AiRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

/**
 * Hilt module for AI integration.
 *
 * Feature 7: AI Integration Layer
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  API KEY INTEGRATION POINT
 * ═══════════════════════════════════════════════════════════════════════════
 * Currently bound to [MockAiRepository] for testing.
 *
 * To switch to the real OpenRouter implementation:
 * 1. Add OPENROUTER_API_KEY to local.properties
 * 2. Expose it via BuildConfig in app/build.gradle.kts
 * 3. Change the @Binds in [AiBindingModule] from MockAiRepository
 *    to OpenRouterAiRepository
 *
 * The API key is read from BuildConfig.OPENROUTER_API_KEY which is
 * populated from local.properties — NEVER hardcoded in source.
 * ═══════════════════════════════════════════════════════════════════════════
 */
@Module
@InstallIn(SingletonComponent::class)
object AiModule {

    private const val OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/"

    @Provides
    @Named("openrouter_api_key")
    fun provideOpenRouterApiKey(): String {
        // Key is injected from local.properties → BuildConfig at compile time.
        // Never hardcoded. local.properties is gitignored.
        return BuildConfig.OPENROUTER_API_KEY
    }

    @Provides
    @Singleton
    fun provideOpenRouterAuthInterceptor(
        @Named("openrouter_api_key") apiKey: String,
    ): OpenRouterAuthInterceptor = OpenRouterAuthInterceptor(apiKey)

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: OpenRouterAuthInterceptor,
    ): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(OPENROUTER_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    @Provides
    @Singleton
    fun provideOpenRouterApiService(retrofit: Retrofit): OpenRouterApiService =
        retrofit.create(OpenRouterApiService::class.java)
}

/**
 * Separate module for AI repository binding.
 * Kept separate from [AiModule] because @Binds and @Provides cannot coexist
 * in the same abstract module.
 *
 * ⚠️  To switch to real AI: change MockAiRepository to OpenRouterAiRepository below.
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class AiBindingModule {

    /**
     * ⚠️  API KEY CONFIGURED — using OpenRouterAiRepository.
     * Key is stored in local.properties → BuildConfig.OPENROUTER_API_KEY
     */
    @Binds
    @Singleton
    abstract fun bindAiRepository(impl: OpenRouterAiRepository): AiRepository

    // To revert to mock (no API key needed):
    // @Binds
    // @Singleton
    // abstract fun bindAiRepository(impl: MockAiRepository): AiRepository
}
