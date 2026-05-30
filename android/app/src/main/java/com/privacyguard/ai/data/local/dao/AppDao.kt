package com.privacyguard.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.privacyguard.ai.data.local.entity.AppEntity
import kotlinx.coroutines.flow.Flow

/**
 * Room DAO for application data.
 *
 * Feature 5: Local Security Database — Applications table
 */
@Dao
interface AppDao {

    /**
     * Observes all apps, ordered by privacy score ascending (highest risk first).
     * Emits a new list whenever the table changes.
     */
    @Query("SELECT * FROM apps ORDER BY privacy_score ASC")
    fun observeAll(): Flow<List<AppEntity>>

    /**
     * Returns all apps as a one-shot query.
     */
    @Query("SELECT * FROM apps ORDER BY privacy_score ASC")
    suspend fun getAll(): List<AppEntity>

    /**
     * Returns a single app by package name.
     */
    @Query("SELECT * FROM apps WHERE package_name = :packageName LIMIT 1")
    suspend fun getByPackageName(packageName: String): AppEntity?

    /**
     * Returns apps filtered by risk level.
     */
    @Query("SELECT * FROM apps WHERE risk_level = :riskLevel ORDER BY privacy_score ASC")
    fun observeByRiskLevel(riskLevel: String): Flow<List<AppEntity>>

    /**
     * Returns the total count of apps.
     */
    @Query("SELECT COUNT(*) FROM apps")
    suspend fun getCount(): Int

    /**
     * Returns all package names currently in the database.
     * Used to detect newly installed or uninstalled apps.
     */
    @Query("SELECT package_name FROM apps")
    suspend fun getAllPackageNames(): List<String>

    /**
     * Inserts or replaces an app record.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(app: AppEntity)

    /**
     * Inserts or replaces multiple app records in a single transaction.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(apps: List<AppEntity>)

    /**
     * Updates an existing app record.
     */
    @Update
    suspend fun update(app: AppEntity)

    /**
     * Deletes an app by package name.
     */
    @Query("DELETE FROM apps WHERE package_name = :packageName")
    suspend fun deleteByPackageName(packageName: String)

    /**
     * Deletes all apps. Used when performing a full rescan.
     */
    @Query("DELETE FROM apps")
    suspend fun deleteAll()

    /**
     * Returns apps that haven't been scanned in the last [staleThresholdMs] milliseconds.
     */
    @Query("SELECT * FROM apps WHERE last_scan_at < :staleThresholdMs OR last_scan_at IS NULL")
    suspend fun getStaleApps(staleThresholdMs: Long): List<AppEntity>
}
