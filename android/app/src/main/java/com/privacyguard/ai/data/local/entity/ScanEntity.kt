package com.privacyguard.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.privacyguard.ai.data.local.converter.RoomConverters

/**
 * Room entity for storing scan history.
 *
 * Feature 5: Local Security Database — Scan History table
 *
 * Table: scan_history
 */
@Entity(tableName = "scan_history")
@TypeConverters(RoomConverters::class)
data class ScanEntity(
    @PrimaryKey
    @ColumnInfo(name = "scan_id")
    val scanId: String,

    @ColumnInfo(name = "scanned_at")
    val scannedAt: Long,

    @ColumnInfo(name = "total_apps")
    val totalApps: Int,

    @ColumnInfo(name = "safe_apps")
    val safeApps: Int,

    @ColumnInfo(name = "medium_risk_apps")
    val mediumRiskApps: Int,

    @ColumnInfo(name = "high_risk_apps")
    val highRiskApps: Int,

    @ColumnInfo(name = "overall_score")
    val overallScore: Int,

    /** JSON array of new app package names */
    @ColumnInfo(name = "new_apps_json")
    val newAppsJson: String,

    /** JSON array of PermissionChange objects */
    @ColumnInfo(name = "permission_changes_json")
    val permissionChangesJson: String,

    @ColumnInfo(name = "scan_type")
    val scanType: String,
)
