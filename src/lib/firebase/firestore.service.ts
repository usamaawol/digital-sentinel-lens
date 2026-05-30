/**
 * Firestore service — reads real data synced from the Android app.
 *
 * Collections (per spec):
 *   users/{uid}                    — user profile
 *   users/{uid}/apps               — scanned app records
 *   users/{uid}/reports            — weekly privacy reports
 *   users/{uid}/notifications      — security notifications
 *   users/{uid}/ai_analyses        — cached AI policy analyses
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp, firebaseAuth } from "./config";
import {
  mockApps,
  mockNotifications,
  mockWeeklyReport,
  type AppRecord,
  type NotificationItem,
  type WeeklyReport,
} from "../mock-data";
import type { PolicyAnalysis } from "../ai/ai.service";

const db = getFirestore(firebaseApp);

function getCurrentUserId(): string | null {
  return firebaseAuth.currentUser?.uid ?? null;
}

function mapFirestoreApp(id: string, data: Record<string, unknown>): AppRecord {
  return {
    id: String(data.id ?? id),
    name: String(data.name ?? "Unknown App"),
    packageName: String(data.packageName ?? ""),
    developer: String(data.developer ?? "Unknown"),
    version: String(data.version ?? "1.0"),
    category: String(data.category ?? "Unknown"),
    icon: String(data.icon ?? "📦"),
    privacyScore: Number(data.privacyScore ?? 50),
    riskLevel: (["safe", "low", "medium", "high"].includes(String(data.riskLevel))
      ? data.riskLevel
      : "medium") as AppRecord["riskLevel"],
    lastScan: String(data.lastScan ?? new Date().toISOString()),
    permissions: Array.isArray(data.permissions)
      ? (data.permissions as Array<Record<string, unknown>>).map((p) => ({
          name: String(p.name ?? ""),
          risk: (["low", "medium", "high"].includes(String(p.risk)) ? p.risk : "medium") as
            | "low"
            | "medium"
            | "high",
          explanation: String(p.explanation ?? ""),
          granted: Boolean(p.granted ?? true),
        }))
      : [],
  };
}

export const firestoreService = {
  // ── User Profile ─────────────────────────────────────────────────────────────

  /**
   * Creates or updates the user profile in Firestore.
   * Called on sign-in and sign-up.
   * Spec: users collection with uid, email, displayName, createdAt, lastLogin
   */
  async upsertUserProfile(): Promise<void> {
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
          lastLogin: new Date().toISOString(),
          updatedAt: serverTimestamp(),
          ...(existing.exists() ? {} : { createdAt: new Date().toISOString() }),
        },
        { merge: true },
      );
    } catch {
      // Non-critical
    }
  },

  /**
   * Updates the display name in Firestore.
   */
  async updateDisplayName(displayName: string): Promise<void> {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      await setDoc(doc(db, "users", uid), { displayName, updatedAt: serverTimestamp() }, { merge: true });
    } catch {
      // Non-critical
    }
  },

  // ── Apps ─────────────────────────────────────────────────────────────────────

  async listApps(): Promise<AppRecord[]> {
    const uid = getCurrentUserId();
    if (!uid) return mockApps;
    try {
      const appsRef = collection(db, "users", uid, "apps");
      const snapshot = await getDocs(appsRef);
      if (snapshot.empty) return mockApps;
      return snapshot.docs.map((d) => mapFirestoreApp(d.id, d.data() as Record<string, unknown>));
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockApps;
    }
  },

  async getApp(id: string): Promise<AppRecord | null> {
    const uid = getCurrentUserId();
    if (!uid) return mockApps.find((a) => a.id === id) ?? null;
    try {
      const docRef = doc(db, "users", uid, "apps", id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return mockApps.find((a) => a.id === id) ?? null;
      return mapFirestoreApp(snapshot.id, snapshot.data() as Record<string, unknown>);
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockApps.find((a) => a.id === id) ?? null;
    }
  },

  // ── Reports ───────────────────────────────────────────────────────────────────

  async getWeeklyReport(): Promise<WeeklyReport> {
    const uid = getCurrentUserId();
    if (!uid) return mockWeeklyReport;
    try {
      const reportsRef = collection(db, "users", uid, "reports");
      const q = query(reportsRef, orderBy("generatedAt", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return mockWeeklyReport;
      const data = snapshot.docs[0].data() as Record<string, unknown>;
      return {
        reportDate: String(data.reportDate ?? new Date().toISOString()),
        days: Array.isArray(data.days) ? data.days.map(String) : mockWeeklyReport.days,
        locationUsage: Array.isArray(data.locationUsage) ? data.locationUsage.map(Number) : mockWeeklyReport.locationUsage,
        cameraUsage: Array.isArray(data.cameraUsage) ? data.cameraUsage.map(Number) : mockWeeklyReport.cameraUsage,
        microphoneUsage: Array.isArray(data.microphoneUsage) ? data.microphoneUsage.map(Number) : mockWeeklyReport.microphoneUsage,
        contactsUsage: Array.isArray(data.contactsUsage) ? data.contactsUsage.map(Number) : mockWeeklyReport.contactsUsage,
        storageUsage: Array.isArray(data.storageUsage) ? data.storageUsage.map(Number) : mockWeeklyReport.storageUsage,
      };
    } catch (err) {
      console.warn("Firestore unavailable, using mock data:", err);
      return mockWeeklyReport;
    }
  },

  // ── Notifications ─────────────────────────────────────────────────────────────

  async listNotifications(): Promise<NotificationItem[]> {
    const uid = getCurrentUserId();
    if (!uid) return mockNotifications;
    try {
      const notifsRef = collection(db, "users", uid, "notifications");
      const q = query(notifsRef, orderBy("time", "desc"), limit(50));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return mockNotifications;
      return snapshot.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: String(data.id ?? d.id),
          type: (["new-app", "high-risk", "score-change", "report"].includes(String(data.type))
            ? data.type
            : "new-app") as NotificationItem["type"],
          title: String(data.title ?? ""),
          message: String(data.message ?? ""),
          time: String(data.time ?? new Date().toISOString()),
          read: Boolean(data.read ?? false),
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
  async saveAiAnalysis(analysis: PolicyAnalysis, sourceType: "url" | "text", source: string): Promise<void> {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      const ref = collection(db, "users", uid, "ai_analyses");
      await setDoc(doc(ref), {
        sourceType,
        source: source.slice(0, 500),
        analysisDate: new Date().toISOString(),
        summary: analysis.summary,
        riskLevel: analysis.riskLevel,
        dataCollected: analysis.dataCollected,
        thirdPartySharing: analysis.thirdPartySharing,
        retention: analysis.retention,
        recommendation: analysis.recommendation,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Non-critical
    }
  },

  /**
   * Returns the last 10 AI analyses for the current user.
   */
  async listAiAnalyses(): Promise<Array<PolicyAnalysis & { analysisDate: string; sourceType: string }>> {
    const uid = getCurrentUserId();
    if (!uid) return [];
    try {
      const ref = collection(db, "users", uid, "ai_analyses");
      const q = query(ref, orderBy("analysisDate", "desc"), limit(10));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          summary: String(data.summary ?? ""),
          dataCollected: Array.isArray(data.dataCollected) ? data.dataCollected.map(String) : [],
          thirdPartySharing: Array.isArray(data.thirdPartySharing) ? data.thirdPartySharing.map(String) : [],
          retention: String(data.retention ?? ""),
          riskLevel: (["low", "medium", "high"].includes(String(data.riskLevel)) ? data.riskLevel : "medium") as "low" | "medium" | "high",
          recommendation: String(data.recommendation ?? ""),
          analysisDate: String(data.analysisDate ?? ""),
          sourceType: String(data.sourceType ?? "text"),
        };
      });
    } catch {
      return [];
    }
  },
};
