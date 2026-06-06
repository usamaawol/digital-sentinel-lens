/**
 * Privacy Guard AI — Service Worker
 *
 * Responsibilities:
 * 1. Cache-first strategy for static assets (offline support)
 * 2. Network-first for API/Firestore calls
 * 3. Handle Web Push Notifications
 * 4. Background sync for scan results
 */

const CACHE_NAME = "privacy-guard-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/apps",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install: cache static shell ───────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Non-fatal — some assets may not exist yet
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first with cache fallback ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, cross-origin, and API requests
  if (
    event.request.method !== "GET" ||
    !url.origin.includes(self.location.origin) ||
    url.pathname.startsWith("/_server") ||
    url.pathname.startsWith("/api")
  ) {
    return;
  }

  // For navigation requests: network-first, fallback to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match("/offline.html")))
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "Privacy Guard AI",
    body: "A privacy event was detected on your device.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    tag: "privacy-guard-alert",
    type: "general",
    url: "/notifications",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-96.png",
    tag: data.tag || "privacy-guard",
    data: { url: data.url || "/notifications", type: data.type },
    requireInteraction: data.type === "high-risk",
    vibrate: data.type === "high-risk" ? [200, 100, 200] : [100],
    actions: [
      { action: "view", title: "View Details" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click handler ────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ── Background sync ───────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-scan-results") {
    event.waitUntil(
      // Notify all clients to re-fetch
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "SYNC_COMPLETE" })
        );
      })
    );
  }
});

// ── Message handler (from app) ────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Show a local notification triggered from the app
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body, notifType, url } = event.data;
    self.registration.showNotification(title || "Privacy Guard AI", {
      body: body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: `pg-${Date.now()}`,
      data: { url: url || "/notifications", type: notifType },
      requireInteraction: notifType === "high-risk",
      vibrate: notifType === "high-risk" ? [200, 100, 200] : [100],
    });
  }
});
