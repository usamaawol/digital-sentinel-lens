package com.privacyguard.ai.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.privacyguard.ai.domain.model.NotificationType
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.data.notification.NotificationDispatcher
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import timber.log.Timber
import java.util.UUID

/**
 * WorkManager worker for weekly privacy report generation.
 *
 * Feature 6: Weekly Privacy Reports
 * Feature 10: Background Scanning
 *
 * Runs weekly to:
 * 1. Generate a comprehensive weekly privacy report
 * 2. Notify the user that the report is ready
 * 3. Optionally sync the report summary to Firestore
 *
 * Scheduled by [BackgroundScanScheduler].
 */
@HiltWorker
class WeeklyReportWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val reportRepository: ReportRepository,
    private val notificationDispatcher: NotificationDispatcher,
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        Timber.d("WeeklyReportWorker: Generating weekly privacy report")

        return try {
            val report = reportRepository.generateWeeklyReport()

            // Notify user that the report is ready
            val notification = SecurityNotification(
                notificationId = UUID.randomUUID().toString(),
                type = NotificationType.WEEKLY_REPORT_READY,
                title = "Weekly Privacy Report Ready",
                message = "Your privacy score this week: ${report.overallScore}/100. " +
                    if (report.scoreDelta > 0) "↑ Improved by ${report.scoreDelta} points."
                    else if (report.scoreDelta < 0) "↓ Decreased by ${-report.scoreDelta} points."
                    else "No change from last week.",
                packageName = null,
                createdAt = System.currentTimeMillis(),
                isRead = false,
            )
            reportRepository.saveNotification(notification)
            notificationDispatcher.dispatch(notification)

            Timber.d("WeeklyReportWorker: Report generated. Score: ${report.overallScore}")
            Result.success()
        } catch (e: Exception) {
            Timber.e(e, "WeeklyReportWorker: Report generation failed")
            if (runAttemptCount < 2) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME = "privacy_guard_weekly_report"
    }
}
