package com.privacyguard.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.privacyguard.ai.data.local.converter.RoomConverters

/**
 * Room entity for storing scanned application data.
 *
 * Feature 5: Local Security Database — Applications table
 *
 * Table: apps
 */
@Entity(tableName = "apps")
@TypeConverters(RoomConverters::class)
data class AppEntity(
    @PrimaryKey
    @ColumnInfo(name = "package_name")
    val packageName: String,

    @ColumnInfo(name = "app_name")
    val appName: String,

    @ColumnInfo(name = "version_name")
    val versionName: String,

    @ColumnInfo(name = "version_code")
    val versionCode: Long,

    @ColumnInfo(name = "developer_name")
    val developerName: String,

    @ColumnInfo(name = "category")
    val category: String,

    @ColumnInfo(name = "install_time")
    val installTime: Long,

    @ColumnInfo(name = "update_time")
    val updateTime: Long,

    @ColumnInfo(name = "is_system_app")
    val isSystemApp: Boolean,

    @ColumnInfo(name = "privacy_score")
    val privacyScore: Int?,

    @ColumnInfo(name = "risk_level")
    val riskLevel: String?,

    @ColumnInfo(name = "last_scan_at")
    val lastScanAt: Long?,

    /** JSON-serialized list of PermissionEntity objects */
    @ColumnInfo(name = "permissions_json")
    val permissionsJson: String,
)
