import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Download, X as XIcon, Smartphone as SmartphoneIcon } from "lucide-react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { Toaster } from "@/components/ui/sonner";
import {
  registerServiceWorker,
  canInstallPWA,
  installPWA,
  isPWAInstalled,
  getInstallInstructions,
  getPlatform,
} from "@/lib/pwa";

const themeInitScript = `(function(){try{var t=localStorage.getItem('pg-theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`;

// ── 404 ───────────────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10 shadow-card">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-8 shadow-card">
        <h1 className="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Root route ────────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
        content:
          "Privacy Guard AI scans your apps, explains permissions in plain language, and analyses privacy policies so you can take back control.",
      },
      { name: "author", content: "Privacy Guard AI" },
      { property: "og:title", content: "Privacy Guard AI" },
      { property: "og:description", content: "AI-powered privacy and security for your Android device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/svg+xml", href: "/icons/icon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
          <PwaInstallBanner />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ── PWA Install Banner ────────────────────────────────────────────────────────
function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isPWAInstalled()) return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const timer = setTimeout(() => {
      setShow(canInstallPWA() || getPlatform() === "ios");
    }, 3000);

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

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="glass-strong rounded-2xl p-4 shadow-glow border border-primary/30">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
            <SmartphoneIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Install Privacy Guard AI</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {getPlatform() === "ios" && !canInstallPWA()
                ? getInstallInstructions()
                : "Install as an app for offline access and push notifications."}
            </div>
            {canInstallPWA() && (
              <button
                onClick={handleInstall}
                disabled={installing}
                className="mt-2 inline-flex items-center gap-1.5 text-xs bg-gradient-primary text-white rounded-lg px-3 py-1.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" />
                {installing ? "Installing…" : "Install App"}
              </button>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
