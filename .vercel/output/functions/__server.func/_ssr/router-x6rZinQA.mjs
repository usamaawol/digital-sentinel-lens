import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, e as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as EmailAuthProvider, a2 as reauthenticateWithCredential, ao as updatePassword, a9 as sendPasswordResetEmail, ak as signOut, af as signInWithEmailAndPassword, x as createUserWithEmailAndPassword, aq as updateProfile, D as getAuth, _ as onAuthStateChanged } from "../_libs/firebase__auth.mjs";
import { d as getApps, i as initializeApp } from "../_libs/firebase__app.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/firebase.mjs";
import { U as collection, aL as query, aH as orderBy, at as limit, al as getDocs, aR as setDoc, a5 as doc, aQ as serverTimestamp, ai as getDoc, ao as getFirestore } from "../_libs/firebase__firestore.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { Y as Smartphone, a8 as X, o as Download, V as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/idb.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "../_libs/@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "../_libs/@grpc/proto-loader.mjs";
import "path";
import "../_libs/lodash.camelcase.mjs";
import "../_libs/protobufjs.mjs";
import "../_libs/protobufjs__aspromise.mjs";
import "../_libs/protobufjs__base64.mjs";
import "../_libs/protobufjs__eventemitter.mjs";
import "../_libs/protobufjs__float.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
const appCss = "/assets/styles-D852g1kO.css";
const firebaseConfig = {
  apiKey: "AIzaSyB-0K0WAtl6bMnZsd7Hqan9kkaBXH2WqUA",
  authDomain: "privacy-app-aba91.firebaseapp.com",
  projectId: "privacy-app-aba91",
  storageBucket: "privacy-app-aba91.firebasestorage.app",
  messagingSenderId: "235144244942",
  appId: "1:235144244942:web:7b3b40ca8f14aa910f6a9f",
  measurementId: "G-3W59KGMTNE"
};
const FIREBASE_READY = true;
const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const config = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FIREBASE_READY,
  firebaseApp,
  firebaseAuth,
  firebaseConfig
}, Symbol.toStringTag, { value: "Module" }));
function toAuthUser(u) {
  return {
    uid: u.uid,
    email: u.email ?? "",
    displayName: u.displayName ?? (u.email ? u.email.split("@")[0] : "User"),
    createdAt: u.metadata.creationTime ?? (/* @__PURE__ */ new Date()).toISOString(),
    lastLogin: u.metadata.lastSignInTime ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
function friendlyError(e) {
  const code = e?.code ?? "";
  const map = {
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/invalid-email": "That email address is invalid.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your connection."
  };
  return new Error(map[code] ?? e?.message ?? "Authentication error.");
}
let currentUser = null;
const listeners = /* @__PURE__ */ new Set();
if (typeof window !== "undefined") {
  onAuthStateChanged(firebaseAuth, (u) => {
    currentUser = u ? toAuthUser(u) : null;
    listeners.forEach((l) => l());
  });
}
const authService = {
  getCurrentUser() {
    const u = firebaseAuth.currentUser;
    return u ? toAuthUser(u) : currentUser;
  },
  async signUp(email, password, displayName) {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      return toAuthUser(cred.user);
    } catch (e) {
      throw friendlyError(e);
    }
  },
  async signIn(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return toAuthUser(cred.user);
    } catch (e) {
      throw friendlyError(e);
    }
  },
  async signOut() {
    await signOut(firebaseAuth);
  },
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (e) {
      const code = e?.code;
      if (code === "auth/user-not-found") return;
      throw friendlyError(e);
    }
  },
  async updatePassword(currentPassword, newPassword) {
    const user = firebaseAuth.currentUser;
    if (!user || !user.email) throw new Error("Not signed in.");
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
    } catch (e) {
      throw friendlyError(e);
    }
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
const perm = (name, risk, explanation, granted = true) => ({ name, risk, explanation, granted });
const standardPerms = (kind) => {
  if (kind === "messaging")
    return [
      perm("Contacts", "high", "Reads your full contact list. Common for messaging apps but contacts are shared with the app's servers."),
      perm("Microphone", "medium", "Used to record voice messages and calls. Should only activate when you tap record."),
      perm("Camera", "medium", "Used for photos and video calls. Verify it doesn't run in the background."),
      perm("Storage", "low", "Saves media you send and receive."),
      perm("Notifications", "low", "Delivers new message alerts.")
    ];
  if (kind === "social")
    return [
      perm("Camera", "high", "Heavy camera access for stories and uploads — typically uploaded to remote servers."),
      perm("Microphone", "high", "Frequently recording — can collect ambient audio if backgrounded."),
      perm("Location", "high", "Used for tagging and ad targeting. Set to 'While in use' or disable."),
      perm("Contacts", "medium", "Suggests friends to follow. Uploads your address book."),
      perm("Storage", "low", "Caches photos and videos locally."),
      perm("Notifications", "low", "Push notifications for activity.")
    ];
  if (kind === "utility")
    return [
      perm("Storage", "low", "Reads and writes files for the app's core function."),
      perm("Notifications", "low", "Sends informational alerts.")
    ];
  return [
    perm("Storage", "low", "Saves game data and downloaded assets."),
    perm("Notifications", "low", "Sends engagement notifications."),
    perm("Location", "medium", "Some games use location for ads. Disable if not a location-based game.", false)
  ];
};
const mockApps = [
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 4).toISOString(),
    permissions: standardPerms("messaging")
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 2).toISOString(),
    permissions: standardPerms("social")
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 12).toISOString(),
    permissions: standardPerms("social")
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 6).toISOString(),
    permissions: standardPerms("messaging").map(
      (p) => p.name === "Contacts" ? { ...p, risk: "low", explanation: "Contacts are hashed locally — never uploaded." } : p
    )
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString(),
    permissions: [
      perm("Microphone", "medium", "Used for voice search. Should not activate in background."),
      perm("Storage", "low", "Downloads offline tracks."),
      perm("Bluetooth", "low", "Connects to speakers and headphones."),
      perm("Notifications", "low", "Now playing alerts.")
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
    privacyScore: 68,
    riskLevel: "medium",
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 3).toISOString(),
    permissions: [
      perm("Location", "medium", "Used to autofill location and improve search results."),
      perm("Camera", "low", "Used by web pages that request camera (e.g. QR scans)."),
      perm("Microphone", "low", "Used by web pages that request microphone."),
      perm("Storage", "low", "Stores downloads and offline pages."),
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 48).toISOString(),
    permissions: standardPerms("utility")
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 1).toISOString(),
    permissions: [
      perm("Location", "high", "Game requests precise location — likely for ad targeting. Recommended to revoke."),
      perm("Contacts", "high", "Requests contact list with no clear game purpose."),
      perm("Storage", "medium", "Reads and writes media files."),
      perm("Notifications", "low", "Ad-heavy push notifications.")
    ]
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 8).toISOString(),
    permissions: [
      perm("Location", "medium", "Core to map and navigation features. Set to 'While in use' for best privacy."),
      perm("Microphone", "low", "Voice navigation commands."),
      perm("Contacts", "low", "Used to share locations with contacts."),
      perm("Notifications", "low", "Traffic and ETA alerts.")
    ]
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
    lastScan: new Date(Date.now() - 1e3 * 60 * 60 * 18).toISOString(),
    permissions: standardPerms("social")
  }
];
const mockWeeklyReport = {
  reportDate: (/* @__PURE__ */ new Date()).toISOString(),
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  locationUsage: [12, 18, 14, 22, 25, 19, 16],
  cameraUsage: [3, 5, 4, 8, 11, 7, 4],
  microphoneUsage: [2, 4, 3, 6, 9, 5, 3],
  contactsUsage: [1, 2, 1, 3, 4, 2, 1],
  storageUsage: [30, 32, 28, 35, 40, 38, 33]
};
const mockNotifications = [
  {
    id: "n1",
    type: "high-risk",
    title: "High-risk permission detected",
    message: "Bubble Pop Saga was granted access to your precise location.",
    time: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
    read: false
  },
  {
    id: "n2",
    type: "new-app",
    title: "New application detected",
    message: "TikTok was installed on your device. Initial scan complete.",
    time: new Date(Date.now() - 1e3 * 60 * 60 * 4).toISOString(),
    read: false
  },
  {
    id: "n3",
    type: "score-change",
    title: "Privacy score improved",
    message: "Your overall privacy score increased from 68 to 72.",
    time: new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString(),
    read: true
  },
  {
    id: "n4",
    type: "report",
    title: "Weekly privacy report ready",
    message: "Your weekly summary is available in the Dashboard.",
    time: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 2).toISOString(),
    read: true
  }
];
function scoreBand(score) {
  if (score >= 90) return "safe";
  if (score >= 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}
const db = getFirestore(firebaseApp);
function getCurrentUserId() {
  return firebaseAuth.currentUser?.uid ?? null;
}
function mapFirestoreApp(id, data) {
  return {
    id: String(data.id ?? id),
    name: String(data.name ?? "Unknown App"),
    packageName: String(data.packageName ?? ""),
    developer: String(data.developer ?? "Unknown"),
    version: String(data.version ?? "1.0"),
    category: String(data.category ?? "Unknown"),
    icon: String(data.icon ?? "📦"),
    privacyScore: Number(data.privacyScore ?? 50),
    riskLevel: ["safe", "low", "medium", "high"].includes(String(data.riskLevel)) ? data.riskLevel : "medium",
    lastScan: String(data.lastScan ?? (/* @__PURE__ */ new Date()).toISOString()),
    permissions: Array.isArray(data.permissions) ? data.permissions.map((p) => ({
      name: String(p.name ?? ""),
      risk: ["low", "medium", "high"].includes(String(p.risk)) ? p.risk : "medium",
      explanation: String(p.explanation ?? ""),
      granted: Boolean(p.granted ?? true)
    })) : []
  };
}
const firestoreService = {
  // ── User Profile ─────────────────────────────────────────────────────────────
  /**
   * Creates or updates the user profile in Firestore.
   * Called on sign-in and sign-up.
   * Spec: users collection with uid, email, displayName, createdAt, lastLogin
   */
  async upsertUserProfile() {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      const existing = await getDoc(ref);
      await setDoc(
        ref,
        {
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: serverTimestamp(),
          ...existing.exists() ? {} : { createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        },
        { merge: true }
      );
    } catch {
    }
  },
  /**
   * Updates the display name in Firestore.
   */
  async updateDisplayName(displayName) {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      await setDoc(doc(db, "users", uid), { displayName, updatedAt: serverTimestamp() }, { merge: true });
    } catch {
    }
  },
  // ── Apps ─────────────────────────────────────────────────────────────────────
  async listApps() {
    const uid = getCurrentUserId();
    if (!uid) return mockApps;
    try {
      const appsRef = collection(db, "users", uid, "apps");
      const snapshot = await getDocs(appsRef);
      if (snapshot.empty) return mockApps;
      return snapshot.docs.map((d) => mapFirestoreApp(d.id, d.data()));
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockApps;
    }
  },
  async getApp(id) {
    const uid = getCurrentUserId();
    if (!uid) return mockApps.find((a) => a.id === id) ?? null;
    try {
      const docRef = doc(db, "users", uid, "apps", id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return mockApps.find((a) => a.id === id) ?? null;
      return mapFirestoreApp(snapshot.id, snapshot.data());
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockApps.find((a) => a.id === id) ?? null;
    }
  },
  // ── Reports ───────────────────────────────────────────────────────────────────
  async getWeeklyReport() {
    const uid = getCurrentUserId();
    if (!uid) return mockWeeklyReport;
    try {
      const reportsRef = collection(db, "users", uid, "reports");
      const q = query(reportsRef, orderBy("generatedAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return mockWeeklyReport;
      const data = snapshot.docs[0].data();
      return {
        reportDate: String(data.reportDate ?? (/* @__PURE__ */ new Date()).toISOString()),
        days: Array.isArray(data.days) ? data.days.map(String) : mockWeeklyReport.days,
        locationUsage: Array.isArray(data.locationUsage) ? data.locationUsage.map(Number) : mockWeeklyReport.locationUsage,
        cameraUsage: Array.isArray(data.cameraUsage) ? data.cameraUsage.map(Number) : mockWeeklyReport.cameraUsage,
        microphoneUsage: Array.isArray(data.microphoneUsage) ? data.microphoneUsage.map(Number) : mockWeeklyReport.microphoneUsage,
        contactsUsage: Array.isArray(data.contactsUsage) ? data.contactsUsage.map(Number) : mockWeeklyReport.contactsUsage,
        storageUsage: Array.isArray(data.storageUsage) ? data.storageUsage.map(Number) : mockWeeklyReport.storageUsage
      };
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockWeeklyReport;
    }
  },
  // ── Notifications ─────────────────────────────────────────────────────────────
  async listNotifications() {
    const uid = getCurrentUserId();
    if (!uid) return mockNotifications;
    try {
      const notifsRef = collection(db, "users", uid, "notifications");
      const q = query(notifsRef, orderBy("time", "desc"), limit(50));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return mockNotifications;
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id ?? d.id),
          type: ["new-app", "high-risk", "score-change", "report"].includes(String(data.type)) ? data.type : "new-app",
          title: String(data.title ?? ""),
          message: String(data.message ?? ""),
          time: String(data.time ?? (/* @__PURE__ */ new Date()).toISOString()),
          read: Boolean(data.read ?? false)
        };
      });
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockNotifications;
    }
  },
  // ── AI Analyses ───────────────────────────────────────────────────────────────
  /**
   * Saves an AI policy analysis to Firestore.
   * Spec: ai_analyses collection with sourceType, analysisDate, summary, riskLevel, recommendations
   */
  async saveAiAnalysis(analysis, sourceType, source) {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      const ref = collection(db, "users", uid, "ai_analyses");
      await setDoc(doc(ref), {
        sourceType,
        source: source.slice(0, 500),
        analysisDate: (/* @__PURE__ */ new Date()).toISOString(),
        summary: analysis.summary,
        riskLevel: analysis.riskLevel,
        dataCollected: analysis.dataCollected,
        thirdPartySharing: analysis.thirdPartySharing,
        retention: analysis.retention,
        recommendation: analysis.recommendation,
        createdAt: serverTimestamp()
      });
    } catch {
    }
  },
  /**
   * Returns the last 10 AI analyses for the current user.
   */
  async listAiAnalyses() {
    const uid = getCurrentUserId();
    if (!uid) return [];
    try {
      const ref = collection(db, "users", uid, "ai_analyses");
      const q = query(ref, orderBy("analysisDate", "desc"), limit(10));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          summary: String(data.summary ?? ""),
          dataCollected: Array.isArray(data.dataCollected) ? data.dataCollected.map(String) : [],
          thirdPartySharing: Array.isArray(data.thirdPartySharing) ? data.thirdPartySharing.map(String) : [],
          retention: String(data.retention ?? ""),
          riskLevel: ["low", "medium", "high"].includes(String(data.riskLevel)) ? data.riskLevel : "medium",
          recommendation: String(data.recommendation ?? ""),
          analysisDate: String(data.analysisDate ?? ""),
          sourceType: String(data.sourceType ?? "text")
        };
      });
    } catch {
      return [];
    }
  }
};
const AuthContext = reactExports.createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    setUser(authService.getCurrentUser());
    setLoading(false);
    return authService.subscribe(() => {
      const u = authService.getCurrentUser();
      setUser(u);
      if (u) firestoreService.upsertUserProfile();
    });
  }, []);
  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      await authService.signIn(email, password);
    },
    signUp: async (email, password, displayName) => {
      await authService.signUp(email, password, displayName);
    },
    signOut: async () => {
      await authService.signOut();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
const STORAGE_KEY = "pg-theme";
const ThemeContext = reactExports.createContext(void 0);
function ThemeProvider({ children }) {
  const [theme, setThemeState] = reactExports.useState("dark");
  reactExports.useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) || "dark";
    setThemeState(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);
  const setTheme = (t) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeContext.Provider, { value: { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }, children });
}
function useTheme() {
  const ctx = reactExports.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("[PWA] Service worker registered:", reg.scope);
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      newWorker?.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          console.log("[PWA] New service worker available");
        }
      });
    });
    return reg;
  } catch (err) {
    console.warn("[PWA] Service worker registration failed:", err);
    return null;
  }
}
async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}
function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
async function showLocalNotification(opts) {
  if (typeof window === "undefined") return;
  const permission = await requestNotificationPermission();
  if (!permission) return;
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      reg.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        title: opts.title,
        body: opts.body,
        notifType: opts.type || "general",
        url: opts.url || "/notifications"
      });
      return;
    }
  }
  try {
    new Notification(opts.title, {
      body: opts.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: `pg-${Date.now()}`
    });
  } catch {
  }
}
let deferredInstallPrompt = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
}
function canInstallPWA() {
  return deferredInstallPrompt !== null;
}
async function installPWA() {
  if (!deferredInstallPrompt) return "unavailable";
  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome;
}
function isPWAInstalled() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function getPlatform() {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/windows|macintosh|linux/.test(ua)) return "desktop";
  return "unknown";
}
function getInstallInstructions() {
  const platform = getPlatform();
  switch (platform) {
    case "android":
      return 'Tap the menu (⋮) in Chrome and select "Add to Home screen" to install Privacy Guard AI.';
    case "ios":
      return 'Tap the Share button (□↑) in Safari, then "Add to Home Screen" to install Privacy Guard AI.';
    case "desktop":
      return "Click the install icon (⊕) in your browser address bar to install Privacy Guard AI as a desktop app.";
    default:
      return "Open this page in Chrome or Safari to install Privacy Guard AI.";
  }
}
const themeInitScript = `(function(){try{var t=localStorage.getItem('pg-theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`;
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center glass rounded-2xl p-10 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-gradient", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center glass rounded-2xl p-8 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong. Try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Privacy Guard" },
      { name: "theme-color", content: "#1a1f2e" },
      { title: "Privacy Guard AI — Understand what your apps are really doing" },
      {
        name: "description",
        content: "Privacy Guard AI scans your apps, explains permissions in plain language, and analyses privacy policies so you can take back control."
      },
      { name: "author", content: "Privacy Guard AI" },
      { property: "og:title", content: "Privacy Guard AI" },
      { property: "og:description", content: "AI-powered privacy and security for your Android device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/svg+xml", href: "/icons/icon.svg" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("script", { dangerouslySetInnerHTML: { __html: themeInitScript } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  reactExports.useEffect(() => {
    registerServiceWorker();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallBanner, {})
  ] }) }) });
}
function PwaInstallBanner() {
  const [show, setShow] = reactExports.useState(false);
  const [installing, setInstalling] = reactExports.useState(false);
  const [dismissed, setDismissed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isPWAInstalled()) return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;
    const timer = setTimeout(() => {
      setShow(canInstallPWA() || getPlatform() === "ios");
    }, 3e3);
    const handler = () => setShow(true);
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  if (!show || dismissed) return null;
  const handleInstall = async () => {
    if (!canInstallPWA()) return;
    setInstalling(true);
    const result = await installPWA();
    setInstalling(false);
    if (result === "accepted") setShow(false);
  };
  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-2xl p-4 shadow-glow border border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5 text-white" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Install Privacy Guard AI" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: getPlatform() === "ios" && !canInstallPWA() ? getInstallInstructions() : "Install as an app for offline access and push notifications." }),
      canInstallPWA() && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleInstall,
          disabled: installing,
          className: "mt-2 inline-flex items-center gap-1.5 text-xs bg-gradient-primary text-white rounded-lg px-3 py-1.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-60",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
            installing ? "Installing…" : "Install App"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleDismiss,
        className: "text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
      }
    )
  ] }) }) });
}
const $$splitComponentImporter$b = () => import("./signup-DWrPpbPi.mjs");
const Route$b = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Create account — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./reset-password-iTqBTVMy.mjs");
const Route$a = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Reset password — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
function BrandLogo({ size = "md" }) {
  const dims = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `${dims} bg-gradient-primary rounded-xl grid place-items-center shadow-glow`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-1/2 w-1/2 text-primary-foreground", strokeWidth: 2.5 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold tracking-tight ${text}`, children: "Privacy Guard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "AI" })
    ] })
  ] });
}
const $$splitComponentImporter$9 = () => import("./login-DeIkgCdO.mjs");
const Route$9 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
function AuthShell({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: "lg" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-2xl p-8 shadow-card", children })
  ] }) });
}
const $$splitComponentImporter$8 = () => import("../_authenticated-1U8hrPNm.mjs");
const Route$8 = createFileRoute("/_authenticated")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./index-CelE4HBz.mjs");
const Route$7 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Privacy Guard AI — Take back control of your privacy"
    }, {
      name: "description",
      content: "Scan your apps, understand permissions in plain English, and analyse privacy policies with AI. Built for Android."
    }, {
      property: "og:title",
      content: "Privacy Guard AI"
    }, {
      property: "og:description",
      content: "AI-powered privacy and security for your Android device."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./settings-DVrXOZ6K.mjs");
const Route$6 = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{
      title: "Settings — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./policy-analyzer-Bhzmk321.mjs");
const Route$5 = createFileRoute("/_authenticated/policy-analyzer")({
  head: () => ({
    meta: [{
      title: "Policy Analyzer — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./notifications-DDnHvffb.mjs");
const Route$4 = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [{
      title: "Notifications — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dashboard-DukUxjPt.mjs");
const Route$3 = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./assistant-DMc-4PYd.mjs");
const Route$2 = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [{
      title: "AI Assistant — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./apps-hxWCyuz9.mjs");
const Route$1 = createFileRoute("/_authenticated/apps")({
  head: () => ({
    meta: [{
      title: "Applications — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./apps._appId-DBmgaDao.mjs");
const Route = createFileRoute("/_authenticated/apps/$appId")({
  head: () => ({
    meta: [{
      title: "App details — Privacy Guard AI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$b.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$c
});
const ResetPasswordRoute = Route$a.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$c
});
const LoginRoute = Route$9.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$c
});
const AuthenticatedRoute = Route$8.update({
  id: "/_authenticated",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const AuthenticatedSettingsRoute = Route$6.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedPolicyAnalyzerRoute = Route$5.update({
  id: "/policy-analyzer",
  path: "/policy-analyzer",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedNotificationsRoute = Route$4.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDashboardRoute = Route$3.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAssistantRoute = Route$2.update({
  id: "/assistant",
  path: "/assistant",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAppsRoute = Route$1.update({
  id: "/apps",
  path: "/apps",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAppsAppIdRoute = Route.update({
  id: "/$appId",
  path: "/$appId",
  getParentRoute: () => AuthenticatedAppsRoute
});
const AuthenticatedAppsRouteChildren = {
  AuthenticatedAppsAppIdRoute
};
const AuthenticatedAppsRouteWithChildren = AuthenticatedAppsRoute._addFileChildren(AuthenticatedAppsRouteChildren);
const AuthenticatedRouteChildren = {
  AuthenticatedAppsRoute: AuthenticatedAppsRouteWithChildren,
  AuthenticatedAssistantRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedNotificationsRoute,
  AuthenticatedPolicyAnalyzerRoute,
  AuthenticatedSettingsRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  LoginRoute,
  ResetPasswordRoute,
  SignupRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  AuthShell as A,
  BrandLogo as B,
  authService as a,
  config as b,
  canInstallPWA as c,
  firebaseAuth as d,
  firestoreService as e,
  firebaseApp as f,
  getInstallInstructions as g,
  getNotificationPermission as h,
  getPlatform as i,
  installPWA as j,
  isPWAInstalled as k,
  router as l,
  showLocalNotification as m,
  useTheme as n,
  requestNotificationPermission as r,
  scoreBand as s,
  useAuth as u
};
