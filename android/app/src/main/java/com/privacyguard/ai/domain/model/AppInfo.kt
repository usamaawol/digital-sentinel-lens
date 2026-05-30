package com.privacyguard.ai.domain.model

import android.graphics.drawable.Drawable

/**
 * Domain model representing a scanned Android application.
 *
 * This is the core entity of the Privacy Guard AI system. It is technology-agnostic
 * and lives in the domain layer — no Android framework imports except Drawable
 * (which is unavoidable for icon representation at this layer).
 *
 * Feature 1: Installed Application Scanner
 * Feature 2: Permission Analysis Engine
 * Feature 3: Privacy Scoring System
 */
data class AppInfo(
    /** Unique identifier — the Android package name (e.g. com.whatsapp) */
    val packageName: String,

    /** Human-readable application name */
    val appName: String,

    /** Application version string (e.g. "2.24.18.79") */
    val versionName: String,

    /** Application version code (integer) */
    val versionCode: Long,

    /** Developer / publisher name extracted from signing certificate or Play Store */
    val developerName: String,

    /** App category from PackageManager (e.g. "Social", "Tools") */
    val category: AppCategory,

    /** App icon drawable — nullable because it may fail to load */
    val icon: Drawable?,

    /** Unix timestamp (ms) when the app was first installed */
    val installTime: Long,

    /** Unix timestamp (ms) when the app was last updated */
    val updateTime: Long,

    /** Whether the app is a system app */
    val isSystemApp: Boolean,

    /** List of all permissions declared in the app's manifest */
    val permissions: List<PermissionInfo>,

    /** Computed privacy score (0–100). Null until scoring engine runs. */
    val privacyScore: Int?,

    /** Computed risk level. Null until scoring engine runs. */
    val riskLevel: RiskLevel?,

    /** ISO-8601 timestamp of the last scan */
    val lastScanAt: Long?,
)

/**
 * App category classification used by the purpose validation engine.
 * Feature 4: App Purpose Validation
 */
enum class AppCategory(val displayName: String) {
    COMMUNICATION("Communication"),
    SOCIAL("Social"),
    TOOLS("Tools"),
    GAMES("Games"),
    PRODUCTIVITY("Productivity"),
    FINANCE("Finance"),
    HEALTH("Health & Fitness"),
    SHOPPING("Shopping"),
    ENTERTAINMENT("Entertainment"),
    EDUCATION("Education"),
    TRAVEL("Travel"),
    BROWSER("Browser"),
    MUSIC("Music & Audio"),
    PHOTOGRAPHY("Photography"),
    NEWS("News & Magazines"),
    MAPS("Maps & Navigation"),
    FOOD("Food & Drink"),
    LIFESTYLE("Lifestyle"),
    BUSINESS("Business"),
    UNKNOWN("Unknown");

    companion object {
        /**
         * Maps Android PackageManager category constants to our domain enum.
         * android.content.pm.ApplicationInfo.CATEGORY_*
         */
        fun fromAndroidCategory(category: Int): AppCategory = when (category) {
            0 -> UNKNOWN          // CATEGORY_UNDEFINED
            1 -> GAMES            // CATEGORY_GAME
            2 -> MUSIC            // CATEGORY_AUDIO
            3 -> ENTERTAINMENT    // CATEGORY_VIDEO
            4 -> PHOTOGRAPHY      // CATEGORY_IMAGE
            5 -> SOCIAL           // CATEGORY_SOCIAL
            6 -> NEWS             // CATEGORY_NEWS
            7 -> MAPS             // CATEGORY_MAPS
            8 -> PRODUCTIVITY     // CATEGORY_PRODUCTIVITY
            else -> UNKNOWN
        }
    }
}

/**
 * Risk level classification used across the entire application.
 * Feature 3: Privacy Scoring System
 */
enum class RiskLevel(val displayName: String, val scoreRange: IntRange) {
    SAFE("Safe", 90..100),
    LOW("Low Risk", 70..89),
    MEDIUM("Medium Risk", 40..69),
    HIGH("High Risk", 0..39);

    companion object {
        fun fromScore(score: Int): RiskLevel = when {
            score >= 90 -> SAFE
            score >= 70 -> LOW
            score >= 40 -> MEDIUM
            else -> HIGH
        }
    }
}
