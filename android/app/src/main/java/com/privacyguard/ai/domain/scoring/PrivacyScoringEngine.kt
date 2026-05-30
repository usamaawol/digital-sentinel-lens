package com.privacyguard.ai.domain.scoring

import com.privacyguard.ai.domain.model.AppCategory
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.PermissionGroup
import com.privacyguard.ai.domain.model.PermissionInfo
import com.privacyguard.ai.domain.model.PermissionRisk
import com.privacyguard.ai.domain.model.RiskLevel
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.max
import kotlin.math.min

/**
 * Privacy Scoring Engine — computes a 0–100 privacy score for each app.
 *
 * Feature 3: Privacy Scoring System
 * Feature 4: App Purpose Validation
 *
 * Score Bands:
 *   90–100 = Safe
 *   70–89  = Low Risk
 *   40–69  = Medium Risk
 *   0–39   = High Risk
 *
 * Scoring Factors:
 *   1. Dangerous permission count (penalty per dangerous permission)
 *   2. Permission risk weights (CRITICAL > HIGH > MEDIUM > LOW)
 *   3. Permission relevance to app category (purpose mismatch penalty)
 *   4. Background location penalty (severe)
 *   5. System app bonus (system apps are generally more trusted)
 *
 * The engine is pure Kotlin with no Android dependencies — fully testable.
 */
@Singleton
class PrivacyScoringEngine @Inject constructor() {

    /**
     * Computes the privacy score for a single app.
     *
     * @param app The app to score (permissions must already be analyzed)
     * @return [ScoringResult] containing the score, risk level, and breakdown
     */
    fun score(app: AppInfo): ScoringResult {
        val grantedPermissions = app.permissions.filter { it.isGranted }
        val dangerousGranted = grantedPermissions.filter { it.isDangerous }

        // Start at 100 and subtract penalties
        var score = 100

        // ── Factor 1: Dangerous permission count ────────────────────────────
        // Each dangerous permission costs points. More permissions = more risk.
        val dangerousCount = dangerousGranted.size
        val countPenalty = when {
            dangerousCount == 0 -> 0
            dangerousCount <= 2 -> 5
            dangerousCount <= 4 -> 12
            dangerousCount <= 6 -> 20
            dangerousCount <= 8 -> 28
            else -> 35
        }
        score -= countPenalty

        // ── Factor 2: Permission risk weights ───────────────────────────────
        // Sum the risk weights of all granted dangerous permissions.
        val totalRiskWeight = dangerousGranted.sumOf { it.riskLevel.weight }
        val riskWeightPenalty = min(40, totalRiskWeight * 2)
        score -= riskWeightPenalty

        // ── Factor 3: Purpose mismatch (Feature 4) ──────────────────────────
        val mismatchPenalty = computePurposeMismatchPenalty(app.category, dangerousGranted)
        score -= mismatchPenalty

        // ── Factor 4: Background location is a severe penalty ───────────────
        val hasBackgroundLocation = grantedPermissions.any {
            it.permissionName == "android.permission.ACCESS_BACKGROUND_LOCATION"
        }
        if (hasBackgroundLocation) score -= 15

        // ── Factor 5: System app slight bonus ───────────────────────────────
        if (app.isSystemApp) score += 5

        // Clamp to [0, 100]
        score = max(0, min(100, score))

        val riskLevel = RiskLevel.fromScore(score)

        return ScoringResult(
            packageName = app.packageName,
            score = score,
            riskLevel = riskLevel,
            breakdown = ScoringBreakdown(
                baseScore = 100,
                dangerousCountPenalty = countPenalty,
                riskWeightPenalty = riskWeightPenalty,
                purposeMismatchPenalty = mismatchPenalty,
                backgroundLocationPenalty = if (hasBackgroundLocation) 15 else 0,
                systemAppBonus = if (app.isSystemApp) 5 else 0,
                finalScore = score,
            ),
            purposeValidation = validatePurpose(app.category, dangerousGranted),
        )
    }

