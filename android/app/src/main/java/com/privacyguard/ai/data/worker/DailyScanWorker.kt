package com.privacyguard.ai.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.privacyguard.ai.domain.model.NotificationType
import com.privacyguard.ai.domain.model.PermissionRisk
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.domain.repository.ScanRepository
import com.privacyguard.ai.data.notification.NotificationDispatcher
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import timber.log.Timber
import java.util.UUID

/**
 * WorkManager worker for daily background app scanning.
 *
 * Feature 10: Background Scanning
 *
 * Runs daily to:
 * 1. Scan all installed apps
 * 2. Detect new apps and permission changes
 * 3. Generate security notifications for significant changes
 * 4. Update the local database
 *
 * Scheduled by [BackgroundScanScheduler].
 *
 * Uses [HiltWorker] for dependency injection with WorkManager.
 */
@HiltWorker
class DailyScanWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val appRepository: AppRepository,
    private val scanRepository: ScanRepository,
    private val reportRepository: ReportRepository,
    private val notificationDispatcher: NotificationDispatcher,
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        Timber.d("DailyScanWorker: Starting daily background scan")

        return try {
            // 1. Perform the scan
            val scanResult = appRepository.scanInstalledApps()
            scanRepository.saveScan(scanResult)

            Timber.d("DailyScanWorker: Scanned ${scanResult.totalApps} apps")

            // 2. Generate notifications for significant changes
            generateNotifications(scanResult)

            Timber.d("DailyScanWorker: Daily scan complete. Score: ${scanResult.overallScore}")
            Result.success()
        } catch (e: Exception) {
            Timber.e(e, "DailyScanWorker: Scan failed")
            // Retry up to 3 times with exponential backoff
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    private suspend fun generateNotifications(
        scanResult: com.privacyguard.ai.domain.model.ScanResult,
    ) {
        // Notify about newly installed high-risk apps
        scanResult.newApps.forEach { packageName ->
            val app = appRepository.getApp(packageName)
            if (app != null && app.riskLevel == RiskLevel.HIGH) {
                val notification = SecurityNotification(
                    notificationId = UUID.randomUUID().toString(),
                    type = NotificationType.HIGH_RISK_APP,
                    title = "High Risk App Detected",
                    message = "${app.appName} was installed and has a privacy score of ${app.privacyScore}/100.",
                    packageName = packageName,
                    createdAt = System.currentTimeMillis(),
                    isRead = false,
                )
                reportRepository.saveNotification(notification)
                notificationDispatcher.dispatch(notification)
            } else if (app != null) {
                val notification = SecurityNotification(
                    notificationId = UUID.randomUUID().toString(),
                    type = NotificationType.NEW_APP_INSTALLED,
                    title = "New App Installed",
                    message = "${app.appName} was installed. Privacy score: ${app.privacyScore}/100.",
                    packageName = packageName,
                    createdAt = System.currentTimeMillis(),
                    isRead = false,
                )
                reportRepository.saveNotification(notification)
                notificationDispatcher.dispatch(notification)
            }
        }

        // Notify about dangerous permission grants
        val dangerousGrants = scanResult.permissionChanges.filter { change ->
            change.changeType == com.privacyguard.ai.domain.model.PermissionChangeType.GRANTED
        }

        dangerousGrants.forEach { change ->
            val app = appRepository.getApp(change.packageName)
            val permInfo = com.privacyguard.ai.domain.model.PermissionCatalog.analyze(
                change.permissionName, true
            )

            if (permInfo.riskLevel == PermissionRisk.HIGH || permInfo.riskLevel == PermissionRisk.CRITICAL) {
                val notification = SecurityNotification(
                    notificationId = UUID.randomUUID().toString(),
                    type = NotificationType.DANGEROUS_PERMISSION_GRANTED,
                    title = "New Dangerous Permission Granted",
                    message = "${change.appName} was granted ${change.permissionDisplayName} access.",
                    packageName = change.packageName,
                    createdAt = System.currentTimeMillis(),
                    isRead = false,
                )
                reportRepository.saveNotification(notification)
                notificationDispatcher.dispatch(notification)
            }
        }
    }

    companion object {
        const val WORK_NAME = "privacy_guard_daily_scan"
    }
}
