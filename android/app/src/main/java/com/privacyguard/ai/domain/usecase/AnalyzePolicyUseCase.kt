package com.privacyguard.ai.domain.usecase

import com.privacyguard.ai.domain.repository.AiRepository
import com.privacyguard.ai.domain.repository.PolicyAnalysis
import javax.inject.Inject

/**
 * Use case: Analyze a privacy policy using AI.
 *
 * Feature 8: Privacy Policy Analysis
 */
class AnalyzePolicyUseCase @Inject constructor(
    private val aiRepository: AiRepository,
) {
    /**
     * Analyzes the given privacy policy text.
     *
     * @param policyText Raw privacy policy text
     * @return [PolicyAnalysis] with structured results
     */
    suspend operator fun invoke(policyText: String): PolicyAnalysis =
        aiRepository.analyzePrivacyPolicy(policyText)
}
