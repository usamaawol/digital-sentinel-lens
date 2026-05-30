package com.privacyguard.ai.di

import android.content.Context
import androidx.room.Room
import com.privacyguard.ai.data.local.PrivacyGuardDatabase
import com.privacyguard.ai.data.local.dao.AppDao
import com.privacyguard.ai.data.local.dao.ReportDao
import com.privacyguard.ai.data.local.dao.ScanDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module providing Room database and DAO instances.
 *
 * Feature 5: Local Security Database
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): PrivacyGuardDatabase =
        Room.databaseBuilder(
            context,
            PrivacyGuardDatabase::class.java,
            PrivacyGuardDatabase.DATABASE_NAME,
        )
            .fallbackToDestructiveMigration() // Replace with proper migrations before production
            .build()

    @Provides
    @Singleton
    fun provideAppDao(database: PrivacyGuardDatabase): AppDao = database.appDao()

    @Provides
    @Singleton
    fun provideScanDao(database: PrivacyGuardDatabase): ScanDao = database.scanDao()

    @Provides
    @Singleton
    fun provideReportDao(database: PrivacyGuardDatabase): ReportDao = database.reportDao()
}
