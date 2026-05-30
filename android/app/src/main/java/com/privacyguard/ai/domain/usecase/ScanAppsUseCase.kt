package com.privacyguard.ai.domain.usecase

import com.privacyguard.ai.domain.model.ScanResult
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.repository.ScanRepository
import javax.inject.Inject

/**
 * Use case: Scan all installed applications on the device.
 *
 * Feature 1: Installed Application Scanner
 *
 * Orchestrates:
 * 1. Scanning installed apps via PackageManager
 * 2. Analyzing permissions for each app
 * 3. Computing privacy scores
 * 4. Saving results to local database
 * 5. Saving scan history
 */
class ScanAppsUseCase @Inject constructor(
    private val appRepository: AppRepository,
    private val scanRepository: ScanRepository,
) {
    /**
     * Executes the full device scan.
     *
     * @return [ScanResult] with summary statistics
     */
    suspend operator fun invoke(): ScanResult {
        val result = appRepository.scanInstalledApps()
        scanRepository.saveScan(result)
        return result
    }
}
