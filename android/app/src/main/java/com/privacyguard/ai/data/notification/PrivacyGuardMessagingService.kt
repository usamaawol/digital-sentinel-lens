package com.privacyguard.ai.data.notification

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.privacyguard.ai.domain.model.NotificationType
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.domain.repository.ReportRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.UUID
import javax.inject.Inject

/**
 * Firebase Cloud Messaging service for receiving push notifications.
 *
 * Feature 11: Security Notifications
 *
 * Handles:
 * - FCM token refresh (for server-side push notifications)
 * - Incoming push notification messages
 *
 * Push notification payload format:
 * {
 *   "type": "HIGH_RISK_APP" | "DANGEROUS_PERMISSION_GRANTED" | ...,
 *   "title": "Notification title",
 *   "message": "Notification body",
 *   "packageName": "com.example.app" (optional)
 * }
 */
@AndroidEntryPoint
class PrivacyGuardMessagingService : FirebaseMessagingService() {

    @Inject
    lateinit var notificationDispatcher: NotificationDispatcher

    @Inject
    lateinit var reportRepository: ReportRepository

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Timber.d("FCM token refreshed: ${token.take(20)}...")
        // TODO: Send the new token to your backend server if needed
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Timber.d("FCM message received from: ${remoteMessage.from}")

        val data = remoteMessage.data
        val notificationType = data["type"]?.let {
            runCatching { NotificationType.valueOf(it) }.getOrNull()
        } ?: NotificationType.NEW_APP_INSTALLED

        val title = data["title"]
            ?: remoteMessage.notification?.title
            ?: "Privacy Guard Alert"

        val message = data["message"]
            ?: remoteMessage.notification?.body
            ?: "A privacy event was detected on your device."

        val packageName = data["packageName"]

        val notification = SecurityNotification(
            notificationId = UUID.randomUUID().toString(),
            type = notificationType,
            title = title,
            message = message,
            packageName = packageName,
            createdAt = System.currentTimeMillis(),
            isRead = false,
        )

        // Save to local database and dispatch system notification
        serviceScope.launch {
            try {
                reportRepository.saveNotification(notification)
                notificationDispatcher.dispatch(notification)
            } catch (e: Exception) {
                Timber.e(e, "Failed to handle FCM message")
            }
        }
    }
}
