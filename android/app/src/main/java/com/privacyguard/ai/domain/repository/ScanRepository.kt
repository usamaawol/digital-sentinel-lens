package com.privacyguard.ai.domain.repository

import com.privacyguard.ai.domain.model.ScanResult
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for scan history.
 *
 * Feature 5: Local Security Database — Scan History table
 * Feature 6: Weekly Privacy Reports
 */
interface ScanRepository {

    /**
     * Returns a Flow of all scan results, ordered by most recent first.
     */
    fun observeScanHistory(): Flow<List<ScanResult>>

    /**
     * Returns the most recent scan result, or null if no scans have been performed.
     */
    suspend fun getLatestScan(): ScanResult?

    /**
     * Saves a scan result to the local database.
     */
    suspend fun saveScan(scanResult: ScanResult)

    /**
     * Returns scan results within a date range.
     *
     * @param fromTimestamp Unix timestamp (ms) — start of range
     * @param toTimestamp Unix timestamp (ms) — end of range
     */
    suspend fun getScansInRange(fromTimestamp: Long, toTimestamp: Long): List<ScanResult>

    /**
     * Deletes scan history older than the given timestamp.
     * Used for storage management.
     */
    suspend fun deleteScansOlderThan(timestamp: Long)
}
