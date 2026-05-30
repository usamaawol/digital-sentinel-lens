package com.privacyguard.ai.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.privacyguard.ai.data.local.dao.ReportDao
import com.privacyguard.ai.data.local.entity.NotificationEntity
import com.privacyguard.ai.data.local.entity.ReportEntity
import com.privacyguard.ai.domain.model.AppRiskSummary
import com.privacyguard.ai.domain.model.DailyUsageData
import com.privacyguard.ai.domain.model.NotificationType
import com.privacyguard.ai.domain.model.PermissionChange
import com.privacyguard.ai.domain.model.PermissionChangeType
import com.privacyguard.ai.domain.model.PrivacyReport
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.domain.repository.ScanRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import timber.log.Timber
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [ReportRepository].
 *
 * Feature 6: Weekly Privacy Reports
 * Feature 11: Security Notifications
 * Feature 5: Local Security Database
 */
@Singleton
class ReportRepositoryImpl @Inject constructor(
    private val reportDao: ReportDao,
    private val scanRepository: ScanRepository,
    private val appRepository: AppRepository,
    private val firestore: FirebaseFirestore,
    private val gson: Gson,
) : ReportRepository {

    // ── Privacy Reports ──────────────────────────────────────────────────────

    override fun observeReports(): Flow<List<PrivacyReport>> =
        reportDao.observeReports().map { entities ->
            entities.map { it.toDomain(gson) }
        }

    override suspend fun getLatestReport(): PrivacyReport? =
        reportDao.getLatestReport()?.toDomain(gson)

    /**
     * Generates a weekly privacy report by aggregating the last 7 days of scan data.
     *
     * Feature 6: Weekly Privacy Reports
     */
    override suspend fun generateWeeklyReport(): PrivacyReport {
        val now = System.currentTimeMillis()
        val sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000L)

        // Get scans from the last 7 days
        val recentScans = scanRepository.getScansInRange(sevenDaysAgo, now)

        // Get current apps for risk summary
        val currentApps = appRepository.getAppCount()

        // Get the previous report for score delta
        val previousReport = getLatestReport()
        val latestScan = scanRepository.getLatestScan()
        val currentScore = latestScan?.overallScore ?: 0
        val previousScore = previousReport?.overallScore ?: currentScore
        val scoreDelta = currentScore - previousScore

        // Aggregate daily usage (mock data for now — real data requires UsageStatsManager)
        val dailyUsage = generateDailyUsageData()

        // Collect all permission changes from recent scans
        val allPermissionChanges = recentScans.flatMap { it.permissionChanges }

        // Collect all new apps from recent scans
        val allNewApps = recentScans.flatMap { it.newApps }.distinct()

        // Build top risk apps summary
        val topRiskApps = buildTopRiskApps()

        val weekStartDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(sevenDaysAgo)

        val report = PrivacyReport(
            reportId = UUID.randomUUID().toString(),
            weekStartDate = weekStartDate,
            generatedAt = now,
            overallScore = currentScore,
            scoreDelta = scoreDelta,
            dailyUsage = dailyUsage,
            newlyInstalledApps = allNewApps,
            uninstalledApps = emptyList(), // Tracked separately
            permissionChanges = allPermissionChanges,
            topRiskApps = topRiskApps,
            aiRecommendations = emptyList(), // Populated by AI layer when available
        )

        saveReport(report)
        return report
    }

    override suspend fun saveReport(report: PrivacyReport) {
        reportDao.insertReport(report.toEntity(gson))
    }

    /**
     * Syncs report summary to Firestore.
     * Firestore path: users/{userId}/reports/{reportId}
     */
    override suspend fun syncReportToFirestore(report: PrivacyReport, userId: String) {
        try {
            val reportRef = firestore
                .collection("users")
                .document(userId)
                .collection("reports")
                .document(report.reportId)

            val summary = mapOf(
                "reportId" to report.reportId,
                "weekStartDate" to report.weekStartDate,
                "generatedAt" to report.generatedAt,
                "overallScore" to report.overallScore,
                "scoreDelta" to report.scoreDelta,
                "newAppsCount" to report.newlyInstalledApps.size,
                "permissionChangesCount" to report.permissionChanges.size,
                "syncedAt" to System.currentTimeMillis(),
            )

            reportRef.set(summary).await()
            Timber.d("Synced report ${report.reportId} to Firestore")
        } catch (e: Exception) {
            Timber.e(e, "Failed to sync report to Firestore")
        }
    }

    // ── Security Notifications ───────────────────────────────────────────────

    override fun observeNotifications(): Flow<List<SecurityNotification>> =
        reportDao.observeNotifications().map { entities ->
            entities.map { it.toDomain() }
        }

    override fun observeUnreadCount(): Flow<Int> =
        reportDao.observeUnreadCount()

    override suspend fun saveNotification(notification: SecurityNotification) {
        reportDao.insertNotification(notification.toEntity())
    }

    override suspend fun markNotificationRead(notificationId: String) {
        reportDao.markRead(notificationId)
    }

    override suspend fun markAllNotificationsRead() {
        reportDao.markAllRead()
    }

    override suspend fun deleteNotificationsOlderThan(timestamp: Long) {
        reportDao.deleteNotificationsOlderThan(timestamp)
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Generates daily usage data for the last 7 days.
     *
     * NOTE: Real implementation requires UsageStatsManager with
     * android.permission.PACKAGE_USAGE_STATS (special permission).
     * This generates placeholder data until that permission is granted.
     */
    private fun generateDailyUsageData(): List<DailyUsageData> {
        val dayLabels = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        val calendar = Calendar.getInstance()

        return dayLabels.mapIndexed { index, label ->
            calendar.add(Calendar.DAY_OF_YEAR, -6 + index)
            DailyUsageData(
                dayLabel = label,
                timestamp = calendar.timeInMillis,
                locationAccesses = 0,
                cameraAccesses = 0,
                microphoneAccesses = 0,
                contactsAccesses = 0,
                storageAccesses = 0,
            )
        }
    }

    private suspend fun buildTopRiskApps(): List<AppRiskSummary> {
        // This would query the app database for the lowest-scored apps
        // Returning empty list as placeholder — populated by the ViewModel layer
        return emptyList()
    }
}

