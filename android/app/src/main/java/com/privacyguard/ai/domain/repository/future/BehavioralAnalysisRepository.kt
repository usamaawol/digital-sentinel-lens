package com.privacyguard.ai.domain.repository.future

import kotlinx.coroutines.flow.Flow

/**
 * Future Feature: Behavioral Analysis & AI Anomaly Detection
 *
 * Architecture stub — NOT yet implemented.
 *
 * This interface defines the contract for future behavioral analysis capabilities.
 * Implementation will require:
 * - UsageStatsManager (android.permission.PACKAGE_USAGE_STATS)
 * - AccessibilityService for real-time monitoring
 * - ML model for anomaly detection
 *
 * ⚠️  This is a STUB. Do not implement until the behavioral analysis feature is scoped.
 */
interface BehavioralAnalysisRepository {

    /**
     * Observes app usage events for behavioral pattern analysis.
     */
    fun observeUsageEvents(): Flow<List<AppUsageEvent>>

    /**
     * Detects anomalous behavior patterns using AI/ML.
     * Returns a list of anomalies detected in the last 24 hours.
     */
    suspend fun detectAnomalies(): List<BehavioralAnomaly>

    /**
     * Returns the usage statistics for all apps over the last N days.
     */
    suspend fun getUsageStats(days: Int): List<AppUsageStats>
}

/** Stub model for an app usage event */
data class AppUsageEvent(
    val packageName: String,
    val eventType: UsageEventType,
    val timestamp: Long,
    val permissionAccessed: String?,
)

enum class UsageEventType {
    APP_FOREGROUND,
    APP_BACKGROUND,
    PERMISSION_ACCESSED,
    NOTIFICATION_SENT,
    NETWORK_REQUEST,
}

/** Stub model for a behavioral anomaly */
data class BehavioralAnomaly(
    val packageName: String,
    val anomalyType: AnomalyType,
    val description: String,
    val severity: AnomalySeverity,
    val detectedAt: Long,
)

enum class AnomalyType {
    UNUSUAL_PERMISSION_ACCESS,
    BACKGROUND_ACTIVITY_SPIKE,
    NETWORK_TRAFFIC_SPIKE,
    UNUSUAL_WAKE_LOCK,
    LOCATION_ACCESS_PATTERN,
}

enum class AnomalySeverity {
    LOW, MEDIUM, HIGH, CRITICAL
}

/** Stub model for app usage statistics */
data class AppUsageStats(
    val packageName: String,
    val totalForegroundTime: Long,
    val totalBackgroundTime: Long,
    val launchCount: Int,
    val lastUsed: Long,
)
