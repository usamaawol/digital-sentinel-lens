/**
 * PWA utilities — Service Worker registration, Web Push, install prompt.
 *
 * Handles:
 * 1. Service Worker registration
 * 2. Web Push Notification permission + subscription
 * 3. Local notifications via SW (works even when app is in background)
 * 4. Install-to-homescreen prompt (Android + Desktop)
 */

// ── Service Worker ────────────────────────────────────────────────────────────

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("[PWA] Service worker registered:", reg.scope);

    // Listen for SW updates
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

// ── Push Notifications ────────────────────────────────────────────────────────

/**
 * Requests notification permission from the user.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Shows a local notification via the Service Worker.
 * Works even when the browser tab is in the background.
 * Falls back to the Notification API if SW is not available.
 */
export async function showLocalNotification(opts: {
  title: string;
  body: string;
  type?: "high-risk" | "new-app" | "score-change" | "report" | "general";
  url?: string;
}): Promise<void> {
  if (typeof window === "undefined") return;

  const permission = await requestNotificationPermission();
  if (!permission) return;

  // Try via Service Worker first (works in background)
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      // Post message to SW to show notification
      reg.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        title: opts.title,
        body: opts.body,
        notifType: opts.type || "general",
        url: opts.url || "/notifications",
      });
      return;
    }
  }

  // Fallback: direct Notification API
  try {
    new Notification(opts.title, {
      body: opts.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: `pg-${Date.now()}`,
    });
  } catch {
    // Silent fail
  }
}

// ── Install Prompt ────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

export function canInstallPWA(): boolean {
  return deferredInstallPrompt !== null;
}

export async function installPWA(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredInstallPrompt) return "unavailable";

  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome;
}

export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

// ── Platform detection ────────────────────────────────────────────────────────

export function getPlatform(): "android" | "ios" | "desktop" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/windows|macintosh|linux/.test(ua)) return "desktop";
  return "unknown";
}

export function getInstallInstructions(): string {
  const platform = getPlatform();
  switch (platform) {
    case "android":
      return 'Tap the menu (⋮) in Chrome and select "Add to Home screen" to install Privacy Guard AI.';
    case "ios":
      return 'Tap the Share button (□↑) in Safari, then "Add to Home Screen" to install Privacy Guard AI.';
    case "desktop":
      return 'Click the install icon (⊕) in your browser address bar to install Privacy Guard AI as a desktop app.';
    default:
      return "Open this page in Chrome or Safari to install Privacy Guard AI.";
  }
}
