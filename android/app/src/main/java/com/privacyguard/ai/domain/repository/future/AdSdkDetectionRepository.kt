package com.privacyguard.ai.domain.repository.future

/**
 * Future Feature: Ad SDK & Tracker Detection
 *
 * Architecture stub — NOT yet implemented.
 *
 * This interface defines the contract for detecting advertising SDKs
 * and tracking libraries embedded in installed apps.
 *
 * Implementation approach:
 * - Analyze APK contents using PackageManager
 * - Match against known tracker/ad SDK signatures database
 * - Cross-reference with Exodus Privacy tracker database
 *
 * ⚠️  This is a STUB. Do not implement until the tracker detection feature is scoped.
 */
interface AdSdkDetectionRepository {

    /**
     * Scans an app for known advertising and tracking SDKs.
     *
     * @param packageName The package to scan
     * @return List of detected SDKs
     */
    suspend fun detectSdks(packageName: String): List<DetectedSdk>

    /**
     * Returns the full tracker database (sourced from Exodus Privacy).
     */
    suspend fun getTrackerDatabase(): List<TrackerDefinition>

    /**
     * Updates the local tracker database from the remote source.
     */
    suspend fun updateTrackerDatabase()
}

/** Stub model for a detected SDK */
data class DetectedSdk(
    val sdkName: String,
    val sdkVersion: String?,
    val category: SdkCategory,
    val privacyRisk: SdkPrivacyRisk,
    val description: String,
    val website: String?,
)

enum class SdkCategory {
    ADVERTISING,
    ANALYTICS,
    CRASH_REPORTING,
    SOCIAL,
    PAYMENT,
    LOCATION,
    PUSH_NOTIFICATIONS,
    DEVELOPMENT_TOOLS,
    UNKNOWN,
}

enum class SdkPrivacyRisk {
    LOW, MEDIUM, HIGH, CRITICAL
}

/** Stub model for a tracker definition in the database */
data class TrackerDefinition(
    val id: String,
    val name: String,
    val website: String,
    val categories: List<SdkCategory>,
    val networkSignatures: List<String>,
    val codeSignatures: List<String>,
)
