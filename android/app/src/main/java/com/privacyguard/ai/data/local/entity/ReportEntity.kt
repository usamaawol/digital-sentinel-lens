package com.privacyguard.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Room entity for storing weekly privacy reports.
 *
 * Feature 5: Local Security Database — Risk Reports table
 * Feature 6: Weekly Privacy Reports
 *
 * Table: privacy_reports
 */
@Entity(tableName = "privacy_reports")
data class ReportEntity(
    @PrimaryKey
    @ColumnInfo(name = "report_id")
    val reportId: String,

    @ColumnInfo(name = "week_start_date")
    val weekStartDate: String,

    @ColumnInfo(name = "generated_at")
    val generatedAt: Long,

    @ColumnInfo(name = "overall_score")
    val overallScore: Int,

    @ColumnInfo(name = "score_delta")
    val scoreDelta: Int,

    /** JSON-serialized DailyUsageData list */
    @ColumnInfo(name = "daily_usage_json")
    val dailyUsageJson: String,

    /** JSON array of newly installed app package names */
    @ColumnInfo(name = "new_apps_json")
    val newAppsJson: String,

    /** JSON array of uninstalled app package names */
    @ColumnInfo(name = "uninstalled_apps_json")
    val uninstalledAppsJson: String,

    /** JSON-serialized PermissionChange list */
    @ColumnInfo(name = "permission_changes_json")
    val permissionChangesJson: String,

    /** JSON-serialized AppRiskSummary list */
    @ColumnInfo(name = "top_risk_apps_json")
    val topRiskAppsJson: String,

    /** JSON array of AI recommendation strings */
    @ColumnInfo(name = "ai_recommendations_json")
    val aiRecommendationsJson: String,
)

/**
 * Room entity for security notifications.
 *
 * Feature 11: Security Notifications
 * Feature 5: Local Security Database
 *
 * Table: notifications
 */
@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey
    @ColumnInfo(name = "notification_id")
    val notificationId: String,

    @ColumnInfo(name = "type")
    val type: String,

    @ColumnInfo(name = "title")
    val title: String,

    @ColumnInfo(name = "message")
    val message: String,

    @ColumnInfo(name = "package_name")
    val packageName: String?,

    @ColumnInfo(name = "created_at")
    val createdAt: Long,

    @ColumnInfo(name = "is_read")
    val isRead: Boolean,
)