    /**
     * Scores a list of apps and returns the overall device privacy score.
     * The overall score is a weighted average (lower-scored apps have more weight).
     */
    fun scoreAll(apps: List<AppInfo>): DevicePrivacyScore {
        if (apps.isEmpty()) return DevicePrivacyScore(score = 100, appScores = emptyList())

        val results = apps.map { score(it) }

        // Weighted average: high-risk apps pull the score down more
        val weightedSum = results.sumOf { result ->
            val weight = when (result.riskLevel) {
                RiskLevel.HIGH -> 3.0
                RiskLevel.MEDIUM -> 2.0
                RiskLevel.LOW -> 1.5
                RiskLevel.SAFE -> 1.0
            }
            result.score * weight
        }
        val totalWeight = results.sumOf { result ->
            when (result.riskLevel) {
                RiskLevel.HIGH -> 3.0
                RiskLevel.MEDIUM -> 2.0
                RiskLevel.LOW -> 1.5
                RiskLevel.SAFE -> 1.0
            }
        }

        val overallScore = (weightedSum / totalWeight).toInt().coerceIn(0, 100)

        return DevicePrivacyScore(
            score = overallScore,
            appScores = results,
        )
    }

    // ── Purpose Mismatch Detection (Feature 4) ──────────────────────────────

    /**
     * Computes a penalty for permissions that don't match the app's stated purpose.
     *
     * Example: A calculator app requesting CAMERA or READ_CONTACTS is suspicious.
     */
    private fun computePurposeMismatchPenalty(
        category: AppCategory,
        grantedDangerousPermissions: List<PermissionInfo>,
    ): Int {
        val expectedGroups = getExpectedPermissionGroups(category)
        val unexpectedPermissions = grantedDangerousPermissions.filter { perm ->
            perm.group !in expectedGroups
        }

        return when (unexpectedPermissions.size) {
            0 -> 0
            1 -> 5
            2 -> 12
            3 -> 20
            else -> 28
        }
    }

    /**
     * Validates whether an app's permissions match its category.
     * Returns a [PurposeValidationResult] with details.
     *
     * Feature 4: App Purpose Validation
     */
    fun validatePurpose(
        category: AppCategory,
        grantedDangerousPermissions: List<PermissionInfo>,
    ): PurposeValidationResult {
        val expectedGroups = getExpectedPermissionGroups(category)
        val unexpectedPermissions = grantedDangerousPermissions.filter { perm ->
            perm.group !in expectedGroups
        }

        return if (unexpectedPermissions.isEmpty()) {
            PurposeValidationResult(
                isValid = true,
                category = category,
                unexpectedPermissions = emptyList(),
                explanation = "All permissions appear consistent with the app's purpose as a ${category.displayName} app.",
            )
        } else {
            val permNames = unexpectedPermissions.joinToString(", ") { it.displayName }
            PurposeValidationResult(
                isValid = false,
                category = category,
                unexpectedPermissions = unexpectedPermissions,
                explanation = "This ${category.displayName} app requests permissions that appear unrelated to its primary purpose: $permNames. " +
                    "This may indicate data collection for advertising or other purposes.",
            )
        }
    }