// ── Mapping extensions ───────────────────────────────────────────────────────

private fun PrivacyReport.toEntity(gson: Gson): ReportEntity = ReportEntity(
    reportId = reportId,
    weekStartDate = weekStartDate,
    generatedAt = generatedAt,
    overallScore = overallScore,
    scoreDelta = scoreDelta,
    dailyUsageJson = gson.toJson(dailyUsage),
    newAppsJson = gson.toJson(newlyInstalledApps),
    uninstalledAppsJson = gson.toJson(uninstalledApps),
    permissionChangesJson = gson.toJson(permissionChanges),
    topRiskAppsJson = gson.toJson(topRiskApps),
    aiRecommendationsJson = gson.toJson(aiRecommendations),
)

private fun ReportEntity.toDomain(gson: Gson): PrivacyReport {
    val stringListType = object : TypeToken<List<String>>() {}.type
    val dailyUsageType = object : TypeToken<List<DailyUsageData>>() {}.type
    val permChangesType = object : TypeToken<List<PermissionChange>>() {}.type
    val riskAppsType = object : TypeToken<List<AppRiskSummary>>() {}.type

    return PrivacyReport(
        reportId = reportId,
        weekStartDate = weekStartDate,
        generatedAt = generatedAt,
        overallScore = overallScore,
        scoreDelta = scoreDelta,
        dailyUsage = runCatching { gson.fromJson<List<DailyUsageData>>(dailyUsageJson, dailyUsageType) ?: emptyList() }.getOrDefault(emptyList()),
        newlyInstalledApps = runCatching { gson.fromJson<List<String>>(newAppsJson, stringListType) ?: emptyList() }.getOrDefault(emptyList()),
        uninstalledApps = runCatching { gson.fromJson<List<String>>(uninstalledAppsJson, stringListType) ?: emptyList() }.getOrDefault(emptyList()),
        permissionChanges = runCatching { gson.fromJson<List<PermissionChange>>(permissionChangesJson, permChangesType) ?: emptyList() }.getOrDefault(emptyList()),
        topRiskApps = runCatching { gson.fromJson<List<AppRiskSummary>>(topRiskAppsJson, riskAppsType) ?: emptyList() }.getOrDefault(emptyList()),
        aiRecommendations = runCatching { gson.fromJson<List<String>>(aiRecommendationsJson, stringListType) ?: emptyList() }.getOrDefault(emptyList()),
    )
}

private fun SecurityNotification.toEntity(): NotificationEntity = NotificationEntity(
    notificationId = notificationId,
    type = type.name,
    title = title,
    message = message,
    packageName = packageName,
    createdAt = createdAt,
    isRead = isRead,
)

private fun NotificationEntity.toDomain(): SecurityNotification = SecurityNotification(
    notificationId = notificationId,
    type = runCatching { NotificationType.valueOf(type) }.getOrDefault(NotificationType.NEW_APP_INSTALLED),
    title = title,
    message = message,
    packageName = packageName,
    createdAt = createdAt,
    isRead = isRead,
)
