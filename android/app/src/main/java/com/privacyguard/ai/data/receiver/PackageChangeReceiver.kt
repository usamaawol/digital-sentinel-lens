package com.privacyguard.ai.data.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.privacyguard.ai.data.scanner.AppScanner
import com.privacyguard.ai.domain.model.NotificationType
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.model.SecurityNotification
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.domain.scoring.PrivacyScoringEngine
import com.privacyguard.ai.data.notification.NotificationDispatcher
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.UUID
import javax.inject.Inject

/**
 * Broadcast receiver for package installation, update, and removal events.
 *
 * Feature 1: Installed Application Scanner — new app detection
 * Feature 10: Background Scanning — new app install detection
 * Feature 11: Security Notifications — new app installed notification
 *
 * Listens for:
 * - android.intent.action.PACKAGE_ADDED
 * - android.intent.action.PACKAGE_REPLACED
 * - android.intent.action.PACKAGE_REMOVED
 *
 * Declared in AndroidManifest.xml with the appropriate intent filters.
 */
@AndroidEntryPoint
class PackageChangeReceiver : BroadcastReceiver() {

    @Inject
    lateinit var appScanner: AppScanner

    @Inject
    lateinit var appRepository: AppRepository

    @Inject
    lateinit var reportRepository: ReportRepository

    @Inject
    lateinit var scoringEngine: PrivacyScoringEngine

    @Inject
    lateinit var notificationDispatcher: NotificationDispatcher

    private val receiverScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val packageName = intent.data?.schemeSpecificPart ?: return
        val action = intent.action ?: return

        Timber.d("PackageChangeReceiver: $action for $packageName")

        when (action) {
            Intent.ACTION_PACKAGE_ADDED -> handlePackageAdded(packageName)
            Intent.ACTION_PACKAGE_REPLACED -> handlePackageUpdated(packageName)
            Intent.ACTION_PACKAGE_REMOVED -> handlePackageRemoved(packageName)
        }
    }

    private fun handlePackageAdded(packageName: String) {
        receiverScope.launch {
            try {
                val app = appScanner.scanSingle(packageName) ?: return@launch
                val scoringResult = scoringEngine.score(app)
                val scoredApp = app.copy(
                    privacyScore = scoringResult.score,
                    riskLevel = scoringResult.riskLevel,
                )
                appRepository.saveApp(scoredApp)

                // Generate notification
                val notificationType = if (scoringResult.riskLevel == RiskLevel.HIGH) {
                    NotificationType.HIGH_RISK_APP
                } else {
                    NotificationType.NEW_APP_INSTALLED
                }

                val notification = SecurityNotification(
                    notificationId = UUID.randomUUID().toString(),
                    type = notificationType,
                    title = if (notificationType == NotificationType.HIGH_RISK_APP) {
                        "High Risk App Installed"
                    } else {
                        "New App Installed"
                    },
                    message = "${scoredApp.appName} was installed. Privacy score: ${scoredApp.privacyScore}/100.",
                    packageName = packageName,
                    createdAt = System.currentTimeMillis(),
                    isRead = false,
                )
                reportRepository.saveNotification(notification)
                notificationDispatcher.dispatch(notification)

                Timber.d("Scanned new app: ${scoredApp.appName} (score: ${scoredApp.privacyScore})")
            } catch (e: Exception) {
                Timber.e(e, "Failed to scan new package: $packageName")
            }
        }
    }

    private fun handlePackageUpdated(packageName: String) {
        receiverScope.launch {
            try {
                val app = appScanner.scanSingle(packageName) ?: return@launch
                val scoringResult = scoringEngine.score(app)
                val scoredApp = app.copy(
                    privacyScore = scoringResult.score,
                    riskLevel = scoringResult.riskLevel,
                )
                appRepository.saveApp(scoredApp)
                Timber.d("Updated app scan: ${scoredApp.appName}")
            } catch (e: Exception) {
                Timber.e(e, "Failed to rescan updated package: $packageName")
            }
        }
    }

    private fun handlePackageRemoved(packageName: String) {
        receiverScope.launch {
            try {
                appRepository.deleteApp(packageName)
                Timber.d("Removed app from database: $packageName")
            } catch (e: Exception) {
                Timber.e(e, "Failed to remove package from database: $packageName")
            }
        }
    }
}
