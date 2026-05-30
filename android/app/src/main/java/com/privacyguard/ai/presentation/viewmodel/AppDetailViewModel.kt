package com.privacyguard.ai.presentation.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.scoring.PrivacyScoringEngine
import com.privacyguard.ai.domain.scoring.PurposeValidationResult
import com.privacyguard.ai.domain.usecase.GetAppsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for the App Detail screen.
 *
 * Loads a single app's full details including:
 * - Permission analysis
 * - Privacy score breakdown
 * - Purpose validation result
 * - AI-generated recommendations
 */
@HiltViewModel
class AppDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val getAppsUseCase: GetAppsUseCase,
    private val aiRepository: AiRepository,
    private val scoringEngine: PrivacyScoringEngine,
) : ViewModel() {

    private val packageName: String = checkNotNull(savedStateHandle["packageName"])

    private val _uiState = MutableStateFlow(AppDetailUiState())
    val uiState: StateFlow<AppDetailUiState> = _uiState.asStateFlow()

    init {
        loadApp()
    }

    private fun loadApp() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val app = getAppsUseCase.getApp(packageName)
                if (app != null) {
                    val scoringResult = scoringEngine.score(app)
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            app = app,
                            purposeValidation = scoringResult.purposeValidation,
                            scoreBreakdown = scoringResult.breakdown,
                        )
                    }
                    loadRecommendations(app)
                } else {
                    _uiState.update {
                        it.copy(isLoading = false, error = "App not found")
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Failed to load app: $packageName")
                _uiState.update {
                    it.copy(isLoading = false, error = e.message)
                }
            }
        }
    }

    private fun loadRecommendations(app: AppInfo) {
        viewModelScope.launch {
            try {
                val recommendations = aiRepository.generateRecommendations(app)
                _uiState.update { it.copy(recommendations = recommendations) }
            } catch (e: Exception) {
                Timber.w(e, "Failed to load recommendations for $packageName")
            }
        }
    }
}

data class AppDetailUiState(
    val isLoading: Boolean = true,
    val app: AppInfo? = null,
    val purposeValidation: PurposeValidationResult? = null,
    val scoreBreakdown: com.privacyguard.ai.domain.scoring.ScoringBreakdown? = null,
    val recommendations: List<String> = emptyList(),
    val error: String? = null,
)
