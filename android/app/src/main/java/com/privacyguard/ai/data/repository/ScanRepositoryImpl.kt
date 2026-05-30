package com.privacyguard.ai.data.repository

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.privacyguard.ai.data.local.dao.ScanDao
import com.privacyguard.ai.data.local.entity.ScanEntity
import com.privacyguard.ai.domain.model.PermissionChange
import com.privacyguard.ai.domain.model.PermissionChangeType
import com.privacyguard.ai.domain.model.ScanResult
import com.privacyguard.ai.domain.model.ScanType
import com.privacyguard.ai.domain.repository.ScanRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [ScanRepository].
 *
 * Feature 5: Local Security Database — Scan History
 */
@Singleton
class ScanRepositoryImpl @Inject constructor(
    private val scanDao: ScanDao,
    private val gson: Gson,
) : ScanRepository {

    override fun observeScanHistory(): Flow<List<ScanResult>> =
        scanDao.observeAll().map { entities ->
            entities.map { it.toDomain(gson) }
        }

    override suspend fun getLatestScan(): ScanResult? =
        scanDao.getLatest()?.toDomain(gson)

    override suspend fun saveScan(scanResult: ScanResult) {
        scanDao.insert(scanResult.toEntity(gson))
    }

    override suspend fun getScansInRange(fromTimestamp: Long, toTimestamp: Long): List<ScanResult> =
        scanDao.getInRange(fromTimestamp, toTimestamp).map { it.toDomain(gson) }

    override suspend fun deleteScansOlderThan(timestamp: Long) {
        scanDao.deleteOlderThan(timestamp)
    }
}

// ── Mapping extensions ───────────────────────────────────────────────────────

private data class PermissionChangeJson(
    val packageName: String,
    val appName: String,
    val permissionName: String,
    val permissionDisplayName: String,
    val changeType: String,
    val detectedAt: Long,
)

private fun ScanResult.toEntity(gson: Gson): ScanEntity = ScanEntity(
    scanId = scanId,
    scannedAt = scannedAt,
    totalApps = totalApps,
    safeApps = safeApps,
    mediumRiskApps = mediumRiskApps,
    highRiskApps = highRiskApps,
    overallScore = overallScore,
    newAppsJson = gson.toJson(newApps),
    permissionChangesJson = gson.toJson(
        permissionChanges.map { change ->
            PermissionChangeJson(
                packageName = change.packageName,
                appName = change.appName,
                permissionName = change.permissionName,
                permissionDisplayName = change.permissionDisplayName,
                changeType = change.changeType.name,
                detectedAt = change.detectedAt,
            )
        }
    ),
    scanType = scanType.name,
)

private fun ScanEntity.toDomain(gson: Gson): ScanResult {
    val newAppsType = object : TypeToken<List<String>>() {}.type
    val newApps: List<String> = try {
        gson.fromJson(newAppsJson, newAppsType) ?: emptyList()
    } catch (e: Exception) {
        emptyList()
    }

    val changesType = object : TypeToken<List<PermissionChangeJson>>() {}.type
    val permissionChanges: List<PermissionChange> = try {
        val jsonList: List<PermissionChangeJson> = gson.fromJson(permissionChangesJson, changesType) ?: emptyList()
        jsonList.map { json ->
            PermissionChange(
                packageName = json.packageName,
                appName = json.appName,
                permissionName = json.permissionName,
                permissionDisplayName = json.permissionDisplayName,
                changeType = runCatching { PermissionChangeType.valueOf(json.changeType) }
                    .getOrDefault(PermissionChangeType.ADDED),
                detectedAt = json.detectedAt,
            )
        }
    } catch (e: Exception) {
        Timber.w(e, "Failed to deserialize permission changes for scan $scanId")
        emptyList()
    }

    return ScanResult(
        scanId = scanId,
        scannedAt = scannedAt,
        totalApps = totalApps,
        safeApps = safeApps,
        mediumRiskApps = mediumRiskApps,
        highRiskApps = highRiskApps,
        overallScore = overallScore,
        newApps = newApps,
        permissionChanges = permissionChanges,
        scanType = runCatching { ScanType.valueOf(scanType) }.getOrDefault(ScanType.MANUAL),
    )
}
