package com.privacyguard.ai.data.scanner

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import com.privacyguard.ai.domain.model.AppCategory
import com.privacyguard.ai.domain.model.AppInfo
import com.privacyguard.ai.domain.model.PermissionCatalog
import com.privacyguard.ai.domain.model.PermissionInfo
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Native Android application scanner using PackageManager.
 *
 * Feature 1: Installed Application Scanner
 * Feature 2: Permission Analysis Engine
 *
 * Required Android permissions:
 *   - android.permission.QUERY_ALL_PACKAGES (Android 11+)
 *
 * This class is responsible for:
 *   1. Enumerating all installed applications
 *   2. Extracting app metadata (name, version, developer, install date)
 *   3. Extracting and analyzing all declared permissions
 *   4. Determining which permissions are granted
 *
 * The scoring is NOT done here — it is delegated to [PrivacyScoringEngine]
 * in the domain layer, keeping this class focused on data extraction.
 */
@Singleton
class AppScanner @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    private val packageManager: PackageManager = context.packageManager

    /**
     * Scans all installed applications and returns a list of [AppInfo] objects.
     *
     * This operation runs on the IO dispatcher as it involves disk reads.
     *
     * @param includeSystemApps Whether to include system apps in the scan.
     *                          Defaults to false to reduce noise.
     * @return List of [AppInfo] for all scanned apps
     */
    suspend fun scanAll(includeSystemApps: Boolean = false): List<AppInfo> =
        withContext(Dispatchers.IO) {
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                PackageManager.GET_PERMISSIONS or PackageManager.MATCH_UNINSTALLED_PACKAGES
            } else {
                @Suppress("DEPRECATION")
                PackageManager.GET_PERMISSIONS
            }

            val packages: List<PackageInfo> = try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    packageManager.getInstalledPackages(
                        PackageManager.PackageInfoFlags.of(flags.toLong())
                    )
                } else {
                    @Suppress("DEPRECATION")
                    packageManager.getInstalledPackages(flags)
                }
            } catch (e: Exception) {
                Timber.e(e, "Failed to get installed packages")
                emptyList()
            }

            packages
                .filter { pkg ->
                    // Filter out system apps unless explicitly requested
                    includeSystemApps || !isSystemApp(pkg.applicationInfo)
                }
                .filter { pkg ->
                    // Filter out our own app
                    pkg.packageName != context.packageName
                }
                .mapNotNull { pkg ->
                    try {
                        buildAppInfo(pkg)
                    } catch (e: Exception) {
                        Timber.w(e, "Failed to build AppInfo for ${pkg.packageName}")
                        null
                    }
                }
        }

    /**
     * Scans a single application by package name.
     *
     * @param packageName The package name to scan
     * @return [AppInfo] or null if the package is not found
     */
    suspend fun scanSingle(packageName: String): AppInfo? =
        withContext(Dispatchers.IO) {
            try {
                val flags = PackageManager.GET_PERMISSIONS
                val pkg = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    packageManager.getPackageInfo(
                        packageName,
                        PackageManager.PackageInfoFlags.of(flags.toLong())
                    )
                } else {
                    @Suppress("DEPRECATION")
                    packageManager.getPackageInfo(packageName, flags)
                }
                buildAppInfo(pkg)
            } catch (e: PackageManager.NameNotFoundException) {
                Timber.d("Package not found: $packageName")
                null
            } catch (e: Exception) {
                Timber.e(e, "Failed to scan package: $packageName")
                null
            }
        }

    /**
     * Returns all currently installed package names.
     * Used to detect newly installed or uninstalled apps.
     */
    suspend fun getInstalledPackageNames(): Set<String> =
        withContext(Dispatchers.IO) {
            try {
                val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    packageManager.getInstalledPackages(
                        PackageManager.PackageInfoFlags.of(0L)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    packageManager.getInstalledPackages(0)
                }
                flags.map { it.packageName }.toSet()
            } catch (e: Exception) {
                Timber.e(e, "Failed to get package names")
                emptySet()
            }
        }

    // ── Private helpers ──────────────────────────────────────────────────────

    private fun buildAppInfo(pkg: PackageInfo): AppInfo {
        val appInfo = pkg.applicationInfo
        val appName = packageManager.getApplicationLabel(appInfo).toString()
        val icon = try {
            packageManager.getApplicationIcon(pkg.packageName)
        } catch (e: Exception) {
            null
        }

        val permissions = analyzePermissions(pkg)
        val category = resolveCategory(appInfo)
        val developerName = resolveDeveloperName(pkg)

        return AppInfo(
            packageName = pkg.packageName,
            appName = appName,
            versionName = pkg.versionName ?: "Unknown",
            versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pkg.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                pkg.versionCode.toLong()
            },
            developerName = developerName,
            category = category,
            icon = icon,
            installTime = pkg.firstInstallTime,
            updateTime = pkg.lastUpdateTime,
            isSystemApp = isSystemApp(appInfo),
            permissions = permissions,
            privacyScore = null, // Scored separately by PrivacyScoringEngine
            riskLevel = null,    // Set after scoring
            lastScanAt = System.currentTimeMillis(),
        )
    }

    /**
     * Analyzes all permissions declared in the app's manifest.
     *
     * Feature 2: Permission Analysis Engine
     *
     * For each permission:
     * 1. Checks if it is declared in the manifest
     * 2. Checks if it has been granted by the user
     * 3. Looks up the permission in [PermissionCatalog] for risk metadata
     */
    private fun analyzePermissions(pkg: PackageInfo): List<PermissionInfo> {
        val declaredPermissions = pkg.requestedPermissions ?: return emptyList()
        val grantResults = pkg.requestedPermissionsFlags ?: IntArray(declaredPermissions.size)

        return declaredPermissions.mapIndexed { index, permissionName ->
            val isGranted = (grantResults.getOrNull(index) ?: 0) and
                PackageInfo.REQUESTED_PERMISSION_GRANTED != 0

            PermissionCatalog.analyze(permissionName, isGranted)
        }
    }

    /**
     * Resolves the app category from PackageManager.
     * Falls back to UNKNOWN if the category is not set.
     */
    private fun resolveCategory(appInfo: ApplicationInfo): AppCategory {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AppCategory.fromAndroidCategory(appInfo.category)
        } else {
            AppCategory.UNKNOWN
        }
    }

    /**
     * Attempts to resolve the developer name from the app's signing certificate.
     * Falls back to the package name prefix if unavailable.
     */
    private fun resolveDeveloperName(pkg: PackageInfo): String {
        return try {
            // Try to get the installer package name as a proxy for developer
            val installerPackage = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                packageManager.getInstallSourceInfo(pkg.packageName).installingPackageName
            } else {
                @Suppress("DEPRECATION")
                packageManager.getInstallerPackageName(pkg.packageName)
            }

            when (installerPackage) {
                "com.android.vending" -> "Google Play Store"
                "com.amazon.venezia" -> "Amazon Appstore"
                null -> extractDeveloperFromPackageName(pkg.packageName)
                else -> extractDeveloperFromPackageName(pkg.packageName)
            }
        } catch (e: Exception) {
            extractDeveloperFromPackageName(pkg.packageName)
        }
    }

    /**
     * Extracts a human-readable developer name from the package name.
     * e.g. "com.whatsapp" → "Whatsapp"
     * e.g. "com.google.android.apps.maps" → "Google"
     */
    private fun extractDeveloperFromPackageName(packageName: String): String {
        val parts = packageName.split(".")
        return when {
            parts.size >= 2 -> parts[1].replaceFirstChar { it.uppercase() }
            else -> packageName
        }
    }

    private fun isSystemApp(appInfo: ApplicationInfo?): Boolean {
        if (appInfo == null) return false
        return (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
    }
}
