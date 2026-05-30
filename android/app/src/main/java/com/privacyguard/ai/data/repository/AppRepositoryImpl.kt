package com.privacyguard.ai.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.privacyguard.ai.data.local.dao.AppDao
import com.privacyguard.ai.data.local.entity.AppEntity
import com.privacyguard.ai.data.scanner.AppScanner
import com.privacyguard.ai.domain.model.AppCategory
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.PermissionCatalog
import com.privacyguard.ai.domain.model.PermissionInfo
import com.privacyguard.ai.domain.model.PermissionChangeType
import com.privacyguard.ai.domain.model.RiskLevel
import com.privacyguard.ai.domain.model.ScanResult
import com.privacyguard.ai.domain.model.ScanType
import com.privacyguard.ai.domain.repository.AppRepository
import com.privacyguard.ai.domain.scoring.PrivacyScoringEngine
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import timber.log.Timber
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of [AppRepository].
 *
 * Coordinates between:
 * - [AppScanner] (Android PackageManager)
 * - [AppDao] (Room local database)
 * - [PrivacyScoringEngine] (domain scoring)
 * - Firebase Firestore (cloud sync)
 *
 * Feature 1: Installed Application Scanner
 * Feature 2: Permission Analysis Engine
 * Feature 3: Privacy Scoring System
 * Feature 5: Local Security Database
 */
@Singleton
class AppRepositoryImpl @Inject constructor(
    private val appDao: AppDao,
    private val appScanner: AppScanner,
    private val scoringEngine: PrivacyScoringEngine,
    private val firestore: FirebaseFirestore,
    private val gson: Gson,
) : AppRepository {

    override fun observeApps(): Flow<List<AppInfo>> =
        appDao.observeAll().map { entities ->
            entities.map { it.toDomain(gson) }
        }

    override suspend fun getApp(packageName: String): AppInfo? =
        appDao.getByPackageName(packageName)?.toDomain(gson)

    override suspend fun scanInstalledApps(): ScanResult {
        Timber.d("Starting full device scan")

        // 1. Get previously known package names for change detection
        val previousPackageNames = appDao.getAllPackageNames().toSet()

        // 2. Scan all installed apps via PackageManager
        val scannedApps = appScanner.scanAll(includeSystemApps = false)
        Timber.d("Scanned ${scannedApps.size} apps")

        // 3. Score each app using the privacy scoring engine
        val scoredApps = scannedApps.map { app ->
            val result = scoringEngine.score(app)
            app.copy(
                privacyScore = result.score,
                riskLevel = result.riskLevel,
            )
        }

        // 4. Detect new apps (installed since last scan)
        val currentPackageNames = scoredApps.map { it.packageName }.toSet()
        val newApps = currentPackageNames - previousPackageNames

        // 5. Detect permission changes
        val permissionChanges = detectPermissionChanges(scoredApps, previousPackageNames)

        // 6. Save all apps to local database
        appDao.insertAll(scoredApps.map { it.toEntity(gson) })

        // 7. Remove uninstalled apps from database
        val uninstalledPackages = previousPackageNames - currentPackageNames
        uninstalledPackages.forEach { pkg ->
            appDao.deleteByPackageName(pkg)
        }

        // 8. Compute overall device score
        val deviceScore = scoringEngine.scoreAll(scoredApps)

        // 9. Build and return scan result
        return ScanResult(
            scanId = UUID.randomUUID().toString(),
            scannedAt = System.currentTimeMillis(),
            totalApps = scoredApps.size,
            safeApps = deviceScore.safeCount + deviceScore.lowCount,
            mediumRiskApps = deviceScore.mediumCount,
            highRiskApps = deviceScore.highCount,
            overallScore = deviceScore.score,
            newApps = newApps.toList(),
            permissionChanges = permissionChanges,
            scanType = ScanType.MANUAL,
        )
    }

    override suspend fun saveApp(app: AppInfo) {
        appDao.insert(app.toEntity(gson))
    }

    override suspend fun saveApps(apps: List<AppInfo>) {
        appDao.insertAll(apps.map { it.toEntity(gson) })
    }

    override suspend fun deleteApp(packageName: String) {
        appDao.deleteByPackageName(packageName)
    }

    override suspend fun getAppCount(): Int = appDao.getCount()

    /**
     * Syncs app summaries to Firestore.
     * Only syncs non-sensitive summary data — no permission details are uploaded.
     *
     * Firestore path: users/{userId}/apps/{packageName}
     */
    override suspend fun syncToFirestore(userId: String) {
        try {
            val apps = appDao.getAll()
            val batch = firestore.batch()
            val userAppsRef = firestore.collection("users").document(userId).collection("apps")

            apps.forEach { entity ->
                val docRef = userAppsRef.document(
                    entity.packageName.replace(".", "_")
                )
                val summary = mapOf(
                    "packageName" to entity.packageName,
                    "appName" to entity.appName,
                    "privacyScore" to entity.privacyScore,
                    "riskLevel" to entity.riskLevel,
                    "category" to entity.category,
                    "lastScanAt" to entity.lastScanAt,
                    "syncedAt" to System.currentTimeMillis(),
                )
                batch.set(docRef, summary)
            }

            batch.commit().await()
            Timber.d("Synced ${apps.size} apps to Firestore")
        } catch (e: Exception) {
            Timber.e(e, "Failed to sync apps to Firestore")
            // Don't throw — sync failure should not break the app
        }
    }

    // ── Permission change detection ──────────────────────────────────────────

    private suspend fun detectPermissionChanges(
        currentApps: List<AppInfo>,
        previousPackageNames: Set<String>,
    ): List<com.privacyguard.ai.domain.model.PermissionChange> {
        val changes = mutableListOf<com.privacyguard.ai.domain.model.PermissionChange>()

        // Only check apps that existed before this scan
        val existingApps = currentApps.filter { it.packageName in previousPackageNames }

        for (app in existingApps) {
            val previousEntity = appDao.getByPackageName(app.packageName) ?: continue
            val previousPermissions = previousEntity.deserializePermissions(gson)

            val previousGranted = previousPermissions
                .filter { it.isGranted }
                .map { it.permissionName }
                .toSet()

            val currentGranted = app.permissions
                .filter { it.isGranted }
                .map { it.permissionName }
                .toSet()

            // Newly granted permissions
            (currentGranted - previousGranted).forEach { permName ->
                val permInfo = PermissionCatalog.analyze(permName, true)
                changes.add(
                    com.privacyguard.ai.domain.model.PermissionChange(
                        packageName = app.packageName,
                        appName = app.appName,
                        permissionName = permName,
                        permissionDisplayName = permInfo.displayName,
                        changeType = PermissionChangeType.GRANTED,
                        detectedAt = System.currentTimeMillis(),
                    )
                )
            }

            // Revoked permissions
            (previousGranted - currentGranted).forEach { permName ->
                val permInfo = PermissionCatalog.analyze(permName, false)
                changes.add(
                    com.privacyguard.ai.domain.model.PermissionChange(
                        packageName = app.packageName,
                        appName = app.appName,
                        permissionName = permName,
                        permissionDisplayName = permInfo.displayName,
                        changeType = PermissionChangeType.REVOKED,
                        detectedAt = System.currentTimeMillis(),
                    )
                )
            }
        }

        return changes
    }
}

