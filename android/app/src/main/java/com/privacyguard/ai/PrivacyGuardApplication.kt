package com.privacyguard.ai

import android.app.Application
import com.privacyguard.ai.data.worker.BackgroundScanScheduler
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber
import javax.inject.Inject

/**
 * Application class for Privacy Guard AI.
 *
 * Responsibilities:
 * 1. Initialize Hilt dependency injection
 * 2. Initialize Timber logging
 * 3. Schedule background scanning jobs
 */
@HiltAndroidApp
class PrivacyGuardApplication : Application() {

    @Inject
    lateinit var backgroundScanScheduler: BackgroundScanScheduler

    override fun onCreate() {
        super.onCreate()

        // Initialize Timber logging (debug builds only)
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }

        // Schedule background scanning jobs
        // WorkManager guarantees these run even after device restarts
        backgroundScanScheduler.scheduleAll()

        Timber.d("Privacy Guard AI initialized")
    }
}
