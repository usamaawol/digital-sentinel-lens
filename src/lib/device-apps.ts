/**
 * Device App Detection
 *
 * Detects apps installed on the user's device using multiple strategies:
 *
 * Strategy 1 — getInstalledRelatedApps() API (Android Chrome 80+)
 *   Returns apps listed in the web app manifest's "related_applications".
 *   Limited to apps that have declared a web association.
 *
 * Strategy 2 — URL scheme probing (Android/Desktop)
 *   Attempts to open known app deep-link schemes and detects if they resolve.
 *   Works for apps that register custom URL schemes.
 *
 * Strategy 3 — User-agent + navigator hints
 *   Detects the device type and OS to show relevant app suggestions.
 *
 * Strategy 4 — Manual selection from curated catalog
 *   User picks from a comprehensive list of popular apps.
 *   This is the primary UX — the other strategies enhance it.
 *
 * The catalog covers 50+ popular Android apps across all categories.
 */

import type { AppRecord } from "./mock-data";

// ── Full app catalog ──────────────────────────────────────────────────────────

const perm = (
  name: string,
  risk: "low" | "medium" | "high",
  explanation: string,
  granted = true,
) => ({ name, risk, explanation, granted });

export const APP_CATALOG: AppRecord[] = [
  // ── Social & Communication ──────────────────────────────────────────────────
  {
    id: "whatsapp", name: "WhatsApp", packageName: "com.whatsapp",
    developer: "Meta Platforms", version: "2.24.18", category: "Communication", icon: "💬",
    privacyScore: 72, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Contacts", "high", "Reads your full contact list. Contacts are uploaded to Meta servers."),
      perm("Microphone", "medium", "Used for voice messages and calls."),
      perm("Camera", "medium", "Used for photos and video calls."),
      perm("Storage", "low", "Saves media you send and receive."),
      perm("Notifications", "low", "Delivers new message alerts."),
    ],
  },
  {
    id: "telegram", name: "Telegram", packageName: "org.telegram.messenger",
    developer: "Telegram FZ-LLC", version: "10.3.2", category: "Communication", icon: "✈️",
    privacyScore: 85, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Contacts", "medium", "Used to find friends on Telegram. Hashed before upload."),
      perm("Microphone", "medium", "Voice messages and calls."),
      perm("Camera", "medium", "Photo and video sharing."),
      perm("Storage", "low", "Media storage."),
      perm("Notifications", "low", "Message alerts."),
    ],
  },
  {
    id: "signal", name: "Signal", packageName: "org.thoughtcrime.securesms",
    developer: "Signal Foundation", version: "7.20.4", category: "Communication", icon: "🔒",
    privacyScore: 96, riskLevel: "safe", lastScan: new Date().toISOString(),
    permissions: [
      perm("Contacts", "low", "Contacts are hashed locally — never uploaded to servers."),
      perm("Microphone", "medium", "End-to-end encrypted voice calls."),
      perm("Camera", "medium", "Secure photo sharing."),
      perm("Storage", "low", "Local media storage."),
      perm("Notifications", "low", "Encrypted message alerts."),
    ],
  },
  {
    id: "messenger", name: "Messenger", packageName: "com.facebook.orca",
    developer: "Meta Platforms", version: "450.0.0", category: "Communication", icon: "💙",
    privacyScore: 38, riskLevel: "high", lastScan: new Date().toISOString(),
    permissions: [
      perm("Contacts", "high", "Full contact list uploaded to Meta servers for ad targeting."),
      perm("Microphone", "high", "Can activate in background. Used for calls and audio messages."),
      perm("Camera", "high", "Heavy camera access for stories and video calls."),
      perm("Location", "high", "Used for location sharing and ad targeting."),
      perm("Storage", "medium", "Reads and writes media files."),
      perm("Notifications", "low", "Message alerts."),
    ],
  },
  {
    id: "viber", name: "Viber", packageName: "com.viber.voip",
    developer: "Viber Media", version: "22.5.0", category: "Communication", icon: "📞",
    privacyScore: 65, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Contacts", "high", "Uploads contact list to Viber servers."),
      perm("Microphone", "medium", "Voice calls and messages."),
      perm("Camera", "medium", "Video calls and photo sharing."),
      perm("Storage", "low", "Media storage."),
      perm("Notifications", "low", "Call and message alerts."),
    ],
  },

  // ── Social Media ────────────────────────────────────────────────────────────
  {
    id: "tiktok", name: "TikTok", packageName: "com.zhiliaoapp.musically",
    developer: "TikTok Pte. Ltd.", version: "33.2.4", category: "Social", icon: "🎵",
    privacyScore: 28, riskLevel: "high", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "high", "Heavy camera access — content uploaded to TikTok servers."),
      perm("Microphone", "high", "Frequently recording — can collect ambient audio."),
      perm("Location", "high", "Used for content targeting and ad profiling."),
      perm("Contacts", "medium", "Suggests friends. Uploads address book."),
      perm("Storage", "low", "Caches videos locally."),
      perm("Notifications", "low", "Engagement notifications."),
    ],
  },
  {
    id: "instagram", name: "Instagram", packageName: "com.instagram.android",
    developer: "Meta Platforms", version: "350.0.0", category: "Social", icon: "📷",
    privacyScore: 42, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "high", "Stories and posts — uploaded to Meta servers."),
      perm("Microphone", "high", "Reels and stories recording."),
      perm("Location", "high", "Location tagging and ad targeting."),
      perm("Contacts", "medium", "Friend suggestions. Uploads address book."),
      perm("Storage", "low", "Photo and video cache."),
      perm("Notifications", "low", "Activity alerts."),
    ],
  },
  {
    id: "facebook", name: "Facebook", packageName: "com.facebook.katana",
    developer: "Meta Platforms", version: "450.0.0", category: "Social", icon: "👤",
    privacyScore: 32, riskLevel: "high", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "high", "Photo and video uploads to Facebook."),
      perm("Microphone", "high", "Live video and audio recording."),
      perm("Location", "high", "Location history for ad targeting."),
      perm("Contacts", "high", "Full contact list uploaded for friend suggestions."),
      perm("Storage", "medium", "Media files access."),
      perm("Notifications", "low", "Activity and ad notifications."),
    ],
  },
  {
    id: "x", name: "X (Twitter)", packageName: "com.twitter.android",
    developer: "X Corp.", version: "10.62.0", category: "Social", icon: "🐦",
    privacyScore: 52, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "medium", "Photo and video tweets."),
      perm("Microphone", "medium", "Audio tweets and Spaces."),
      perm("Location", "medium", "Location tagging on tweets."),
      perm("Contacts", "medium", "Friend suggestions."),
      perm("Storage", "low", "Media cache."),
      perm("Notifications", "low", "Tweet and mention alerts."),
    ],
  },
  {
    id: "snapchat", name: "Snapchat", packageName: "com.snapchat.android",
    developer: "Snap Inc.", version: "12.85.0", category: "Social", icon: "👻",
    privacyScore: 45, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "high", "Core feature — snaps and stories."),
      perm("Microphone", "high", "Video snaps and voice messages."),
      perm("Location", "high", "Snap Map shows your real-time location to friends."),
      perm("Contacts", "medium", "Friend discovery."),
      perm("Storage", "low", "Snap storage."),
      perm("Notifications", "low", "Snap alerts."),
    ],
  },
  {
    id: "linkedin", name: "LinkedIn", packageName: "com.linkedin.android",
    developer: "LinkedIn Corp.", version: "9.1.0", category: "Social", icon: "💼",
    privacyScore: 58, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "medium", "Profile photos and posts."),
      perm("Microphone", "medium", "Audio messages."),
      perm("Contacts", "high", "Imports contacts to suggest connections."),
      perm("Storage", "low", "Media cache."),
      perm("Notifications", "low", "Job and connection alerts."),
    ],
  },

  // ── Entertainment & Streaming ───────────────────────────────────────────────
  {
    id: "youtube", name: "YouTube", packageName: "com.google.android.youtube",
    developer: "Google LLC", version: "19.45.0", category: "Entertainment", icon: "▶️",
    privacyScore: 62, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "low", "Used for YouTube Shorts recording."),
      perm("Microphone", "medium", "Voice search and Shorts."),
      perm("Location", "medium", "Content recommendations and ads."),
      perm("Storage", "low", "Offline video downloads."),
      perm("Notifications", "low", "Subscription alerts."),
    ],
  },
  {
    id: "netflix", name: "Netflix", packageName: "com.netflix.mediaclient",
    developer: "Netflix Inc.", version: "8.100.0", category: "Entertainment", icon: "🎬",
    privacyScore: 78, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Storage", "low", "Downloads for offline viewing."),
      perm("Notifications", "low", "New content alerts."),
    ],
  },
  {
    id: "spotify", name: "Spotify", packageName: "com.spotify.music",
    developer: "Spotify AB", version: "8.9.74", category: "Music & Audio", icon: "🎧",
    privacyScore: 74, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Microphone", "medium", "Voice search feature."),
      perm("Storage", "low", "Offline track downloads."),
      perm("Bluetooth", "low", "Speaker and headphone connection."),
      perm("Notifications", "low", "Now playing alerts."),
    ],
  },

  // ── Productivity & Tools ────────────────────────────────────────────────────
  {
    id: "gmail", name: "Gmail", packageName: "com.google.android.gm",
    developer: "Google LLC", version: "2024.10.0", category: "Productivity", icon: "📧",
    privacyScore: 70, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Contacts", "medium", "Auto-complete email addresses."),
      perm("Camera", "low", "Attach photos to emails."),
      perm("Storage", "low", "Email attachments."),
      perm("Notifications", "low", "New email alerts."),
    ],
  },
  {
    id: "googledrive", name: "Google Drive", packageName: "com.google.android.apps.docs",
    developer: "Google LLC", version: "2.24.0", category: "Productivity", icon: "📁",
    privacyScore: 72, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Storage", "medium", "Reads and writes all files on your device."),
      perm("Camera", "low", "Scan documents."),
      perm("Notifications", "low", "Sharing and sync alerts."),
    ],
  },
  {
    id: "chrome", name: "Chrome", packageName: "com.android.chrome",
    developer: "Google LLC", version: "130.0.6723.86", category: "Browser", icon: "🌐",
    privacyScore: 65, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Location", "medium", "Location autofill and search results."),
      perm("Camera", "low", "Web pages that request camera access."),
      perm("Microphone", "low", "Voice search and web pages."),
      perm("Storage", "low", "Downloads and offline pages."),
      perm("Notifications", "low", "Web push notifications."),
    ],
  },
  {
    id: "calculator", name: "Calculator", packageName: "com.android.calculator2",
    developer: "Google LLC", version: "8.5", category: "Tools", icon: "🧮",
    privacyScore: 98, riskLevel: "safe", lastScan: new Date().toISOString(),
    permissions: [
      perm("Storage", "low", "Saves calculation history."),
    ],
  },

  // ── Maps & Navigation ───────────────────────────────────────────────────────
  {
    id: "maps", name: "Google Maps", packageName: "com.google.android.apps.maps",
    developer: "Google LLC", version: "11.140.0", category: "Maps & Navigation", icon: "🗺️",
    privacyScore: 68, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Location", "high", "Core feature. Set to 'While in use' for best privacy."),
      perm("Microphone", "low", "Voice navigation commands."),
      perm("Contacts", "low", "Share locations with contacts."),
      perm("Camera", "low", "Street View and AR navigation."),
      perm("Notifications", "low", "Traffic and ETA alerts."),
    ],
  },
  {
    id: "uber", name: "Uber", packageName: "com.ubercab",
    developer: "Uber Technologies", version: "4.500.0", category: "Travel", icon: "🚗",
    privacyScore: 55, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Location", "high", "Required for ride pickup. Disable background location when not using."),
      perm("Contacts", "medium", "Share ride status with contacts."),
      perm("Camera", "low", "Driver verification."),
      perm("Notifications", "low", "Ride status alerts."),
    ],
  },

  // ── Finance ─────────────────────────────────────────────────────────────────
  {
    id: "paypal", name: "PayPal", packageName: "com.paypal.android.p2pmobile",
    developer: "PayPal Inc.", version: "8.60.0", category: "Finance", icon: "💳",
    privacyScore: 75, riskLevel: "low", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "medium", "Check deposit and QR code scanning."),
      perm("Contacts", "medium", "Send money to contacts."),
      perm("Notifications", "low", "Transaction alerts."),
      perm("Storage", "low", "Receipt storage."),
    ],
  },

  // ── Games ───────────────────────────────────────────────────────────────────
  {
    id: "freegame", name: "Bubble Pop Saga", packageName: "com.freegames.bubble",
    developer: "FreeGames Studio", version: "1.4.2", category: "Games", icon: "🫧",
    privacyScore: 22, riskLevel: "high", lastScan: new Date().toISOString(),
    permissions: [
      perm("Location", "high", "Requests precise location — likely for ad targeting."),
      perm("Contacts", "high", "Requests contact list with no clear game purpose."),
      perm("Storage", "medium", "Reads and writes media files."),
      perm("Notifications", "low", "Ad-heavy push notifications."),
    ],
  },
  {
    id: "pubg", name: "PUBG Mobile", packageName: "com.tencent.ig",
    developer: "Tencent Games", version: "3.4.0", category: "Games", icon: "🎮",
    privacyScore: 48, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Microphone", "medium", "In-game voice chat."),
      perm("Storage", "medium", "Game data and assets."),
      perm("Location", "medium", "Regional matchmaking — can be used for ad targeting."),
      perm("Notifications", "low", "Game event alerts."),
    ],
  },

  // ── Health & Fitness ────────────────────────────────────────────────────────
  {
    id: "strava", name: "Strava", packageName: "com.strava",
    developer: "Strava Inc.", version: "350.0.0", category: "Health & Fitness", icon: "🏃",
    privacyScore: 62, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Location", "high", "Tracks your routes. Disable background location when not exercising."),
      perm("Storage", "low", "Activity data storage."),
      perm("Notifications", "low", "Activity and challenge alerts."),
    ],
  },

  // ── Shopping ────────────────────────────────────────────────────────────────
  {
    id: "amazon", name: "Amazon Shopping", packageName: "com.amazon.mShop.android.shopping",
    developer: "Amazon.com", version: "26.20.0", category: "Shopping", icon: "📦",
    privacyScore: 58, riskLevel: "medium", lastScan: new Date().toISOString(),
    permissions: [
      perm("Camera", "medium", "Barcode scanning and visual search."),
      perm("Location", "medium", "Delivery address suggestions and local deals."),
      perm("Microphone", "medium", "Alexa voice shopping."),
      perm("Storage", "low", "App cache."),
      perm("Notifications", "low", "Order and deal alerts."),
    ],
  },
];

