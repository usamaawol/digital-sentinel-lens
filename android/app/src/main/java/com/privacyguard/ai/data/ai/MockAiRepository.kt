package com.privacyguard.ai.data.ai

import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.PermissionRisk
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.repository.ChatMessage
import com.privacyguard.ai.domain.repository.ChatRole
import com.privacyguard.ai.domain.repository.PolicyAnalysis
import com.privacyguard.ai.domain.repository.PolicyRiskLevel
import kotlinx.coroutines.delay
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Mock implementation of [AiRepository].
 *
 * Feature 7: AI Integration Layer — Mock implementations for testing
 * Feature 9: AI Privacy Assistant — Mock responses
 *
 * This implementation is used when:
 * - No OpenRouter API key is configured
 * - Running in test environments
 * - Demonstrating the app without a live API connection
 *
 * Replace with [OpenRouterAiRepository] when the API key is available.
 *
 * ⚠️  API KEY INTEGRATION POINT:
 * When the OpenRouter API key is provided, update the Hilt module in
 * [AiModule] to bind [OpenRouterAiRepository] instead of this class.
 * The API key should be stored in local.properties and accessed via BuildConfig.
 */
@Singleton
class MockAiRepository @Inject constructor() : AiRepository {

    override suspend fun analyzePrivacyPolicy(policyText: String): PolicyAnalysis {
        // Simulate network delay
        delay(1200)

        // Simple heuristic analysis based on keyword detection
        val lowerText = policyText.lowercase()

        val dataCollected = buildList {
            if ("email" in lowerText) add("Email address")
            if ("location" in lowerText || "gps" in lowerText) add("Location data")
            if ("camera" in lowerText || "photo" in lowerText) add("Photos and camera access")
            if ("contact" in lowerText) add("Contact list")
            if ("device" in lowerText || "identifier" in lowerText) add("Device identifiers")
            if ("usage" in lowerText || "analytics" in lowerText) add("Usage analytics")
            if ("payment" in lowerText || "billing" in lowerText) add("Payment information")
            if (isEmpty()) add("Basic account information")
        }

        val thirdPartySharing = buildList {
            if ("advertis" in lowerText || "marketing" in lowerText) add("Advertising partners")
            if ("analytics" in lowerText || "google analytics" in lowerText) add("Analytics providers")
            if ("facebook" in lowerText || "meta" in lowerText) add("Meta / Facebook")
            if ("third party" in lowerText || "third-party" in lowerText) add("Third-party service providers")
            if (isEmpty()) add("No third-party sharing detected")
        }

        val riskLevel = when {
            "sell" in lowerText && "data" in lowerText -> PolicyRiskLevel.HIGH
            thirdPartySharing.size >= 3 -> PolicyRiskLevel.HIGH
            dataCollected.size >= 5 -> PolicyRiskLevel.MEDIUM
            "location" in lowerText && "third" in lowerText -> PolicyRiskLevel.MEDIUM
            else -> PolicyRiskLevel.LOW
        }

        return PolicyAnalysis(
            summary = buildMockSummary(dataCollected, thirdPartySharing, riskLevel),
            dataCollected = dataCollected,
            thirdPartySharing = thirdPartySharing,
            retention = "Data is retained for the duration of your account plus up to 90 days after deletion.",
            riskLevel = riskLevel,
            recommendation = buildMockRecommendation(riskLevel),
        )
    }

    override suspend fun explainPermissionRisk(
        permissionName: String,
        appName: String,
        appCategory: String,
    ): String {
        delay(300)
        return when {
            "CAMERA" in permissionName ->
                "$appName requests camera access. For a $appCategory app, this is " +
                    "typically used for photo capture or video calls. Ensure you only grant " +
                    "this permission when actively using camera features."

            "RECORD_AUDIO" in permissionName ->
                "$appName requests microphone access. This allows the app to record audio. " +
                    "Be cautious — some apps activate the microphone in the background."

            "ACCESS_FINE_LOCATION" in permissionName ->
                "$appName requests your precise GPS location. For a $appCategory app, " +
                    "consider whether location is truly necessary. Set to 'While in use' only."

            "READ_CONTACTS" in permissionName ->
                "$appName wants to read your contact list. This data is often uploaded to " +
                    "remote servers. Only grant this if the app genuinely needs to interact with your contacts."

            "READ_SMS" in permissionName ->
                "⚠️ $appName requests access to your SMS messages. This is a high-risk permission " +
                    "that can expose OTP codes and private conversations. Only grant to dedicated SMS apps."

            else ->
                "$appName requests the $permissionName permission. Review whether this is " +
                    "necessary for the app's core functionality before granting."
        }
    }

