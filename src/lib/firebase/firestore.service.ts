/**
 * Firestore service abstraction. Returns mock data for now.
 * Replace internals with real Firestore queries when Firebase is wired.
 *
 * Collections (per spec):
 *   users, apps, privacy_reports, ai_analyses
 */

import {
  mockApps,
  mockNotifications,
  mockWeeklyReport,
  type AppRecord,
  type NotificationItem,
  type WeeklyReport,
} from "../mock-data";

export const firestoreService = {
  async listApps(): Promise<AppRecord[]> {
    await delay(200);
    return mockApps;
  },
  async getApp(id: string): Promise<AppRecord | null> {
    await delay(150);
    return mockApps.find((a) => a.id === id) ?? null;
  },
  async getWeeklyReport(): Promise<WeeklyReport> {
    await delay(200);
    return mockWeeklyReport;
  },
  async listNotifications(): Promise<NotificationItem[]> {
    await delay(150);
    return mockNotifications;
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
