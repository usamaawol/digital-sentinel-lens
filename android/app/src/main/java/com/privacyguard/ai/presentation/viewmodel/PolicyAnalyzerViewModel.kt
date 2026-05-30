package com.privacyguard.ai.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.repository.PolicyAnalysis
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * ViewModel for the Privacy Policy Analyzer screen.
 *
 * Feature 8: Privacy Policy Analysis
 */
@HiltViewModel
class PolicyAnalyzerViewModel @Inject constructor(
    private val aiRepository: AiRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PolicyAnalyzerUiState())
    val uiState: StateFlow<PolicyAnalyzerUiState> = _uiState.asStateFlow()

    /**
     * Analyzes the given privacy policy text.
     */
    fun analyzePolicy(policyText: String) {
        if (policyText.isBlank()) {
            _uiState.update { it.copy(error = "Please enter a privacy policy to analyze.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isAnalyzing = true, error = null, result = null) }
            try {
                val result = aiRepository.analyzePrivacyPolicy(policyText)
                _uiState.update {
                    it.copy(isAnalyzing = false, result = result)
                }
            } catch (e: Exception) {
                Timber.e(e, "Policy analysis failed")
                _uiState.update {
                    it.copy(
                        isAnalyzing = false,
                        error = e.message ?: "Analysis failed. Please try again.",
                    )
                }
            }
        }
    }

    fun clearResult() {
        _uiState.update { it.copy(result = null, error = null) }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}

data class PolicyAnalyzerUiState(
    val isAnalyzing: Boolean = false,
    val result: PolicyAnalysis? = null,
    val error: String? = null,
)
