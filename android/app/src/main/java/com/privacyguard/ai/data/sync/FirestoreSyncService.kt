package com.privacyguard.ai.data.sync

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.PrivacyReport
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.domain.repository.ScanRepository
import kotlinx.coroutines.tasks.await
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Service responsible for syncing Android scan data to Firestore.
 *
 * This bridges the Android native scan results to the web dashboard.
 * The web frontend reads from the same Firestore collections that this
 * service writes to.
 *
 * Firestore Schema (matches web frontend expectations):
 *
 * users/{userId}/
 *   apps/{packageName}/
 *     - id: string (packageName with dots replaced by underscores)
 *     - name: string
 *     - packageName: string
 *     - developer: string
 *     - version: string
 *     - category: string
 *     - icon: string (emoji placeholder — real icons not stored in Firestore)
 *     - privacyScore: number
 *     - riskLevel: "safe" | "low" | "medium" | "high"
 *     - lastScan: ISO string
 *     - permissions: array of permission objects
 *
 *   reports/{reportId}/
 *     - reportDate: ISO string
 *     - overallScore: number
 *     - scoreDelta: number
 *     - newAppsCount: number
 *     - permissionChangesCount: number
 *
 *   notifications/{notificationId}/
 *     - type: string
 *     - title: string
 *     - message: string
 *     - time: ISO string
 *     - read: boolean
 */
@Singleton
class FirestoreSyncService @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth,
    private val appRepository: AppRepository,
    private val scanRepository: ScanRepository,
    private val reportRepository: ReportRepository,
) {

    /**
     * Syncs all app scan data to Firestore for the current user.
     * Called after each scan completes.
     */
    suspend fun syncApps(apps: List<AppInfo>) {
        val userId = auth.currentUser?.uid ?: run {
            Timber.w("Cannot sync — user not authenticated")
            return
        }

        try {
            val batch = firestore.batch()
            val appsRef = firestore.collection("users").document(userId).collection("apps")

            apps.forEach { app ->
                val docId = app.packageName.replace(".", "_")
                val docRef = appsRef.document(docId)

                // Map to the format expected by the web frontend
                val data = mapOf(
                    "id" to docId,
                    "name" to app.appName,
                    "packageName" to app.packageName,
                    "developer" to app.developerName,
                    "version" to app.versionName,
                    "category" to app.category.displayName,
                    "icon" to getCategoryEmoji(app.category.displayName),
                    "privacyScore" to (app.privacyScore ?: 50),
                    "riskLevel" to (app.riskLevel?.name?.lowercase() ?: "medium"),
                    "lastScan" to java.util.Date(app.lastScanAt ?: System.currentTimeMillis()).toInstant().toString(),
                    "permissions" to app.permissions.map { perm ->
                        mapOf(
                            "name" to perm.displayName,
                            "risk" to perm.riskLevel.name.lowercase(),
                            "explanation" to perm.explanation,
                            "granted" to perm.isGranted,
                        )
                    },
                    "syncedAt" to System.currentTimeMillis(),
                    "syncSource" to "android",
                )

                batch.set(docRef, data)
            }

            batch.commit().await()
            Timber.d("Synced ${apps.size} apps to Firestore for user $userId")
        } catch (e: Exception) {
            Timber.e(e, "Failed to sync apps to Firestore")
        }
    }

    /**
     * Syncs a security notification to Firestore.
     * The web frontend reads from this collection to display notifications.
     */
    suspend fun syncNotification(notification: SecurityNotification) {
        val userId = auth.currentUser?.uid ?: return

        try {
            val notifRef = firestore
                .collection("users")
                .document(userId)
                .collection("notifications")
                .document(notification.notificationId)

            val data = mapOf(
                "id" to notification.notificationId,
                "type" to mapNotificationType(notification.type),
                "title" to notification.title,
                "message" to notification.message,
                "time" to java.util.Date(notification.createdAt).toInstant().toString(),
                "read" to notification.isRead,
                "packageName" to notification.packageName,
            )

            notifRef.set(data).await()
        } catch (e: Exception) {
            Timber.e(e, "Failed to sync notification to Firestore")
        }
    }

    /**
     * Syncs a weekly report summary to Firestore.
     */
    suspend fun syncReport(report: PrivacyReport) {
        val userId = auth.currentUser?.uid ?: return

        try {
            val reportRef = firestore
                .collection("users")
                .document(userId)
                .collection("reports")
                .document(report.reportId)

            val data = mapOf(
                "reportId" to report.reportId,
                "reportDate" to report.weekStartDate,
                "overallScore" to report.overallScore,
                "scoreDelta" to report.scoreDelta,
                "newAppsCount" to report.newlyInstalledApps.size,
                "permissionChangesCount" to report.permissionChanges.size,
                "locationUsage" to report.dailyUsage.map { it.locationAccesses },
                "cameraUsage" to report.dailyUsage.map { it.cameraAccesses },
                "microphoneUsage" to report.dailyUsage.map { it.microphoneAccesses },
                "contactsUsage" to report.dailyUsage.map { it.contactsAccesses },
                "storageUsage" to report.dailyUsage.map { it.storageAccesses },
                "days" to report.dailyUsage.map { it.dayLabel },
                "syncedAt" to System.currentTimeMillis(),
            )

            reportRef.set(data).await()
            Timber.d("Synced report ${report.reportId} to Firestore")
        } catch (e: Exception) {
            Timber.e(e, "Failed to sync report to Firestore")
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Maps notification type to the format expected by the web frontend.
     * Web frontend uses: "new-app" | "high-risk" | "score-change" | "report"
     */
    private fun mapNotificationType(type: com.privacyguard.ai.domain.model.NotificationType): String =
        when (type) {
            com.privacyguard.ai.domain.model.NotificationType.NEW_APP_INSTALLED -> "new-app"
            com.privacyguard.ai.domain.model.NotificationType.HIGH_RISK_APP,
            com.privacyguard.ai.domain.model.NotificationType.DANGEROUS_PERMISSION_GRANTED -> "high-risk"
            com.privacyguard.ai.domain.model.NotificationType.SCORE_DECREASED -> "score-change"
            com.privacyguard.ai.domain.model.NotificationType.PERMISSION_CHANGED -> "high-risk"
            com.privacyguard.ai.domain.model.NotificationType.WEEKLY_REPORT_READY -> "report"
        }

    /**
     * Returns a category emoji for display in the web frontend.
     * The web frontend uses emoji as icon placeholders.
     */
    private fun getCategoryEmoji(category: String): String = when (category.lowercase()) {
        "communication" -> "💬"
        "social" -> "📱"
        "tools" -> "🔧"
        "games" -> "🎮"
        "productivity" -> "📋"
        "finance" -> "💰"
        "health & fitness" -> "❤️"
        "shopping" -> "🛍️"
        "entertainment" -> "🎬"
        "education" -> "📚"
        "travel" -> "✈️"
        "browser" -> "🌐"
        "music & audio" -> "🎵"
        "photography" -> "📷"
        "news & magazines" -> "📰"
        "maps & navigation" -> "🗺️"
        "food & drink" -> "🍔"
        "lifestyle" -> "🌟"
        "business" -> "💼"
        else -> "📦"
    }
}
