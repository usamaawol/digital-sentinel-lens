/**
 * Client-side scan engine.
 *
 * Since this is a web app (not native Android), scanning works like this:
 *   1. User manually adds apps by name/package (or picks from the known catalog)
 *   2. "Scan All" loads the full known-apps catalog and scores every entry
 *   3. Results are saved to Firestore under users/{uid}/apps
 *   4. Notifications are generated for high-risk findings
 *
 * When the Android native app is installed, it writes real device data to the
 * same Firestore path and this web dashboard reads it automatically.
 */

import {
  collection,
  doc,
  getFirestore,
  setDoc,
  serverTimestamp,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { firebaseApp, firebaseAuth } from "./firebase/config";
import { scoreBand, type AppRecord, type NotificationItem } from "./mock-data";
import { showLocalNotification } from "./pwa";

const db = getFirestore(firebaseApp);

// ── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Computes a privacy score for an app based on its permissions.
 * Mirrors the Kotlin PrivacyScoringEngine logic.
 */
export function computeScore(app: AppRecord): number {
  let score = 100;
  const granted = app.permissions.filter((p) => p.granted);
  const dangerous = granted.filter((p) => p.risk !== "low");

  // Penalty: dangerous permission count
  const countPenalty = [0, 5, 12, 20, 28, 35][Math.min(dangerous.length, 5)];
  score -= countPenalty;

  // Penalty: risk weights
  const weightSum = granted.reduce((s, p) => {
    return s + (p.risk === "high" ? 5 : p.risk === "medium" ? 3 : 1);
  }, 0);
  score -= Math.min(40, weightSum * 2);

  return Math.max(0, Math.min(100, score));
}

// ── Scan a single app ────────────────────────────────────────────────────────

export async function scanApp(app: AppRecord): Promise<AppRecord> {
  const uid = firebaseAuth.currentUser?.uid;
  const score = computeScore(app);
  const riskLevel = scoreBand(score);
  const scanned: AppRecord = {
    ...app,
    privacyScore: score,
    riskLevel,
    lastScan: new Date().toISOString(),
  };

  if (uid) {
    const docId = app.packageName.replace(/\./g, "_");
    await setDoc(doc(db, "users", uid, "apps", docId), {
      ...scanned,
      syncedAt: serverTimestamp(),
      syncSource: "web",
    });

    // Generate notification if high risk
    if (riskLevel === "high") {
      await createNotification(uid, {
        type: "high-risk",
        title: "High Risk App Detected",
        message: `${app.name} has a privacy score of ${score}/100. Review its permissions.`,
        packageName: app.packageName,
      });
      // System push notification
      await showLocalNotification({
        title: "⚠️ High Risk App Detected",
        body: `${app.name} scored ${score}/100. Tap to review permissions.`,
        type: "high-risk",
        url: `/apps/${app.id}`,
      });
    }
  }

  return scanned;
}

// ── Scan all apps ────────────────────────────────────────────────────────────

export async function scanAllApps(
  apps: AppRecord[],
  onProgress?: (done: number, total: number) => void,
): Promise<AppRecord[]> {
  const uid = firebaseAuth.currentUser?.uid;
  const results: AppRecord[] = [];
  const batch = writeBatch(db);

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const score = computeScore(app);
    const riskLevel = scoreBand(score);
    const scanned: AppRecord = {
      ...app,
      privacyScore: score,
      riskLevel,
      lastScan: new Date().toISOString(),
    };
    results.push(scanned);

    if (uid) {
      const docId = app.packageName.replace(/\./g, "_");
      batch.set(doc(db, "users", uid, "apps", docId), {
        ...scanned,
        syncedAt: serverTimestamp(),
        syncSource: "web",
      });
    }

    onProgress?.(i + 1, apps.length);
  }

  if (uid) {
    await batch.commit();

    // Notify about high-risk apps found
    const highRisk = results.filter((a) => a.riskLevel === "high");
    if (highRisk.length > 0) {
      await createNotification(uid, {
        type: "high-risk",
        title: `${highRisk.length} High Risk App${highRisk.length > 1 ? "s" : ""} Found`,
        message: `${highRisk.map((a) => a.name).join(", ")} ${highRisk.length > 1 ? "require" : "requires"} your attention.`,
      });
      // System push notification
      await showLocalNotification({
        title: `⚠️ ${highRisk.length} High Risk App${highRisk.length > 1 ? "s" : ""} Found`,
        body: `${highRisk.map((a) => a.name).slice(0, 3).join(", ")} require your attention.`,
        type: "high-risk",
        url: "/apps",
      });
    }

    // Score change notification
    const avgScore = Math.round(results.reduce((s, a) => s + a.privacyScore, 0) / results.length);
    await createNotification(uid, {
      type: "score-change",
      title: "Scan Complete",
      message: `Scanned ${results.length} apps. Overall privacy score: ${avgScore}/100.`,
    });
  }

  return results;
}

// ── New app notification ─────────────────────────────────────────────────────

export async function notifyNewApp(app: AppRecord): Promise<void> {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) return;

  await createNotification(uid, {
    type: "new-app",
    title: "New App Added",
    message: `${app.name} was added to your scan list. Privacy score: ${app.privacyScore}/100.`,
    packageName: app.packageName,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createNotification(
  uid: string,
  data: {
    type: NotificationItem["type"];
    title: string;
    message: string;
    packageName?: string;
  },
): Promise<void> {
  try {
    await addDoc(collection(db, "users", uid, "notifications"), {
      ...data,
      time: new Date().toISOString(),
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-critical — don't throw
  }
}

// ── Full app catalog (for "Scan All" mode) ───────────────────────────────────

export { APP_CATALOG as fullAppCatalog } from "./device-apps";
