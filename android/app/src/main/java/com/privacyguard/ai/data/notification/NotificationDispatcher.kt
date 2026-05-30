package com.privacyguard.ai.data.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.privacyguard.ai.R
import com.privacyguard.ai.domain.model.NotificationType
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.presentation.MainActivity
import dagger.hilt.android.qualifiers.ApplicationContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Dispatches Android system notifications for security events.
 *
 * Feature 11: Security Notifications
 *
 * Notification channels:
 * - HIGH_RISK: High-priority channel for critical security alerts
 * - GENERAL: Default channel for informational notifications
 * - REPORTS: Low-priority channel for weekly report notifications
 *
 * Required Android permission: android.permission.POST_NOTIFICATIONS (Android 13+)
 */
@Singleton
class NotificationDispatcher @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    private val notificationManager = NotificationManagerCompat.from(context)

    init {
        createNotificationChannels()
    }

    /**
     * Dispatches a system notification for the given [SecurityNotification].
     *
     * Notification types and their channels:
     * - HIGH_RISK_APP → HIGH_RISK channel (high priority)
     * - DANGEROUS_PERMISSION_GRANTED → HIGH_RISK channel (high priority)
     * - SCORE_DECREASED → GENERAL channel (default priority)
     * - NEW_APP_INSTALLED → GENERAL channel (default priority)
     * - PERMISSION_CHANGED → GENERAL channel (default priority)
     * - WEEKLY_REPORT_READY → REPORTS channel (low priority)
     */
    fun dispatch(notification: SecurityNotification) {
        if (!notificationManager.areNotificationsEnabled()) {
            Timber.d("Notifications are disabled — skipping dispatch")
            return
        }

        val (channelId, priority) = when (notification.type) {
            NotificationType.HIGH_RISK_APP,
            NotificationType.DANGEROUS_PERMISSION_GRANTED -> {
                Pair(CHANNEL_HIGH_RISK, NotificationCompat.PRIORITY_HIGH)
            }
            NotificationType.SCORE_DECREASED,
            NotificationType.NEW_APP_INSTALLED,
            NotificationType.PERMISSION_CHANGED -> {
                Pair(CHANNEL_GENERAL, NotificationCompat.PRIORITY_DEFAULT)
            }
            NotificationType.WEEKLY_REPORT_READY -> {
                Pair(CHANNEL_REPORTS, NotificationCompat.PRIORITY_LOW)
            }
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra(EXTRA_NOTIFICATION_TYPE, notification.type.name)
            notification.packageName?.let { putExtra(EXTRA_PACKAGE_NAME, it) }
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notification.notificationId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val smallIcon = when (notification.type) {
            NotificationType.HIGH_RISK_APP,
            NotificationType.DANGEROUS_PERMISSION_GRANTED -> R.drawable.ic_notification_warning
            else -> R.drawable.ic_notification_shield
        }

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(smallIcon)
            .setContentTitle(notification.title)
            .setContentText(notification.message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(notification.message))
            .setPriority(priority)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setCategory(
                when (notification.type) {
                    NotificationType.HIGH_RISK_APP,
                    NotificationType.DANGEROUS_PERMISSION_GRANTED -> NotificationCompat.CATEGORY_ALARM
                    else -> NotificationCompat.CATEGORY_STATUS
                }
            )

        try {
            notificationManager.notify(
                notification.notificationId.hashCode(),
                builder.build(),
            )
            Timber.d("Dispatched notification: ${notification.title}")
        } catch (e: SecurityException) {
            Timber.w(e, "POST_NOTIFICATIONS permission not granted")
        }
    }

    /**
     * Creates the notification channels required for Android 8.0+.
     * Safe to call multiple times — channels are only created once.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val systemNotificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channels = listOf(
            NotificationChannel(
                CHANNEL_HIGH_RISK,
                "Security Alerts",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Critical security alerts: high-risk apps and dangerous permissions"
                enableVibration(true)
                enableLights(true)
            },
            NotificationChannel(
                CHANNEL_GENERAL,
                "Privacy Updates",
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = "New app detections and permission changes"
            },
            NotificationChannel(
                CHANNEL_REPORTS,
                "Weekly Reports",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Weekly privacy report summaries"
            },
        )

        channels.forEach { channel ->
            systemNotificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_HIGH_RISK = "privacy_guard_high_risk"
        const val CHANNEL_GENERAL = "privacy_guard_general"
        const val CHANNEL_REPORTS = "privacy_guard_reports"
        const val EXTRA_NOTIFICATION_TYPE = "notification_type"
        const val EXTRA_PACKAGE_NAME = "package_name"
    }
}
