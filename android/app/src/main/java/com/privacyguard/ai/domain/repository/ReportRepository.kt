package com.privacyguard.ai.domain.repository

import com.privacyguard.ai.domain.model.PrivacyReport
import com.privacyguard.ai.domain.model.SecurityNotification
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for privacy reports and security notifications.
 *
 * Feature 6: Weekly Privacy Reports
 * Feature 11: Security Notifications
 * Feature 5: Local Security Database — Risk Reports table
 */
interface ReportRepository {

    // ── Privacy Reports ──────────────────────────────────────────────────────

    /**
     * Returns a Flow of all privacy reports, ordered by most recent first.
     */
    fun observeReports(): Flow<List<PrivacyReport>>

    /**
     * Returns the most recent privacy report, or null if none exist.
     */
    suspend fun getLatestReport(): PrivacyReport?

    /**
     * Generates and saves a new weekly privacy report.
     * Aggregates data from the last 7 days of scan history.
     */
    suspend fun generateWeeklyReport(): PrivacyReport

    /**
     * Saves a privacy report to the local database.
     */
    suspend fun saveReport(report: PrivacyReport)

    /**
     * Optionally syncs the report summary to Firestore.
     */
    suspend fun syncReportToFirestore(report: PrivacyReport, userId: String)

    // ── Security Notifications ───────────────────────────────────────────────

    /**
     * Returns a Flow of all security notifications, ordered by most recent first.
     */
    fun observeNotifications(): Flow<List<SecurityNotification>>

    /**
     * Returns unread notification count as a Flow.
     */
    fun observeUnreadCount(): Flow<Int>

    /**
     * Saves a security notification to the local database.
     */
    suspend fun saveNotification(notification: SecurityNotification)

    /**
     * Marks a notification as read.
     */
    suspend fun markNotificationRead(notificationId: String)

    /**
     * Marks all notifications as read.
     */
    suspend fun markAllNotificationsRead()

    /**
     * Deletes notifications older than the given timestamp.
     */
    suspend fun deleteNotificationsOlderThan(timestamp: Long)
}
