import { b2 as writeBatch, a5 as doc, aQ as serverTimestamp, aR as setDoc, ao as getFirestore, z as addDoc, U as collection } from "../_libs/firebase__firestore.mjs";
import { d as firebaseAuth, m as showLocalNotification, s as scoreBand, f as firebaseApp } from "./router-x6rZinQA.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
const perm = (name, risk, explanation, granted = true) => ({ name, risk, explanation, granted });
const APP_CATALOG = [
  // ── Social & Communication ──────────────────────────────────────────────────
  {
    id: "whatsapp",
    name: "WhatsApp",
    packageName: "com.whatsapp",
    developer: "Meta Platforms",
    version: "2.24.18",
    category: "Communication",
    icon: "💬",
    privacyScore: 72,
    riskLevel: "low",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Contacts", "high", "Reads your full contact list. Contacts are uploaded to Meta servers."),
      perm("Microphone", "medium", "Used for voice messages and calls."),
      perm("Camera", "medium", "Used for photos and video calls."),
      perm("Storage", "low", "Saves media you send and receive."),
      perm("Notifications", "low", "Delivers new message alerts.")
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    packageName: "org.telegram.messenger",
    developer: "Telegram FZ-LLC",
    version: "10.3.2",
    category: "Communication",
    icon: "✈️",
    privacyScore: 85,
    riskLevel: "low",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Contacts", "medium", "Used to find friends on Telegram. Hashed before upload."),
      perm("Microphone", "medium", "Voice messages and calls."),
      perm("Camera", "medium", "Photo and video sharing."),
      perm("Storage", "low", "Media storage."),
      perm("Notifications", "low", "Message alerts.")
    ]
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
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Contacts", "low", "Contacts are hashed locally — never uploaded to servers."),
      perm("Microphone", "medium", "End-to-end encrypted voice calls."),
      perm("Camera", "medium", "Secure photo sharing."),
      perm("Storage", "low", "Local media storage."),
      perm("Notifications", "low", "Encrypted message alerts.")
    ]
  },
  {
    id: "messenger",
    name: "Messenger",
    packageName: "com.facebook.orca",
    developer: "Meta Platforms",
    version: "450.0.0",
    category: "Communication",
    icon: "💙",
    privacyScore: 38,
    riskLevel: "high",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Contacts", "high", "Full contact list uploaded to Meta servers for ad targeting."),
      perm("Microphone", "high", "Can activate in background. Used for calls and audio messages."),
      perm("Camera", "high", "Heavy camera access for stories and video calls."),
      perm("Location", "high", "Used for location sharing and ad targeting."),
      perm("Storage", "medium", "Reads and writes media files."),
      perm("Notifications", "low", "Message alerts.")
    ]
  },
  {
    id: "viber",
    name: "Viber",
    packageName: "com.viber.voip",
    developer: "Viber Media",
    version: "22.5.0",
    category: "Communication",
    icon: "📞",
    privacyScore: 65,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Contacts", "high", "Uploads contact list to Viber servers."),
      perm("Microphone", "medium", "Voice calls and messages."),
      perm("Camera", "medium", "Video calls and photo sharing."),
      perm("Storage", "low", "Media storage."),
      perm("Notifications", "low", "Call and message alerts.")
    ]
  },
  // ── Social Media ────────────────────────────────────────────────────────────
  {
    id: "tiktok",
    name: "TikTok",
    packageName: "com.zhiliaoapp.musically",
    developer: "TikTok Pte. Ltd.",
    version: "33.2.4",
    category: "Social",
    icon: "🎵",
    privacyScore: 28,
    riskLevel: "high",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "high", "Heavy camera access — content uploaded to TikTok servers."),
      perm("Microphone", "high", "Frequently recording — can collect ambient audio."),
      perm("Location", "high", "Used for content targeting and ad profiling."),
      perm("Contacts", "medium", "Suggests friends. Uploads address book."),
      perm("Storage", "low", "Caches videos locally."),
      perm("Notifications", "low", "Engagement notifications.")
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    packageName: "com.instagram.android",
    developer: "Meta Platforms",
    version: "350.0.0",
    category: "Social",
    icon: "📷",
    privacyScore: 42,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "high", "Stories and posts — uploaded to Meta servers."),
      perm("Microphone", "high", "Reels and stories recording."),
      perm("Location", "high", "Location tagging and ad targeting."),
      perm("Contacts", "medium", "Friend suggestions. Uploads address book."),
      perm("Storage", "low", "Photo and video cache."),
      perm("Notifications", "low", "Activity alerts.")
    ]
  },
  {
    id: "facebook",
    name: "Facebook",
    packageName: "com.facebook.katana",
    developer: "Meta Platforms",
    version: "450.0.0",
    category: "Social",
    icon: "👤",
    privacyScore: 32,
    riskLevel: "high",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "high", "Photo and video uploads to Facebook."),
      perm("Microphone", "high", "Live video and audio recording."),
      perm("Location", "high", "Location history for ad targeting."),
      perm("Contacts", "high", "Full contact list uploaded for friend suggestions."),
      perm("Storage", "medium", "Media files access."),
      perm("Notifications", "low", "Activity and ad notifications.")
    ]
  },
  {
    id: "x",
    name: "X (Twitter)",
    packageName: "com.twitter.android",
    developer: "X Corp.",
    version: "10.62.0",
    category: "Social",
    icon: "🐦",
    privacyScore: 52,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "medium", "Photo and video tweets."),
      perm("Microphone", "medium", "Audio tweets and Spaces."),
      perm("Location", "medium", "Location tagging on tweets."),
      perm("Contacts", "medium", "Friend suggestions."),
      perm("Storage", "low", "Media cache."),
      perm("Notifications", "low", "Tweet and mention alerts.")
    ]
  },
  {
    id: "snapchat",
    name: "Snapchat",
    packageName: "com.snapchat.android",
    developer: "Snap Inc.",
    version: "12.85.0",
    category: "Social",
    icon: "👻",
    privacyScore: 45,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "high", "Core feature — snaps and stories."),
      perm("Microphone", "high", "Video snaps and voice messages."),
      perm("Location", "high", "Snap Map shows your real-time location to friends."),
      perm("Contacts", "medium", "Friend discovery."),
      perm("Storage", "low", "Snap storage."),
      perm("Notifications", "low", "Snap alerts.")
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    packageName: "com.linkedin.android",
    developer: "LinkedIn Corp.",
    version: "9.1.0",
    category: "Social",
    icon: "💼",
    privacyScore: 58,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "medium", "Profile photos and posts."),
      perm("Microphone", "medium", "Audio messages."),
      perm("Contacts", "high", "Imports contacts to suggest connections."),
      perm("Storage", "low", "Media cache."),
      perm("Notifications", "low", "Job and connection alerts.")
    ]
  },
  // ── Entertainment & Streaming ───────────────────────────────────────────────
  {
    id: "youtube",
    name: "YouTube",
    packageName: "com.google.android.youtube",
    developer: "Google LLC",
    version: "19.45.0",
    category: "Entertainment",
    icon: "▶️",
    privacyScore: 62,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "low", "Used for YouTube Shorts recording."),
      perm("Microphone", "medium", "Voice search and Shorts."),
      perm("Location", "medium", "Content recommendations and ads."),
      perm("Storage", "low", "Offline video downloads."),
      perm("Notifications", "low", "Subscription alerts.")
    ]
  },
  {
    id: "netflix",
    name: "Netflix",
    packageName: "com.netflix.mediaclient",
    developer: "Netflix Inc.",
    version: "8.100.0",
    category: "Entertainment",
    icon: "🎬",
    privacyScore: 78,
    riskLevel: "low",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Storage", "low", "Downloads for offline viewing."),
      perm("Notifications", "low", "New content alerts.")
    ]
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
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Microphone", "medium", "Voice search feature."),
      perm("Storage", "low", "Offline track downloads."),
      perm("Bluetooth", "low", "Speaker and headphone connection."),
      perm("Notifications", "low", "Now playing alerts.")
    ]
  },
  // ── Productivity & Tools ────────────────────────────────────────────────────
  {
    id: "gmail",
    name: "Gmail",
    packageName: "com.google.android.gm",
    developer: "Google LLC",
    version: "2024.10.0",
    category: "Productivity",
    icon: "📧",
    privacyScore: 70,
    riskLevel: "low",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Contacts", "medium", "Auto-complete email addresses."),
      perm("Camera", "low", "Attach photos to emails."),
      perm("Storage", "low", "Email attachments."),
      perm("Notifications", "low", "New email alerts.")
    ]
  },
  {
    id: "googledrive",
    name: "Google Drive",
    packageName: "com.google.android.apps.docs",
    developer: "Google LLC",
    version: "2.24.0",
    category: "Productivity",
    icon: "📁",
    privacyScore: 72,
    riskLevel: "low",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Storage", "medium", "Reads and writes all files on your device."),
      perm("Camera", "low", "Scan documents."),
      perm("Notifications", "low", "Sharing and sync alerts.")
    ]
  },
  {
    id: "chrome",
    name: "Chrome",
    packageName: "com.android.chrome",
    developer: "Google LLC",
    version: "130.0.6723.86",
    category: "Browser",
    icon: "🌐",
    privacyScore: 65,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Location", "medium", "Location autofill and search results."),
      perm("Camera", "low", "Web pages that request camera access."),
      perm("Microphone", "low", "Voice search and web pages."),
      perm("Storage", "low", "Downloads and offline pages."),
      perm("Notifications", "low", "Web push notifications.")
    ]
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
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Storage", "low", "Saves calculation history.")
    ]
  },
  // ── Maps & Navigation ───────────────────────────────────────────────────────
  {
    id: "maps",
    name: "Google Maps",
    packageName: "com.google.android.apps.maps",
    developer: "Google LLC",
    version: "11.140.0",
    category: "Maps & Navigation",
    icon: "🗺️",
    privacyScore: 68,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Location", "high", "Core feature. Set to 'While in use' for best privacy."),
      perm("Microphone", "low", "Voice navigation commands."),
      perm("Contacts", "low", "Share locations with contacts."),
      perm("Camera", "low", "Street View and AR navigation."),
      perm("Notifications", "low", "Traffic and ETA alerts.")
    ]
  },
  {
    id: "uber",
    name: "Uber",
    packageName: "com.ubercab",
    developer: "Uber Technologies",
    version: "4.500.0",
    category: "Travel",
    icon: "🚗",
    privacyScore: 55,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Location", "high", "Required for ride pickup. Disable background location when not using."),
      perm("Contacts", "medium", "Share ride status with contacts."),
      perm("Camera", "low", "Driver verification."),
      perm("Notifications", "low", "Ride status alerts.")
    ]
  },
  // ── Finance ─────────────────────────────────────────────────────────────────
  {
    id: "paypal",
    name: "PayPal",
    packageName: "com.paypal.android.p2pmobile",
    developer: "PayPal Inc.",
    version: "8.60.0",
    category: "Finance",
    icon: "💳",
    privacyScore: 75,
    riskLevel: "low",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "medium", "Check deposit and QR code scanning."),
      perm("Contacts", "medium", "Send money to contacts."),
      perm("Notifications", "low", "Transaction alerts."),
      perm("Storage", "low", "Receipt storage.")
    ]
  },
  // ── Games ───────────────────────────────────────────────────────────────────
  {
    id: "freegame",
    name: "Bubble Pop Saga",
    packageName: "com.freegames.bubble",
    developer: "FreeGames Studio",
    version: "1.4.2",
    category: "Games",
    icon: "🫧",
    privacyScore: 22,
    riskLevel: "high",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Location", "high", "Requests precise location — likely for ad targeting."),
      perm("Contacts", "high", "Requests contact list with no clear game purpose."),
      perm("Storage", "medium", "Reads and writes media files."),
      perm("Notifications", "low", "Ad-heavy push notifications.")
    ]
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    packageName: "com.tencent.ig",
    developer: "Tencent Games",
    version: "3.4.0",
    category: "Games",
    icon: "🎮",
    privacyScore: 48,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Microphone", "medium", "In-game voice chat."),
      perm("Storage", "medium", "Game data and assets."),
      perm("Location", "medium", "Regional matchmaking — can be used for ad targeting."),
      perm("Notifications", "low", "Game event alerts.")
    ]
  },
  // ── Health & Fitness ────────────────────────────────────────────────────────
  {
    id: "strava",
    name: "Strava",
    packageName: "com.strava",
    developer: "Strava Inc.",
    version: "350.0.0",
    category: "Health & Fitness",
    icon: "🏃",
    privacyScore: 62,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Location", "high", "Tracks your routes. Disable background location when not exercising."),
      perm("Storage", "low", "Activity data storage."),
      perm("Notifications", "low", "Activity and challenge alerts.")
    ]
  },
  // ── Shopping ────────────────────────────────────────────────────────────────
  {
    id: "amazon",
    name: "Amazon Shopping",
    packageName: "com.amazon.mShop.android.shopping",
    developer: "Amazon.com",
    version: "26.20.0",
    category: "Shopping",
    icon: "📦",
    privacyScore: 58,
    riskLevel: "medium",
    lastScan: (/* @__PURE__ */ new Date()).toISOString(),
    permissions: [
      perm("Camera", "medium", "Barcode scanning and visual search."),
      perm("Location", "medium", "Delivery address suggestions and local deals."),
      perm("Microphone", "medium", "Alexa voice shopping."),
      perm("Storage", "low", "App cache."),
      perm("Notifications", "low", "Order and deal alerts.")
    ]
  }
];
async function detectInstalledApps() {
  if (typeof window === "undefined") return [];
  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await navigator.getInstalledRelatedApps();
      return apps.filter((a) => a.platform === "play" && a.id).map((a) => a.id);
    } catch {
    }
  }
  return [];
}
function groupByCategory(apps) {
  return apps.reduce(
    (acc, app) => {
      const cat = app.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(app);
      return acc;
    },
    {}
  );
}
const db = getFirestore(firebaseApp);
function computeScore(app) {
  let score = 100;
  const granted = app.permissions.filter((p) => p.granted);
  const dangerous = granted.filter((p) => p.risk !== "low");
  const countPenalty = [0, 5, 12, 20, 28, 35][Math.min(dangerous.length, 5)];
  score -= countPenalty;
  const weightSum = granted.reduce((s, p) => {
    return s + (p.risk === "high" ? 5 : p.risk === "medium" ? 3 : 1);
  }, 0);
  score -= Math.min(40, weightSum * 2);
  return Math.max(0, Math.min(100, score));
}
async function scanApp(app) {
  const uid = firebaseAuth.currentUser?.uid;
  const score = computeScore(app);
  const riskLevel = scoreBand(score);
  const scanned = {
    ...app,
    privacyScore: score,
    riskLevel,
    lastScan: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (uid) {
    const docId = app.packageName.replace(/\./g, "_");
    await setDoc(doc(db, "users", uid, "apps", docId), {
      ...scanned,
      syncedAt: serverTimestamp(),
      syncSource: "web"
    });
    if (riskLevel === "high") {
      await createNotification(uid, {
        type: "high-risk",
        title: "High Risk App Detected",
        message: `${app.name} has a privacy score of ${score}/100. Review its permissions.`,
        packageName: app.packageName
      });
      await showLocalNotification({
        title: "⚠️ High Risk App Detected",
        body: `${app.name} scored ${score}/100. Tap to review permissions.`,
        type: "high-risk",
        url: `/apps/${app.id}`
      });
    }
  }
  return scanned;
}
async function scanAllApps(apps, onProgress) {
  const uid = firebaseAuth.currentUser?.uid;
  const results = [];
  const batch = writeBatch(db);
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const score = computeScore(app);
    const riskLevel = scoreBand(score);
    const scanned = {
      ...app,
      privacyScore: score,
      riskLevel,
      lastScan: (/* @__PURE__ */ new Date()).toISOString()
    };
    results.push(scanned);
    if (uid) {
      const docId = app.packageName.replace(/\./g, "_");
      batch.set(doc(db, "users", uid, "apps", docId), {
        ...scanned,
        syncedAt: serverTimestamp(),
        syncSource: "web"
      });
    }
    onProgress?.(i + 1, apps.length);
  }
  if (uid) {
    await batch.commit();
    const highRisk = results.filter((a) => a.riskLevel === "high");
    if (highRisk.length > 0) {
      await createNotification(uid, {
        type: "high-risk",
        title: `${highRisk.length} High Risk App${highRisk.length > 1 ? "s" : ""} Found`,
        message: `${highRisk.map((a) => a.name).join(", ")} ${highRisk.length > 1 ? "require" : "requires"} your attention.`
      });
      await showLocalNotification({
        title: `⚠️ ${highRisk.length} High Risk App${highRisk.length > 1 ? "s" : ""} Found`,
        body: `${highRisk.map((a) => a.name).slice(0, 3).join(", ")} require your attention.`,
        type: "high-risk",
        url: "/apps"
      });
    }
    const avgScore = Math.round(results.reduce((s, a) => s + a.privacyScore, 0) / results.length);
    await createNotification(uid, {
      type: "score-change",
      title: "Scan Complete",
      message: `Scanned ${results.length} apps. Overall privacy score: ${avgScore}/100.`
    });
  }
  return results;
}
async function createNotification(uid, data) {
  try {
    await addDoc(collection(db, "users", uid, "notifications"), {
      ...data,
      time: (/* @__PURE__ */ new Date()).toISOString(),
      read: false,
      createdAt: serverTimestamp()
    });
  } catch {
  }
}
function ScoreRing({ score, size = 140, stroke = 10, label }) {
  const band = scoreBand(score);
  const color = band === "safe" ? "var(--color-success)" : band === "low" ? "var(--color-primary)" : band === "medium" ? "var(--color-warning)" : "var(--color-destructive)";
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - Math.max(0, Math.min(100, score)) / 100 * c;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-flex items-center justify-center", style: { width: size, height: size }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r,
          stroke: "var(--color-muted)",
          strokeWidth: stroke,
          fill: "none",
          opacity: 0.4
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r,
          stroke: color,
          strokeWidth: stroke,
          strokeLinecap: "round",
          fill: "none",
          strokeDasharray: c,
          strokeDashoffset: offset,
          style: { transition: "stroke-dashoffset 800ms ease", filter: `drop-shadow(0 0 8px ${color})` }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold tabular-nums", children: score }),
      label && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5", children: label })
    ] }) })
  ] });
}
export {
  APP_CATALOG as A,
  ScoreRing as S,
  scanApp as a,
  detectInstalledApps as d,
  groupByCategory as g,
  scanAllApps as s
};