    override suspend fun generateRecommendations(app: AppInfo): List<String> {
        delay(500)
        val recommendations = mutableListOf<String>()

        val highRiskPerms = app.permissions.filter {
            it.isGranted && it.riskLevel == PermissionRisk.HIGH
        }
        val criticalPerms = app.permissions.filter {
            it.isGranted && it.riskLevel == PermissionRisk.CRITICAL
        }

        if (criticalPerms.isNotEmpty()) {
            recommendations.add(
                "⚠️ ${app.appName} has ${criticalPerms.size} critical permission(s) granted. " +
                    "Review ${criticalPerms.joinToString(", ") { it.displayName }} immediately."
            )
        }

        if (highRiskPerms.size >= 3) {
            recommendations.add(
                "${app.appName} has ${highRiskPerms.size} high-risk permissions. " +
                    "Consider revoking permissions you don't actively use."
            )
        }

        val hasBackgroundLocation = app.permissions.any {
            it.isGranted && it.permissionName == "android.permission.ACCESS_BACKGROUND_LOCATION"
        }
        if (hasBackgroundLocation) {
            recommendations.add(
                "Background location is enabled for ${app.appName}. " +
                    "Change to 'While in use' in Settings → Apps → ${app.appName} → Permissions."
            )
        }

        if (app.riskLevel == RiskLevel.HIGH) {
            recommendations.add(
                "Consider uninstalling ${app.appName} or reviewing its permissions carefully. " +
                    "Its privacy score of ${app.privacyScore}/100 indicates significant privacy risks."
            )
        }

        if (recommendations.isEmpty()) {
            recommendations.add(
                "${app.appName} appears to have reasonable permissions for its category. " +
                    "Continue monitoring for any permission changes."
            )
        }

        return recommendations
    }

    override suspend fun chat(messages: List<ChatMessage>): String {
        delay(800)

        val lastUserMessage = messages.lastOrNull { it.role == ChatRole.USER }?.content
            ?: return "I'm here to help with your privacy questions. What would you like to know?"

        val lowerMessage = lastUserMessage.lowercase()

        return when {
            "safe" in lowerMessage && ("app" in lowerMessage || "tiktok" in lowerMessage) ->
                "Based on the scan results, TikTok has a privacy score of 32/100 — classified as High Risk. " +
                    "It requests camera, microphone, and location access, which are used for content creation " +
                    "but also for ad targeting. If you use it, set location to 'While in use' and review " +
                    "microphone access settings."

            "permission" in lowerMessage && ("why" in lowerMessage || "need" in lowerMessage) ->
                "Apps request permissions to access device features they need to function. " +
                    "However, some apps request more permissions than necessary — often for advertising " +
                    "or data collection. A good rule: if a permission doesn't make sense for what the app does, " +
                    "don't grant it."

            "privacy policy" in lowerMessage || "policy" in lowerMessage ->
                "Privacy policies explain how an app collects, uses, and shares your data. " +
                    "Key things to look for: what data is collected, who it's shared with, " +
                    "and how long it's retained. Use the Policy Analyzer feature to get a plain-English " +
                    "breakdown of any policy."

            "highest risk" in lowerMessage || "most dangerous" in lowerMessage ->
                "Based on your latest scan, the highest-risk apps are those with privacy scores below 40. " +
                    "Look for apps that request SMS, contacts, or background location without a clear reason. " +
                    "Check the Apps section filtered by 'High Risk' for your full list."

            "disable" in lowerMessage || "revoke" in lowerMessage ->
                "To revoke a permission: go to Settings → Apps → [App Name] → Permissions. " +
                    "You can toggle individual permissions off. For location, you can also choose " +
                    "'While in use' instead of 'Always allow' for better privacy."

            "location" in lowerMessage ->
                "Location is one of the most sensitive permissions. Apps can use it to track your movements, " +
                    "build behavioral profiles, and target ads. Best practice: set all location permissions " +
                    "to 'While in use' and only grant 'Always allow' to navigation apps you trust."

            "camera" in lowerMessage ->
                "Camera access allows apps to take photos and videos. While legitimate for photo and video apps, " +
                    "be cautious with apps that request camera access without an obvious need. " +
                    "Android will show a green indicator when the camera is active."

            "microphone" in lowerMessage ->
                "Microphone access allows apps to record audio. This is high-risk because some apps " +
                    "can activate the microphone in the background. Android 12+ shows an orange indicator " +
                    "when the microphone is in use. Check which apps have this permission in your scan results."

            else ->
                "That's a great privacy question. In general, the best practices are: " +
                    "1) Only grant permissions that make sense for the app's purpose, " +
                    "2) Prefer 'While in use' over 'Always allow' for location, " +
                    "3) Regularly review and revoke unused permissions, " +
                    "4) Be skeptical of free apps that request many sensitive permissions — " +
                    "if you're not paying, your data may be the product."
        }
    }