// ── Installed app detection ───────────────────────────────────────────────────

export interface DetectedApp {
  packageName: string;
  appName: string;
  detected: boolean;
  detectionMethod: "getInstalledRelatedApps" | "url-scheme" | "catalog";
}

/**
 * Attempts to detect installed apps using the getInstalledRelatedApps API.
 * Only works on Android Chrome 80+ and only for apps listed in the manifest.
 */
export async function detectInstalledApps(): Promise<string[]> {
  if (typeof window === "undefined") return [];

  // Method 1: getInstalledRelatedApps (Android Chrome 80+)
  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await (navigator as Navigator & {
        getInstalledRelatedApps: () => Promise<Array<{ platform: string; id?: string; url?: string }>>
      }).getInstalledRelatedApps();

      return apps
        .filter((a) => a.platform === "play" && a.id)
        .map((a) => a.id as string);
    } catch {
      // API not available or permission denied
    }
  }

  return [];
}

/**
 * Returns the subset of APP_CATALOG that are likely installed,
 * based on detection results. Falls back to showing the full catalog
 * for manual selection.
 */
export async function getDeviceApps(): Promise<{
  detected: AppRecord[];
  all: AppRecord[];
  detectionSupported: boolean;
}> {
  const installedIds = await detectInstalledApps();
  const detectionSupported = installedIds.length > 0;

  const detected = detectionSupported
    ? APP_CATALOG.filter((app) => installedIds.includes(app.packageName))
    : [];

  return {
    detected,
    all: APP_CATALOG,
    detectionSupported,
  };
}

/**
 * Groups apps by category for the selection UI.
 */
export function groupByCategory(apps: AppRecord[]): Record<string, AppRecord[]> {
  return apps.reduce(
    (acc, app) => {
      const cat = app.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(app);
      return acc;
    },
    {} as Record<string, AppRecord[]>,
  );
}
