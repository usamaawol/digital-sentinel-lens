package com.privacyguard.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.privacyguard.ai.data.local.entity.ScanEntity
import kotlinx.coroutines.flow.Flow

/**
 * Room DAO for scan history.
 *
 * Feature 5: Local Security Database — Scan History table
 */
@Dao
interface ScanDao {

    /**
     * Observes all scan records, ordered by most recent first.
     */
    @Query("SELECT * FROM scan_history ORDER BY scanned_at DESC")
    fun observeAll(): Flow<List<ScanEntity>>

    /**
     * Returns the most recent scan record.
     */
    @Query("SELECT * FROM scan_history ORDER BY scanned_at DESC LIMIT 1")
    suspend fun getLatest(): ScanEntity?

    /**
     * Returns scans within a date range.
     */
    @Query("SELECT * FROM scan_history WHERE scanned_at BETWEEN :from AND :to ORDER BY scanned_at DESC")
    suspend fun getInRange(from: Long, to: Long): List<ScanEntity>

    /**
     * Inserts a scan record.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(scan: ScanEntity)

    /**
     * Deletes scans older than the given timestamp.
     */
    @Query("DELETE FROM scan_history WHERE scanned_at < :timestamp")
    suspend fun deleteOlderThan(timestamp: Long)
}
