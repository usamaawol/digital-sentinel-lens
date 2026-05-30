package com.privacyguard.ai.domain.model

/**
 * Represents the result of a full device scan.
 *
 * Feature 1: Installed Application Scanner
 * Feature 6: Weekly Privacy Reports
 */
data class ScanResult(
    /** Unique scan identifier */
    val scanId: String,

    /** Unix timestamp (ms) when the scan was performed */
    val scannedAt: Long,

    /** Total number of apps scanned */
    val totalApps: Int,

    /** Number of apps classified as safe or low risk */
    val safeApps: Int,

    /** Number of apps classified as medium risk */
    val mediumRiskApps: Int,

    /** Number of apps classified as high risk */
    val highRiskApps: Int,

    /** Overall device privacy score (0–100), weighted average */
    val overallScore: Int,

    /** List of newly detected apps since the last scan */
    val newApps: List<String>,

    /** List of apps with changed permissions since the last scan */
    val permissionChanges: List<PermissionChange>,

    /** Whether this scan was triggered manually or by background worker */
    val scanType: ScanType,
)

/**
 * Represents a permission change detected between two scans.
 * Feature 10: Background Scanning — permission change detection
 */
data class PermissionChange(
    val packageName: String,
    val appName: String,
    val permissionName: String,
    val permissionDisplayName: String,
    val changeType: PermissionChangeType,
    val detectedAt: Long,
)

enum class PermissionChangeType {
    /** Permission was newly added to the app's manifest */
    ADDED,
    /** Permission was removed from the app's manifest */
    REMOVED,
    /** Permission was granted by the user */
    GRANTED,
    /** Permission was revoked by the user */
    REVOKED,
}

enum class ScanType {
    /** User manually triggered the scan */
    MANUAL,
    /** Triggered by daily WorkManager job */
    DAILY_BACKGROUND,
    /** Triggered by weekly WorkManager job */
    WEEKLY_BACKGROUND,
    /** Triggered by a new app installation */
    NEW_APP_INSTALL,
}
