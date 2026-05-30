package com.privacyguard.ai.di

import com.privacyguard.ai.data.repository.AppRepositoryImpl
import com.privacyguard.ai.data.repository.ReportRepositoryImpl
import com.privacyguard.ai.data.repository.ScanRepositoryImpl
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.repository.ReportRepository
import com.privacyguard.ai.domain.repository.ScanRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module binding repository interfaces to their implementations.
 *
 * This is where the dependency inversion principle is applied:
 * the domain layer depends on interfaces, and this module wires
 * the concrete implementations at runtime.
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAppRepository(impl: AppRepositoryImpl): AppRepository

    @Binds
    @Singleton
    abstract fun bindScanRepository(impl: ScanRepositoryImpl): ScanRepository

    @Binds
    @Singleton
    abstract fun bindReportRepository(impl: ReportRepositoryImpl): ReportRepository
}
