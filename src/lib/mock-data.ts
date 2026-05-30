export type RiskLevel = "safe" | "low" | "medium" | "high";

export interface PermissionInfo {
  name: string;
  risk: "low" | "medium" | "high";
  explanation: string;
  granted: boolean;
}

export interface AppRecord {
  id: string;
  name: string;
  packageName: string;
  developer: string;
  version: string;
  category: string;
  icon: string; // emoji placeholder
  privacyScore: number; // 0-100
  riskLevel: RiskLevel;
  lastScan: string; // ISO
  permissions: PermissionInfo[];
}

export interface WeeklyReport {
  reportDate: string;
  locationUsage: number[];
  cameraUsage: number[];
  microphoneUsage: number[];
  contactsUsage: number[];
  storageUsage: number[];
  days: string[];
}

export interface NotificationItem {
  id: string;
  type: "new-app" | "high-risk" | "score-change" | "report";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const perm = (
  name: string,
  risk: "low" | "medium" | "high",
  explanation: string,
  granted = true,
): PermissionInfo => ({ name, risk, explanation, granted });

const standardPerms = (kind: "messaging" | "social" | "utility" | "game"): PermissionInfo[] => {
  if (kind === "messaging")
    return [
      perm("Contacts", "high", "Reads your full contact list. Common for messaging apps but contacts are shared with the app's servers."),
      perm("Microphone", "medium", "Used to record voice messages and calls. Should only activate when you tap record."),
      perm("Camera", "medium", "Used for photos and video calls. Verify it doesn't run in the background."),
      perm("Storage", "low", "Saves media you send and receive."),
      perm("Notifications", "low", "Delivers new message alerts."),
    ];
  if (kind === "social")
    return [
      perm("Camera", "high", "Heavy camera access for stories and uploads — typically uploaded to remote servers."),
      perm("Microphone", "high", "Frequently recording — can collect ambient audio if backgrounded."),
      perm("Location", "high", "Used for tagging and ad targeting. Set to 'While in use' or disable."),
      perm("Contacts", "medium", "Suggests friends to follow. Uploads your address book."),
      perm("Storage", "low", "Caches photos and videos locally."),
      perm("Notifications", "low", "Push notifications for activity."),
    ];
  if (kind === "utility")
    return [
      perm("Storage", "low", "Reads and writes files for the app's core function."),
      perm("Notifications", "low", "Sends informational alerts."),
    ];
  return [
    perm("Storage", "low", "Saves game data and downloaded assets."),
    perm("Notifications", "low", "Sends engagement notifications."),
    perm("Location", "medium", "Some games use location for ads. Disable if not a location-based game.", false),
  ];
};

export const mockApps: AppRecord[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    packageName: "com.whatsapp",
    developer: "Meta Platforms",
    version: "2.24.18.79",
    category: "Communication",
    icon: "💬",
    privacyScore: 82,
    riskLevel: "low",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    permissions: standardPerms("messaging"),
  },
  {
    id: "tiktok",
    name: "TikTok",
    packageName: "com.zhiliaoapp.musically",
    developer: "TikTok Pte. Ltd.",
    version: "33.2.4",
    category: "Social",
    icon: "🎵",
    privacyScore: 32,
    riskLevel: "high",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    permissions: standardPerms("social"),
  },
  {
    id: "instagram",
    name: "Instagram",
    packageName: "com.instagram.android",
    developer: "Meta Platforms",
    version: "350.0.0",
    category: "Social",
    icon: "📷",
    privacyScore: 48,
    riskLevel: "medium",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    permissions: standardPerms("social"),
  },
  {
    id: "signal",
    name: "Signal",
    packageName: "org.thoughtcrime.securesms",
    developer: "Signal Foundation",
    version: "7.20.4",
    category: "Communication",
    icon: "🔒",
    privacyScore: 96,
    riskLevel: "safe",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    permissions: standardPerms("messaging").map((p) =>
      p.name === "Contacts" ? { ...p, risk: "low", explanation: "Contacts are hashed locally — never uploaded." } : p,
    ),
  },
  {
    id: "spotify",
    name: "Spotify",
    packageName: "com.spotify.music",
    developer: "Spotify AB",
    version: "8.9.74",
    category: "Music & Audio",
    icon: "🎧",
    privacyScore: 74,
    riskLevel: "low",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    permissions: [
      perm("Microphone", "medium", "Used for voice search. Should not activate in background."),
      perm("Storage", "low", "Downloads offline tracks."),
      perm("Bluetooth", "low", "Connects to speakers and headphones."),
      perm("Notifications", "low", "Now playing alerts."),
    ],
  },
  {
    id: "chrome",
    name: "Chrome",
    packageName: "com.android.chrome",
    developer: "Google LLC",
    version: "130.0.6723.86",
    category: "Browser",
    icon: "🌐",
    privacyScore: 68,
    riskLevel: "medium",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    permissions: [
      perm("Location", "medium", "Used to autofill location and improve search results."),
      perm("Camera", "low", "Used by web pages that request camera (e.g. QR scans)."),
      perm("Microphone", "low", "Used by web pages that request microphone."),
      perm("Storage", "low", "Stores downloads and offline pages."),
      perm("Notifications", "low", "Web push notifications."),
    ],
  },
  {
    id: "calculator",
    name: "Calculator",
    packageName: "com.android.calculator2",
    developer: "Google LLC",
    version: "8.5",
    category: "Tools",
    icon: "🧮",
    privacyScore: 98,
    riskLevel: "safe",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    permissions: standardPerms("utility"),
  },
  {
    id: "freegame",
    name: "Bubble Pop Saga",
    packageName: "com.freegames.bubble",
    developer: "FreeGames Studio",
    version: "1.4.2",
    category: "Games",
    icon: "🫧",
    privacyScore: 28,
    riskLevel: "high",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    permissions: [
      perm("Location", "high", "Game requests precise location — likely for ad targeting. Recommended to revoke."),
      perm("Contacts", "high", "Requests contact list with no clear game purpose."),
      perm("Storage", "medium", "Reads and writes media files."),
      perm("Notifications", "low", "Ad-heavy push notifications."),
    ],
  },
  {
    id: "maps",
    name: "Google Maps",
    packageName: "com.google.android.apps.maps",
    developer: "Google LLC",
    version: "11.140.0",
    category: "Travel",
    icon: "🗺️",
    privacyScore: 71,
    riskLevel: "low",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    permissions: [
      perm("Location", "medium", "Core to map and navigation features. Set to 'While in use' for best privacy."),
      perm("Microphone", "low", "Voice navigation commands."),
      perm("Contacts", "low", "Used to share locations with contacts."),
      perm("Notifications", "low", "Traffic and ETA alerts."),
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    packageName: "com.twitter.android",
    developer: "X Corp.",
    version: "10.62.0",
    category: "News & Social",
    icon: "🐦",
    privacyScore: 52,
    riskLevel: "medium",
    lastScan: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    permissions: standardPerms("social"),
  },
];

export const mockWeeklyReport: WeeklyReport = {
  reportDate: new Date().toISOString(),
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  locationUsage: [12, 18, 14, 22, 25, 19, 16],
  cameraUsage: [3, 5, 4, 8, 11, 7, 4],
  microphoneUsage: [2, 4, 3, 6, 9, 5, 3],
  contactsUsage: [1, 2, 1, 3, 4, 2, 1],
  storageUsage: [30, 32, 28, 35, 40, 38, 33],
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "high-risk",
    title: "High-risk permission detected",
    message: "Bubble Pop Saga was granted access to your precise location.",
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "n2",
    type: "new-app",
    title: "New application detected",
    message: "TikTok was installed on your device. Initial scan complete.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    read: false,
  },
  {
    id: "n3",
    type: "score-change",
    title: "Privacy score improved",
    message: "Your overall privacy score increased from 68 to 72.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "n4",
    type: "report",
    title: "Weekly privacy report ready",
    message: "Your weekly summary is available in the Dashboard.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    read: true,
  },
];

export function riskColor(risk: RiskLevel | "low" | "medium" | "high") {
  switch (risk) {
    case "safe":
      return "success";
    case "low":
      return "primary";
    case "medium":
      return "warning";
    case "high":
      return "destructive";
  }
}

export function scoreBand(score: number): RiskLevel {
  if (score >= 90) return "safe";
  if (score >= 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}
