package com.privacyguard.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.privacyguard.ai.data.local.entity.NotificationEntity
import com.privacyguard.ai.data.local.entity.ReportEntity
import kotlinx.coroutines.flow.Flow

/**
 * Room DAO for privacy reports and security notifications.
 *
 * Feature 5: Local Security Database — Risk Reports & Notifications tables
 * Feature 6: Weekly Privacy Reports
 * Feature 11: Security Notifications
 */
@Dao
interface ReportDao {

    // ── Privacy Reports ──────────────────────────────────────────────────────

    @Query("SELECT * FROM privacy_reports ORDER BY generated_at DESC")
    fun observeReports(): Flow<List<ReportEntity>>

    @Query("SELECT * FROM privacy_reports ORDER BY generated_at DESC LIMIT 1")
    suspend fun getLatestReport(): ReportEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReport(report: ReportEntity)

    @Query("DELETE FROM privacy_reports WHERE generated_at < :timestamp")
    suspend fun deleteReportsOlderThan(timestamp: Long)

    // ── Security Notifications ───────────────────────────────────────────────

    @Query("SELECT * FROM notifications ORDER BY created_at DESC")
    fun observeNotifications(): Flow<List<NotificationEntity>>

    @Query("SELECT COUNT(*) FROM notifications WHERE is_read = 0")
    fun observeUnreadCount(): Flow<Int>

    @Query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1")
    suspend fun getLatestNotification(): NotificationEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity)

    @Query("UPDATE notifications SET is_read = 1 WHERE notification_id = :notificationId")
    suspend fun markRead(notificationId: String)

    @Query("UPDATE notifications SET is_read = 1")
    suspend fun markAllRead()

    @Query("DELETE FROM notifications WHERE created_at < :timestamp")
    suspend fun deleteNotificationsOlderThan(timestamp: Long)
}
