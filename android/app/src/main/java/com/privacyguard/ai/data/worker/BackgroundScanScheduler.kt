package com.privacyguard.ai.data.worker

import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Schedules background scanning and report generation using WorkManager.
 *
 * Feature 10: Background Scanning
 *
 * Schedules:
 * - Daily scan: Runs every 24 hours to detect new apps and permission changes
 * - Weekly report: Runs every 7 days to generate the privacy report
 *
 * WorkManager guarantees execution even after device restarts.
 * The [BootReceiver] reschedules these jobs after a reboot.
 */
@Singleton
class BackgroundScanScheduler @Inject constructor(
    private val workManager: WorkManager,
) {

    /**
     * Schedules the daily background scan.
     * Uses [ExistingPeriodicWorkPolicy.KEEP] to avoid rescheduling if already running.
     */
    fun scheduleDailyScan() {
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()

        val dailyScanRequest = PeriodicWorkRequestBuilder<DailyScanWorker>(
            repeatInterval = 24,
            repeatIntervalTimeUnit = TimeUnit.HOURS,
            flexTimeInterval = 2,
            flexTimeIntervalUnit = TimeUnit.HOURS,
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                30,
                TimeUnit.MINUTES,
            )
            .build()

        workManager.enqueueUniquePeriodicWork(
            DailyScanWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            dailyScanRequest,
        )
    }

    /**
     * Schedules the weekly privacy report generation.
     */
    fun scheduleWeeklyReport() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        val weeklyReportRequest = PeriodicWorkRequestBuilder<WeeklyReportWorker>(
            repeatInterval = 7,
            repeatIntervalTimeUnit = TimeUnit.DAYS,
            flexTimeInterval = 4,
            flexTimeIntervalUnit = TimeUnit.HOURS,
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                1,
                TimeUnit.HOURS,
            )
            .build()

        workManager.enqueueUniquePeriodicWork(
            WeeklyReportWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            weeklyReportRequest,
        )
    }

    /**
     * Schedules all background jobs.
     * Call this from [PrivacyGuardApplication.onCreate] and [BootReceiver].
     */
    fun scheduleAll() {
        scheduleDailyScan()
        scheduleWeeklyReport()
    }

    /**
     * Cancels all scheduled background jobs.
     * Used when the user disables background scanning in settings.
     */
    fun cancelAll() {
        workManager.cancelUniqueWork(DailyScanWorker.WORK_NAME)
        workManager.cancelUniqueWork(WeeklyReportWorker.WORK_NAME)
    }
}
