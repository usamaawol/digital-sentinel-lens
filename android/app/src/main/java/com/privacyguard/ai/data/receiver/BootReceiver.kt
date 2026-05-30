package com.privacyguard.ai.data.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.privacyguard.ai.data.worker.BackgroundScanScheduler
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber
import javax.inject.Inject

/**
 * Broadcast receiver that reschedules WorkManager jobs after device reboot.
 *
 * Feature 10: Background Scanning
 *
 * WorkManager persists jobs across reboots automatically on Android 6.0+,
 * but this receiver provides an explicit reschedule as a safety net.
 *
 * Listens for: android.intent.action.BOOT_COMPLETED
 * Required permission: android.permission.RECEIVE_BOOT_COMPLETED
 */
@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject
    lateinit var backgroundScanScheduler: BackgroundScanScheduler

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Timber.d("BootReceiver: Device rebooted — rescheduling background scans")
            backgroundScanScheduler.scheduleAll()
        }
    }
}