// ── Mapping extensions ───────────────────────────────────────────────────────

private data class PermissionJson(
    val permissionName: String,
    val displayName: String,
    val explanation: String,
    val riskLevel: String,
    val isGranted: Boolean,
    val isDangerous: Boolean,
    val group: String,
)

private fun AppInfo.toEntity(gson: Gson): AppEntity {
    val permissionsJson = gson.toJson(
        permissions.map { perm ->
            PermissionJson(
                permissionName = perm.permissionName,
                displayName = perm.displayName,
                explanation = perm.explanation,
                riskLevel = perm.riskLevel.name,
                isGranted = perm.isGranted,
                isDangerous = perm.isDangerous,
                group = perm.group.name,
            )
        }
    )
    return AppEntity(
        packageName = packageName,
        appName = appName,
        versionName = versionName,
        versionCode = versionCode,
        developerName = developerName,
        category = category.name,
        installTime = installTime,
        updateTime = updateTime,
        isSystemApp = isSystemApp,
        privacyScore = privacyScore,
        riskLevel = riskLevel?.name,
        lastScanAt = lastScanAt,
        permissionsJson = permissionsJson,
    )
}

private fun AppEntity.toDomain(gson: Gson): AppInfo {
    val permissions = deserializePermissions(gson)
    return AppInfo(
        packageName = packageName,
        appName = appName,
        versionName = versionName,
        versionCode = versionCode,
        developerName = developerName,
        category = try { AppCategory.valueOf(category) } catch (e: Exception) { AppCategory.UNKNOWN },
        icon = null, // Icons are not persisted — loaded on demand
        installTime = installTime,
        updateTime = updateTime,
        isSystemApp = isSystemApp,
        permissions = permissions,
        privacyScore = privacyScore,
        riskLevel = riskLevel?.let { runCatching { RiskLevel.valueOf(it) }.getOrNull() },
        lastScanAt = lastScanAt,
    )
}

private fun AppEntity.deserializePermissions(gson: Gson): List<PermissionInfo> {
    return try {
        val type = object : TypeToken<List<PermissionJson>>() {}.type
        val jsonList: List<PermissionJson> = gson.fromJson(permissionsJson, type) ?: emptyList()
        jsonList.map { json ->
            PermissionCatalog.analyze(json.permissionName, json.isGranted)
        }
    } catch (e: Exception) {
        Timber.w(e, "Failed to deserialize permissions for $packageName")
        emptyList()
    }
}