    override suspend fun generateInsights(apps: List<AppInfo>): List<String> {
        delay(200)
        val insights = mutableListOf<String>()

        val highRiskApps = apps.filter { it.riskLevel == RiskLevel.HIGH }
        val appsWithCamera = apps.filter { app ->
            app.permissions.any { it.isGranted && "CAMERA" in it.permissionName }
        }
        val appsWithLocation = apps.filter { app ->
            app.permissions.any { it.isGranted && "LOCATION" in it.permissionName }
        }
        val appsWithMic = apps.filter { app ->
            app.permissions.any { it.isGranted && "RECORD_AUDIO" in it.permissionName }
        }

        if (highRiskApps.isNotEmpty()) {
            insights.add(
                "${highRiskApps.size} app${if (highRiskApps.size > 1) "s" else ""} " +
                    "(${highRiskApps.joinToString(", ") { it.appName }}) " +
                    "${if (highRiskApps.size > 1) "are" else "is"} classified as High Risk. Review immediately."
            )
        }

        if (appsWithCamera.size > 3) {
            insights.add(
                "${appsWithCamera.size} apps have camera access. " +
                    "Consider revoking camera from apps that don't actively use it."
            )
        }

        if (appsWithLocation.size > 2) {
            insights.add(
                "${appsWithLocation.size} apps can access your location. " +
                    "Ensure all are set to 'While in use' rather than 'Always allow'."
            )
        }

        if (appsWithMic.isNotEmpty()) {
            insights.add(
                "${appsWithMic.size} app${if (appsWithMic.size > 1) "s have" else " has"} microphone access. " +
                    "Monitor for unexpected audio recording activity."
            )
        }

        if (insights.isEmpty()) {
            insights.add("Your device privacy posture looks good. Keep reviewing new app installs.")
        }

        return insights.take(4)
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private fun buildMockSummary(
        dataCollected: List<String>,
        thirdPartySharing: List<String>,
        riskLevel: PolicyRiskLevel,
    ): String {
        val riskText = when (riskLevel) {
            PolicyRiskLevel.LOW -> "relatively privacy-friendly"
            PolicyRiskLevel.MEDIUM -> "moderately privacy-invasive"
            PolicyRiskLevel.HIGH -> "significantly privacy-invasive"
        }
        return "This privacy policy is $riskText. The service collects ${dataCollected.size} categories of data " +
            "and shares information with ${thirdPartySharing.size} type(s) of third parties. " +
            "Key data points include: ${dataCollected.take(3).joinToString(", ")}."
    }

    private fun buildMockRecommendation(riskLevel: PolicyRiskLevel): String = when (riskLevel) {
        PolicyRiskLevel.LOW ->
            "This policy appears reasonable. Review the data retention section and ensure " +
                "you're comfortable with what's collected before using the service."
        PolicyRiskLevel.MEDIUM ->
            "This policy has some concerning elements. Consider whether the data collection " +
                "is proportionate to the service provided. Review third-party sharing carefully."
        PolicyRiskLevel.HIGH ->
            "This policy raises significant privacy concerns. The service collects extensive data " +
                "and shares it broadly. Consider using an alternative service with stronger privacy protections."
    }
}
