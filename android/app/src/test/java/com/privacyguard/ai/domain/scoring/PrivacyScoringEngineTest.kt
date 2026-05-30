package com.privacyguard.ai.domain.scoring

import com.privacyguard.ai.domain.model.AppCategory
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.PermissionCatalog
import com.privacyguard.ai.domain.model.RiskLevel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for [PrivacyScoringEngine].
 *
 * Feature 3: Privacy Scoring System
 * Feature 4: App Purpose Validation
 */
class PrivacyScoringEngineTest {

    private lateinit var engine: PrivacyScoringEngine

    @Before
    fun setUp() {
        engine = PrivacyScoringEngine()
    }

    // ── Score band tests ─────────────────────────────────────────────────────

    @Test
    fun `app with no permissions scores 100`() {
        val app = buildApp(
            category = AppCategory.TOOLS,
            permissions = emptyList(),
        )
        val result = engine.score(app)
        assertEquals(100, result.score)
        assertEquals(RiskLevel.SAFE, result.riskLevel)
    }

    @Test
    fun `app with only low-risk permissions scores high`() {
        val app = buildApp(
            category = AppCategory.TOOLS,
            permissions = listOf(
                "android.permission.INTERNET" to true,
                "android.permission.POST_NOTIFICATIONS" to true,
            ),
        )
        val result = engine.score(app)
        assertTrue("Score should be >= 70, was ${result.score}", result.score >= 70)
    }

    @Test
    fun `app with many critical permissions scores low`() {
        val app = buildApp(
            category = AppCategory.GAMES,
            permissions = listOf(
                "android.permission.READ_SMS" to true,
                "android.permission.SEND_SMS" to true,
                "android.permission.RECEIVE_SMS" to true,
                "android.permission.READ_CONTACTS" to true,
                "android.permission.ACCESS_FINE_LOCATION" to true,
                "android.permission.RECORD_AUDIO" to true,
                "android.permission.CAMERA" to true,
            ),
        )
        val result = engine.score(app)
        assertTrue("Score should be < 40, was ${result.score}", result.score < 40)
        assertEquals(RiskLevel.HIGH, result.riskLevel)
    }

    @Test
    fun `background location adds severe penalty`() {
        val appWithout = buildApp(
            category = AppCategory.MAPS,
            permissions = listOf("android.permission.ACCESS_FINE_LOCATION" to true),
        )
        val appWith = buildApp(
            category = AppCategory.MAPS,
            permissions = listOf(
                "android.permission.ACCESS_FINE_LOCATION" to true,
                "android.permission.ACCESS_BACKGROUND_LOCATION" to true,
            ),
        )

        val scoreWithout = engine.score(appWithout).score
        val scoreWith = engine.score(appWith).score

        assertTrue(
            "Background location should reduce score. Without: $scoreWithout, With: $scoreWith",
            scoreWith < scoreWithout,
        )
    }

    // ── Purpose validation tests (Feature 4) ─────────────────────────────────

    @Test
    fun `calculator app with SMS permission fails purpose validation`() {
        val app = buildApp(
            category = AppCategory.TOOLS,
            permissions = listOf(
                "android.permission.READ_SMS" to true,
                "android.permission.READ_CONTACTS" to true,
            ),
        )
        val result = engine.score(app)
        assertFalse(
            "Calculator with SMS should fail purpose validation",
            result.purposeValidation.isValid,
        )
        assertTrue(
            "Should have unexpected permissions",
            result.purposeValidation.unexpectedPermissions.isNotEmpty(),
        )
    }

    @Test
    fun `messaging app with contacts permission passes purpose validation`() {
        val app = buildApp(
            category = AppCategory.COMMUNICATION,
            permissions = listOf(
                "android.permission.READ_CONTACTS" to true,
                "android.permission.RECORD_AUDIO" to true,
                "android.permission.CAMERA" to true,
            ),
        )
        val result = engine.score(app)
        assertTrue(
            "Messaging app with contacts/mic/camera should pass purpose validation",
            result.purposeValidation.isValid,
        )
    }

    @Test
    fun `game app with location permission fails purpose validation`() {
        val app = buildApp(
            category = AppCategory.GAMES,
            permissions = listOf(
                "android.permission.ACCESS_FINE_LOCATION" to true,
                "android.permission.READ_CONTACTS" to true,
            ),
        )
        val result = engine.score(app)
        assertFalse(
            "Game with location and contacts should fail purpose validation",
            result.purposeValidation.isValid,
        )
    }

    // ── Score band boundary tests ─────────────────────────────────────────────

    @Test
    fun `RiskLevel fromScore returns correct bands`() {
        assertEquals(RiskLevel.SAFE, RiskLevel.fromScore(100))
        assertEquals(RiskLevel.SAFE, RiskLevel.fromScore(90))
        assertEquals(RiskLevel.LOW, RiskLevel.fromScore(89))
        assertEquals(RiskLevel.LOW, RiskLevel.fromScore(70))
        assertEquals(RiskLevel.MEDIUM, RiskLevel.fromScore(69))
        assertEquals(RiskLevel.MEDIUM, RiskLevel.fromScore(40))
        assertEquals(RiskLevel.HIGH, RiskLevel.fromScore(39))
        assertEquals(RiskLevel.HIGH, RiskLevel.fromScore(0))
    }

    // ── Device score tests ────────────────────────────────────────────────────

    @Test
    fun `device score with all safe apps is high`() {
        val apps = listOf(
            buildApp(AppCategory.TOOLS, emptyList()),
            buildApp(AppCategory.TOOLS, listOf("android.permission.INTERNET" to true)),
        )
        val deviceScore = engine.scoreAll(apps)
        assertTrue("Device score should be >= 90, was ${deviceScore.score}", deviceScore.score >= 90)
    }

    @Test
    fun `device score with high-risk apps is pulled down`() {
        val safeApp = buildApp(AppCategory.TOOLS, emptyList())
        val highRiskApp = buildApp(
            AppCategory.GAMES,
            listOf(
                "android.permission.READ_SMS" to true,
                "android.permission.READ_CONTACTS" to true,
                "android.permission.ACCESS_FINE_LOCATION" to true,
                "android.permission.RECORD_AUDIO" to true,
            ),
        )
        val deviceScore = engine.scoreAll(listOf(safeApp, highRiskApp))
        assertTrue(
            "High-risk app should pull device score below 70, was ${deviceScore.score}",
            deviceScore.score < 70,
        )
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun buildApp(
        category: AppCategory,
        permissions: List<Pair<String, Boolean>>,
    ): AppInfo = AppInfo(
        packageName = "com.test.app",
        appName = "Test App",
        versionName = "1.0",
        versionCode = 1L,
        developerName = "Test Developer",
        category = category,
        icon = null,
        installTime = System.currentTimeMillis(),
        updateTime = System.currentTimeMillis(),
        isSystemApp = false,
        permissions = permissions.map { (name, granted) ->
            PermissionCatalog.analyze(name, granted)
        },
        privacyScore = null,
        riskLevel = null,
        lastScanAt = System.currentTimeMillis(),
    )
}
