package com.privacyguard.ai.domain.usecase

import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.repository.AppRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

/**
 * Use case: Observe the list of scanned apps with optional filtering.
 *
 * Feature 1: Installed Application Scanner
 * Feature 3: Privacy Scoring System
 */
class GetAppsUseCase @Inject constructor(
    private val appRepository: AppRepository,
) {
    /**
     * Returns a Flow of all apps, sorted by privacy score (lowest first = highest risk first).
     */
    fun observeAll(): Flow<List<AppInfo>> =
        appRepository.observeApps().map { apps ->
            apps.sortedBy { it.privacyScore ?: 100 }
        }

    /**
     * Returns a Flow of apps filtered by risk level.
     */
    fun observeByRisk(riskLevel: RiskLevel): Flow<List<AppInfo>> =
        appRepository.observeApps().map { apps ->
            apps.filter { it.riskLevel == riskLevel }
                .sortedBy { it.privacyScore ?: 100 }
        }

    /**
     * Returns a Flow of high-risk apps only.
     */
    fun observeHighRisk(): Flow<List<AppInfo>> =
        appRepository.observeApps().map { apps ->
            apps.filter { it.riskLevel == RiskLevel.HIGH }
                .sortedBy { it.privacyScore ?: 100 }
        }

    /**
     * Returns a single app by package name.
     */
    suspend fun getApp(packageName: String): AppInfo? =
        appRepository.getApp(packageName)
}
