package com.privacyguard.ai.domain.model

/**
 * Domain model representing a single Android permission.
 *
 * Feature 2: Permission Analysis Engine
 *
 * Each permission carries:
 * - Its Android manifest name
 * - A human-readable explanation
 * - A risk classification
 * - Whether it has been granted by the user
 * - Whether it is a "dangerous" permission (requires runtime grant)
 * - The permission group it belongs to
 */
data class PermissionInfo(
    /** Full Android permission name (e.g. android.permission.CAMERA) */
    val permissionName: String,

    /** Short display name (e.g. "Camera") */
    val displayName: String,

    /** Plain-English explanation of what this permission allows */
    val explanation: String,

    /** Risk classification for this permission */
    val riskLevel: PermissionRisk,

    /** Whether the user has granted this permission */
    val isGranted: Boolean,

    /** Whether this is a dangerous permission requiring runtime grant */
    val isDangerous: Boolean,

    /** The logical group this permission belongs to */
    val group: PermissionGroup,
)

/**
 * Risk level specific to permissions.
 * Separate from RiskLevel to allow finer-grained permission scoring.
 */
enum class PermissionRisk(val weight: Int, val displayName: String) {
    /** Low risk — minimal privacy impact (e.g. VIBRATE, INTERNET) */
    LOW(1, "Low"),

    /** Medium risk — moderate privacy impact (e.g. CAMERA, MICROPHONE) */
    MEDIUM(3, "Medium"),

    /** High risk — significant privacy impact (e.g. READ_CONTACTS, ACCESS_FINE_LOCATION) */
    HIGH(5, "High"),

    /** Critical risk — severe privacy impact (e.g. READ_SMS, RECORD_AUDIO in background) */
    CRITICAL(8, "Critical");
}

/**
 * Logical grouping of Android permissions.
 * Used by the purpose validation engine (Feature 4) to detect mismatches
 * between an app's category and its requested permission groups.
 */
enum class PermissionGroup(val displayName: String) {
    CAMERA("Camera"),
    MICROPHONE("Microphone"),
    LOCATION("Location"),
    CONTACTS("Contacts"),
    SMS("SMS"),
    PHONE("Phone"),
    STORAGE("Storage"),
    NOTIFICATIONS("Notifications"),
    CALENDAR("Calendar"),
    SENSORS("Body Sensors"),
    BLUETOOTH("Bluetooth"),
    NETWORK("Network"),
    SYSTEM("System"),
    OTHER("Other");
}

/**
 * Catalog of all analyzed permissions with their metadata.
 * This is the single source of truth for permission risk classification.
 *
 * Feature 2: Permission Analysis Engine
 */
object PermissionCatalog {

    /**
     * Returns a [PermissionInfo] for the given Android permission name.
     * Falls back to a generic entry for unknown permissions.
     */
    fun analyze(permissionName: String, isGranted: Boolean): PermissionInfo {
        return catalog[permissionName]?.copy(isGranted = isGranted)
            ?: buildUnknownPermission(permissionName, isGranted)
    }

    private fun buildUnknownPermission(name: String, isGranted: Boolean): PermissionInfo {
        val shortName = name.substringAfterLast(".")
        return PermissionInfo(
            permissionName = name,
            displayName = shortName.replace("_", " ").lowercase()
                .replaceFirstChar { it.uppercase() },
            explanation = "This permission is not in our catalog. Review it manually.",
            riskLevel = PermissionRisk.MEDIUM,
            isGranted = isGranted,
            isDangerous = false,
            group = PermissionGroup.OTHER,
        )
    }

