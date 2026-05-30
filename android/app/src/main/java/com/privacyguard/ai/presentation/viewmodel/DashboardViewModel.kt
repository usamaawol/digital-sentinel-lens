package com.privacyguard.ai.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.domain.repository.ScanRepository
import com.privacyguard.ai.domain.scoring.DevicePrivacyScore
import com.privacyguard.ai.domain.scoring.PrivacyScoringEngine
import com.privacyguard.ai.domain.usecase.GetAppsUseCase
import com.privacyguard.ai.domain.usecase.ScanAppsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for the Dashboard screen.
 *
 * Exposes:
 * - Overall device privacy score
 * - App risk distribution
 * - AI-generated insights
 * - Weekly permission usage data
 * - Scan state (idle, scanning, error)
 */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val getAppsUseCase: GetAppsUseCase,
    private val scanAppsUseCase: ScanAppsUseCase,
    private val scanRepository: ScanRepository,
    private val reportRepository: ReportRepository,
    private val aiRepository: AiRepository,
    private val scoringEngine: PrivacyScoringEngine,
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    // Observe apps from the database
    val apps: StateFlow<List<AppInfo>> = getAppsUseCase.observeAll()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList(),
        )

    // Observe latest scan
    val latestScan = scanRepository.observeScanHistory()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList(),
        )

    // Observe unread notification count
    val unreadNotificationCount: StateFlow<Int> = reportRepository.observeUnreadCount()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = 0,
        )

    init {
        // Load AI insights when apps change
        viewModelScope.launch {
            apps.collect { appList ->
                if (appList.isNotEmpty()) {
                    loadInsights(appList)
                    updateDeviceScore(appList)
                }
            }
        }
    }

    /**
     * Triggers a manual full device scan.
     */
    fun scanNow() {
        viewModelScope.launch {
            _uiState.update { it.copy(isScanning = true, error = null) }
            try {
                val result = scanAppsUseCase()
                _uiState.update {
                    it.copy(
                        isScanning = false,
                        lastScanResult = result,
                    )
                }
                Timber.d("Manual scan complete: ${result.totalApps} apps, score ${result.overallScore}")
            } catch (e: Exception) {
                Timber.e(e, "Manual scan failed")
                _uiState.update {
                    it.copy(
                        isScanning = false,
                        error = "Scan failed: ${e.message}",
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    private fun updateDeviceScore(apps: List<AppInfo>) {
        val deviceScore = scoringEngine.scoreAll(apps)
        _uiState.update { it.copy(deviceScore = deviceScore) }
    }

    private fun loadInsights(apps: List<AppInfo>) {
        viewModelScope.launch {
            try {
                val insights = aiRepository.generateInsights(apps)
                _uiState.update { it.copy(insights = insights) }
            } catch (e: Exception) {
                Timber.w(e, "Failed to load AI insights")
            }
        }
    }
}

data class DashboardUiState(
    val isScanning: Boolean = false,
    val deviceScore: DevicePrivacyScore? = null,
    val insights: List<String> = emptyList(),
    val lastScanResult: com.privacyguard.ai.domain.model.ScanResult? = null,
    val error: String? = null,
)
