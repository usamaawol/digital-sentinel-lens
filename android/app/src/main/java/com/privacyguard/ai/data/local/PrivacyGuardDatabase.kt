package com.privacyguard.ai.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.privacyguard.ai.data.local.converter.RoomConverters
import com.privacyguard.ai.data.local.dao.AppDao
import com.privacyguard.ai.data.local.dao.ReportDao
import com.privacyguard.ai.data.local.dao.ScanDao
import com.privacyguard.ai.data.local.entity.AppEntity
import com.privacyguard.ai.data.local.entity.NotificationEntity
import com.privacyguard.ai.data.local.entity.ReportEntity
import com.privacyguard.ai.data.local.entity.ScanEntity

/**
 * Room database for Privacy Guard AI.
 *
 * Feature 5: Local Security Database
 *
 * Tables:
 *   - apps          : Scanned application records
 *   - scan_history  : History of all device scans
 *   - privacy_reports : Weekly privacy reports
 *   - notifications : Security notifications
 *
 * Version history:
 *   1 — Initial schema
 */
@Database(
    entities = [
        AppEntity::class,
        ScanEntity::class,
        ReportEntity::class,
        NotificationEntity::class,
    ],
    version = 1,
    exportSchema = true,
)
@TypeConverters(RoomConverters::class)
abstract class PrivacyGuardDatabase : RoomDatabase() {

    abstract fun appDao(): AppDao
    abstract fun scanDao(): ScanDao
    abstract fun reportDao(): ReportDao

    companion object {
        const val DATABASE_NAME = "privacy_guard.db"
    }
}
