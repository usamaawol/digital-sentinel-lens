package com.privacyguard.ai.domain.usecase

import com.privacyguard.ai.domain.model.PrivacyReport
import com.privacyguard.ai.domain.repository.ReportRepository
import javax.inject.Inject

/**
 * Use case: Generate a weekly privacy report.
 *
 * Feature 6: Weekly Privacy Reports
 */
class GenerateReportUseCase @Inject constructor(
    private val reportRepository: ReportRepository,
) {
    /**
     * Generates and saves a new weekly privacy report.
     *
     * @return The generated [PrivacyReport]
     */
    suspend operator fun invoke(): PrivacyReport =
        reportRepository.generateWeeklyReport()
}
