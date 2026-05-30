package com.privacyguard.ai.domain.repository

import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.ScanResult
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for application data.
 *
 * Defines the contract between the domain layer and the data layer.
 * The domain layer depends on this interface; the data layer implements it.
 *
 * Feature 1: Installed Application Scanner
 * Feature 5: Local Security Database
 */
interface AppRepository {

    /**
     * Returns a Flow of all scanned apps from the local database.
     * Emits a new list whenever the database changes.
     */
    fun observeApps(): Flow<List<AppInfo>>

    /**
     * Returns a single app by package name, or null if not found.
     */
    suspend fun getApp(packageName: String): AppInfo?

    /**
     * Scans all installed applications on the device and stores results locally.
     * This is the main entry point for Feature 1.
     *
     * @return [ScanResult] with summary statistics
     */
    suspend fun scanInstalledApps(): ScanResult

    /**
     * Saves or updates an app record in the local database.
     */
    suspend fun saveApp(app: AppInfo)

    /**
     * Saves multiple app records in a single transaction.
     */
    suspend fun saveApps(apps: List<AppInfo>)

    /**
     * Deletes an app record from the local database.
     * Called when an app is uninstalled.
     */
    suspend fun deleteApp(packageName: String)

    /**
     * Returns the total count of scanned apps.
     */
    suspend fun getAppCount(): Int

    /**
     * Syncs app summaries to Firestore for the authenticated user.
     * Only syncs non-sensitive summary data (name, score, risk level).
     */
    suspend fun syncToFirestore(userId: String)
}