    private val catalog: Map<String, PermissionInfo> = buildMap {

        // ── CAMERA ──────────────────────────────────────────────────────────
        put(
            "android.permission.CAMERA",
            PermissionInfo(
                permissionName = "android.permission.CAMERA",
                displayName = "Camera",
                explanation = "Allows the app to take photos and record videos using the device camera. " +
                    "Legitimate uses include video calls, QR scanning, and photo editing. " +
                    "Be cautious if a utility or game app requests this.",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.CAMERA,
            )
        )

        // ── MICROPHONE ──────────────────────────────────────────────────────
        put(
            "android.permission.RECORD_AUDIO",
            PermissionInfo(
                permissionName = "android.permission.RECORD_AUDIO",
                displayName = "Microphone",
                explanation = "Allows the app to record audio using the device microphone. " +
                    "Used for voice calls, voice search, and audio recording. " +
                    "High risk if the app can access the microphone in the background.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.MICROPHONE,
            )
        )

        // ── LOCATION ────────────────────────────────────────────────────────
        put(
            "android.permission.ACCESS_FINE_LOCATION",
            PermissionInfo(
                permissionName = "android.permission.ACCESS_FINE_LOCATION",
                displayName = "Precise Location",
                explanation = "Allows the app to access your exact GPS location. " +
                    "This is the most privacy-sensitive location permission. " +
                    "Prefer 'While in use' over 'Always allow' unless navigation is required.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.LOCATION,
            )
        )
        put(
            "android.permission.ACCESS_COARSE_LOCATION",
            PermissionInfo(
                permissionName = "android.permission.ACCESS_COARSE_LOCATION",
                displayName = "Approximate Location",
                explanation = "Allows the app to access your approximate location (city-level). " +
                    "Less precise than GPS but still reveals your general area.",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.LOCATION,
            )
        )
        put(
            "android.permission.ACCESS_BACKGROUND_LOCATION",
            PermissionInfo(
                permissionName = "android.permission.ACCESS_BACKGROUND_LOCATION",
                displayName = "Background Location",
                explanation = "Allows the app to access your location even when you are not using it. " +
                    "This is a critical privacy risk — only grant to navigation or safety apps.",
                riskLevel = PermissionRisk.CRITICAL,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.LOCATION,
            )
        )

        // ── CONTACTS ────────────────────────────────────────────────────────
        put(
            "android.permission.READ_CONTACTS",
            PermissionInfo(
                permissionName = "android.permission.READ_CONTACTS",
                displayName = "Read Contacts",
                explanation = "Allows the app to read your entire contact list including names, " +
                    "phone numbers, and email addresses. Many apps upload this data to their servers.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.CONTACTS,
            )
        )
        put(
            "android.permission.WRITE_CONTACTS",
            PermissionInfo(
                permissionName = "android.permission.WRITE_CONTACTS",
                displayName = "Write Contacts",
                explanation = "Allows the app to create, edit, or delete your contacts. " +
                    "This is rarely needed and should be scrutinized carefully.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.CONTACTS,
            )
        )

        // ── SMS ─────────────────────────────────────────────────────────────
        put(
            "android.permission.READ_SMS",
            PermissionInfo(
                permissionName = "android.permission.READ_SMS",
                displayName = "Read SMS",
                explanation = "Allows the app to read all your text messages. " +
                    "This is a critical permission — SMS messages often contain OTP codes and sensitive information.",
                riskLevel = PermissionRisk.CRITICAL,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.SMS,
            )
        )
        put(
            "android.permission.SEND_SMS",
            PermissionInfo(
                permissionName = "android.permission.SEND_SMS",
                displayName = "Send SMS",
                explanation = "Allows the app to send text messages, potentially incurring charges. " +
                    "Malicious apps can use this to send premium-rate messages.",
                riskLevel = PermissionRisk.CRITICAL,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.SMS,
            )
        )
        put(
            "android.permission.RECEIVE_SMS",
            PermissionInfo(
                permissionName = "android.permission.RECEIVE_SMS",
                displayName = "Receive SMS",
                explanation = "Allows the app to intercept incoming text messages before they reach your inbox. " +
                    "Can be used to steal OTP authentication codes.",
                riskLevel = PermissionRisk.CRITICAL,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.SMS,
            )
        )

        // ── PHONE ────────────────────────────────────────────────────────────
        put(
            "android.permission.READ_PHONE_STATE",
            PermissionInfo(
                permissionName = "android.permission.READ_PHONE_STATE",
                displayName = "Phone State",
                explanation = "Allows the app to access your phone number, IMEI, and call status. " +
                    "Often used for device fingerprinting and ad tracking.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.PHONE,
            )
        )
        put(
            "android.permission.CALL_PHONE",
            PermissionInfo(
                permissionName = "android.permission.CALL_PHONE",
                displayName = "Make Calls",
                explanation = "Allows the app to initiate phone calls without your confirmation. " +
                    "Can be abused to call premium-rate numbers.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.PHONE,
            )
        )
        put(
            "android.permission.READ_CALL_LOG",
            PermissionInfo(
                permissionName = "android.permission.READ_CALL_LOG",
                displayName = "Read Call Log",
                explanation = "Allows the app to read your complete call history. " +
                    "Reveals who you communicate with and how often.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.PHONE,
            )
        )

        // ── STORAGE ──────────────────────────────────────────────────────────
        put(
            "android.permission.READ_EXTERNAL_STORAGE",
            PermissionInfo(
                permissionName = "android.permission.READ_EXTERNAL_STORAGE",
                displayName = "Read Storage",
                explanation = "Allows the app to read files from your device storage, " +
                    "including photos, documents, and downloads.",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.STORAGE,
            )
        )
        put(
            "android.permission.WRITE_EXTERNAL_STORAGE",
            PermissionInfo(
                permissionName = "android.permission.WRITE_EXTERNAL_STORAGE",
                displayName = "Write Storage",
                explanation = "Allows the app to create, modify, or delete files on your device storage.",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.STORAGE,
            )
        )
        put(
            "android.permission.READ_MEDIA_IMAGES",
            PermissionInfo(
                permissionName = "android.permission.READ_MEDIA_IMAGES",
                displayName = "Read Photos",
                explanation = "Allows the app to read your photos and images (Android 13+).",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.STORAGE,
            )
        )
        put(
            "android.permission.READ_MEDIA_VIDEO",
            PermissionInfo(
                permissionName = "android.permission.READ_MEDIA_VIDEO",
                displayName = "Read Videos",
                explanation = "Allows the app to read your video files (Android 13+).",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.STORAGE,
            )
        )
        put(
            "android.permission.READ_MEDIA_AUDIO",
            PermissionInfo(
                permissionName = "android.permission.READ_MEDIA_AUDIO",
                displayName = "Read Audio Files",
                explanation = "Allows the app to read your audio files (Android 13+).",
                riskLevel = PermissionRisk.LOW,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.STORAGE,
            )
        )

        // ── NOTIFICATIONS ────────────────────────────────────────────────────
        put(
            "android.permission.POST_NOTIFICATIONS",
            PermissionInfo(
                permissionName = "android.permission.POST_NOTIFICATIONS",
                displayName = "Notifications",
                explanation = "Allows the app to send you push notifications. " +
                    "Low risk on its own, but can be used for spam or phishing.",
                riskLevel = PermissionRisk.LOW,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.NOTIFICATIONS,
            )
        )

        // ── CALENDAR ─────────────────────────────────────────────────────────
        put(
            "android.permission.READ_CALENDAR",
            PermissionInfo(
                permissionName = "android.permission.READ_CALENDAR",
                displayName = "Read Calendar",
                explanation = "Allows the app to read your calendar events, including meeting details and locations.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.CALENDAR,
            )
        )
        put(
            "android.permission.WRITE_CALENDAR",
            PermissionInfo(
                permissionName = "android.permission.WRITE_CALENDAR",
                displayName = "Write Calendar",
                explanation = "Allows the app to create, modify, or delete your calendar events.",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.CALENDAR,
            )
        )

        // ── SENSORS ──────────────────────────────────────────────────────────
        put(
            "android.permission.BODY_SENSORS",
            PermissionInfo(
                permissionName = "android.permission.BODY_SENSORS",
                displayName = "Body Sensors",
                explanation = "Allows the app to access data from health sensors like heart rate monitors.",
                riskLevel = PermissionRisk.HIGH,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.SENSORS,
            )
        )

        // ── BLUETOOTH ────────────────────────────────────────────────────────
        put(
            "android.permission.BLUETOOTH_SCAN",
            PermissionInfo(
                permissionName = "android.permission.BLUETOOTH_SCAN",
                displayName = "Bluetooth Scan",
                explanation = "Allows the app to scan for nearby Bluetooth devices. " +
                    "Can be used to infer your location even without GPS.",
                riskLevel = PermissionRisk.MEDIUM,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.BLUETOOTH,
            )
        )
        put(
            "android.permission.BLUETOOTH_CONNECT",
            PermissionInfo(
                permissionName = "android.permission.BLUETOOTH_CONNECT",
                displayName = "Bluetooth Connect",
                explanation = "Allows the app to connect to paired Bluetooth devices.",
                riskLevel = PermissionRisk.LOW,
                isGranted = false,
                isDangerous = true,
                group = PermissionGroup.BLUETOOTH,
            )
        )

        // ── NETWORK ──────────────────────────────────────────────────────────
        put(
            "android.permission.INTERNET",
            PermissionInfo(
                permissionName = "android.permission.INTERNET",
                displayName = "Internet Access",
                explanation = "Allows the app to access the internet. " +
                    "Nearly all apps require this, but it means data can be sent to remote servers.",
                riskLevel = PermissionRisk.LOW,
                isGranted = false,
                isDangerous = false,
                group = PermissionGroup.NETWORK,
            )
        )
        put(
            "android.permission.ACCESS_WIFI_STATE",
            PermissionInfo(
                permissionName = "android.permission.ACCESS_WIFI_STATE",
                displayName = "Wi-Fi State",
                explanation = "Allows the app to view information about Wi-Fi networks. " +
                    "Can be used to infer your location via known Wi-Fi networks.",
                riskLevel = PermissionRisk.LOW,
                isGranted = false,
                isDangerous = false,
                group = PermissionGroup.NETWORK,
            )
        )
    }
}