    /**
     * Returns the set of permission groups that are expected/normal for a given app category.
     * Any permission outside this set is flagged as a potential mismatch.
     */
    private fun getExpectedPermissionGroups(category: AppCategory): Set<PermissionGroup> =
        when (category) {
            AppCategory.COMMUNICATION -> setOf(
                PermissionGroup.CONTACTS,
                PermissionGroup.MICROPHONE,
                PermissionGroup.CAMERA,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.SOCIAL -> setOf(
                PermissionGroup.CAMERA,
                PermissionGroup.MICROPHONE,
                PermissionGroup.LOCATION,
                PermissionGroup.CONTACTS,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.TOOLS -> setOf(
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.GAMES -> setOf(
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.BLUETOOTH, // for game controllers
            )
            AppCategory.PRODUCTIVITY -> setOf(
                PermissionGroup.STORAGE,
                PermissionGroup.CALENDAR,
                PermissionGroup.CONTACTS,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.CAMERA, // document scanning
            )
            AppCategory.FINANCE -> setOf(
                PermissionGroup.CAMERA, // check deposit
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.STORAGE,
            )
            AppCategory.HEALTH -> setOf(
                PermissionGroup.SENSORS,
                PermissionGroup.LOCATION,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.MICROPHONE, // meditation apps
            )
            AppCategory.MAPS, AppCategory.TRAVEL -> setOf(
                PermissionGroup.LOCATION,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.MICROPHONE, // voice navigation
                PermissionGroup.CONTACTS, // share location
            )
            AppCategory.PHOTOGRAPHY -> setOf(
                PermissionGroup.CAMERA,
                PermissionGroup.STORAGE,
                PermissionGroup.LOCATION, // geotagging
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.MUSIC -> setOf(
                PermissionGroup.STORAGE,
                PermissionGroup.MICROPHONE, // voice search
                PermissionGroup.BLUETOOTH,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.BROWSER -> setOf(
                PermissionGroup.LOCATION,
                PermissionGroup.CAMERA,
                PermissionGroup.MICROPHONE,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.SHOPPING -> setOf(
                PermissionGroup.CAMERA, // barcode scanning
                PermissionGroup.LOCATION,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.EDUCATION -> setOf(
                PermissionGroup.CAMERA,
                PermissionGroup.MICROPHONE,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.NEWS -> setOf(
                PermissionGroup.LOCATION,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.STORAGE,
            )
            AppCategory.ENTERTAINMENT -> setOf(
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.MICROPHONE, // voice control
            )
            AppCategory.FOOD, AppCategory.LIFESTYLE -> setOf(
                PermissionGroup.LOCATION,
                PermissionGroup.CAMERA,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
            )
            AppCategory.BUSINESS -> setOf(
                PermissionGroup.CAMERA,
                PermissionGroup.CONTACTS,
                PermissionGroup.CALENDAR,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.NETWORK,
                PermissionGroup.MICROPHONE,
            )
            AppCategory.UNKNOWN -> setOf(
                // Unknown category — don't penalize
                PermissionGroup.CAMERA,
                PermissionGroup.MICROPHONE,
                PermissionGroup.LOCATION,
                PermissionGroup.CONTACTS,
                PermissionGroup.SMS,
                PermissionGroup.PHONE,
                PermissionGroup.STORAGE,
                PermissionGroup.NOTIFICATIONS,
                PermissionGroup.CALENDAR,
                PermissionGroup.SENSORS,
                PermissionGroup.BLUETOOTH,
                PermissionGroup.NETWORK,
                PermissionGroup.SYSTEM,
                PermissionGroup.OTHER,
            )
        }
}

// ── Result Models ────────────────────────────────────────────────────────────

/**
 * Result of scoring a single app.
 */
data class ScoringResult(
    val packageName: String,
    val score: Int,
    val riskLevel: RiskLevel,
    val breakdown: ScoringBreakdown,
    val purposeValidation: PurposeValidationResult,
)

/**
 * Detailed breakdown of how the score was computed.
 * Useful for debugging and explaining scores to users.
 */
data class ScoringBreakdown(
    val baseScore: Int,
    val dangerousCountPenalty: Int,
    val riskWeightPenalty: Int,
    val purposeMismatchPenalty: Int,
    val backgroundLocationPenalty: Int,
    val systemAppBonus: Int,
    val finalScore: Int,
)

/**
 * Result of purpose validation for an app.
 * Feature 4: App Purpose Validation
 */
data class PurposeValidationResult(
    val isValid: Boolean,
    val category: AppCategory,
    val unexpectedPermissions: List<PermissionInfo>,
    val explanation: String,
)

/**
 * Overall device privacy score with per-app breakdown.
 */
data class DevicePrivacyScore(
    val score: Int,
    val appScores: List<ScoringResult>,
) {
    val riskLevel: RiskLevel get() = RiskLevel.fromScore(score)
    val safeCount: Int get() = appScores.count { it.riskLevel == RiskLevel.SAFE }
    val lowCount: Int get() = appScores.count { it.riskLevel == RiskLevel.LOW }
    val mediumCount: Int get() = appScores.count { it.riskLevel == RiskLevel.MEDIUM }
    val highCount: Int get() = appScores.count { it.riskLevel == RiskLevel.HIGH }
}
