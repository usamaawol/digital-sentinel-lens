import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { e as firestoreService } from "./router-x6rZinQA.mjs";
import { S as ScoreRing, a as scanApp } from "./score-ring-sq4HaJE7.mjs";
import { R as RiskBadge } from "./risk-badge-5VLUO8Nt.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as aiService } from "./ai.service-DoSfZ9ki.mjs";
import "../_libs/firebase__auth.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/seroval.mjs";
import { U as ShieldAlert, b as ArrowLeft, g as Building2, a1 as Tag, P as Package, C as Calendar, r as LoaderCircle, S as ScanLine, Z as Sparkles, a4 as TriangleAlert, A as Activity, G as Globe, f as Bluetooth, v as MessageSquare, I as Phone, B as Bell, H as HardDrive, a6 as Users, M as MapPin, w as Mic, h as Camera, E as Eye, l as CircleCheck, m as CircleX, k as ChevronUp, j as ChevronDown, n as Clock, t as LockOpen, s as Lock } from "../_libs/lucide-react.mjs";
import { f as format } from "../_libs/date-fns.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./server-BQeBvh7z.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/zod.mjs";
const PERMISSION_META = {
  Camera: {
    icon: Camera,
    group: "Hardware",
    what: "Take photos and record videos using your device camera",
    when: "When you open the camera in the app, or potentially in the background",
    dataAccessed: ["Photos you take", "Video recordings", "Live camera feed"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Camera → Deny"
  },
  Microphone: {
    icon: Mic,
    group: "Hardware",
    what: "Record audio using your device microphone",
    when: "During voice calls, voice messages, or potentially in the background",
    dataAccessed: ["Voice recordings", "Ambient audio", "Voice commands"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Microphone → Deny"
  },
  Location: {
    icon: MapPin,
    group: "Location",
    what: "Access your precise GPS location or approximate network location",
    when: "When using location features, or always if background location is granted",
    dataAccessed: ["GPS coordinates", "Location history", "Nearby places"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Location → Deny or 'While in use'"
  },
  Contacts: {
    icon: Users,
    group: "Personal Data",
    what: "Read your full contact list including names, phone numbers, and emails",
    when: "When the app syncs contacts or suggests friends — often uploaded to servers",
    dataAccessed: ["Contact names", "Phone numbers", "Email addresses", "Profile photos"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Contacts → Deny"
  },
  Storage: {
    icon: HardDrive,
    group: "Storage",
    what: "Read and write files on your device storage",
    when: "When saving or loading files, photos, or app data",
    dataAccessed: ["Photos and videos", "Documents", "Downloaded files", "App data"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Storage → Deny"
  },
  Notifications: {
    icon: Bell,
    group: "System",
    what: "Send push notifications to your device",
    when: "Any time the app wants to alert you — including promotional messages",
    dataAccessed: ["Notification content visible on lock screen"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Notifications → Turn off"
  },
  Phone: {
    icon: Phone,
    group: "Communication",
    what: "Access phone state, call logs, and potentially make calls",
    when: "When the app reads your phone number or call history",
    dataAccessed: ["Phone number", "IMEI device ID", "Call history", "Network info"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Phone → Deny"
  },
  SMS: {
    icon: MessageSquare,
    group: "Communication",
    what: "Read, send, or intercept your text messages",
    when: "When reading OTP codes or sending messages on your behalf",
    dataAccessed: ["All SMS messages", "OTP codes", "Private conversations"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → SMS → Deny"
  },
  Bluetooth: {
    icon: Bluetooth,
    group: "Hardware",
    what: "Scan for and connect to nearby Bluetooth devices",
    when: "When connecting to speakers, headphones, or other devices",
    dataAccessed: ["Nearby device names", "Bluetooth MAC addresses"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Nearby devices → Deny"
  },
  "Internet Access": {
    icon: Globe,
    group: "Network",
    what: "Send and receive data over the internet",
    when: "Constantly — any time the app is running",
    dataAccessed: ["All data the app sends to its servers", "Your IP address"],
    canBeRevoked: false,
    revokeInstructions: "Cannot be revoked — use a firewall app to block network access"
  }
};
function getPermMeta(name) {
  return PERMISSION_META[name] ?? {
    icon: Eye,
    group: "Other",
    what: `Access ${name.toLowerCase()} on your device`,
    when: "When the app uses this feature",
    dataAccessed: ["Data related to this permission"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions"
  };
}
function AppDetail() {
  const {
    appId
  } = useParams({
    from: "/_authenticated/apps/$appId"
  });
  const queryClient = useQueryClient();
  const [scanning, setScanning] = reactExports.useState(false);
  const [expandedPerm, setExpandedPerm] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("permissions");
  const [aiAnalysis, setAiAnalysis] = reactExports.useState(null);
  const [loadingAi, setLoadingAi] = reactExports.useState(false);
  const {
    data: app,
    isLoading
  } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => firestoreService.getApp(appId)
  });
  const handleScan = async () => {
    if (!app) return;
    setScanning(true);
    try {
      await scanApp(app);
      await queryClient.invalidateQueries({
        queryKey: ["app", appId]
      });
      await queryClient.invalidateQueries({
        queryKey: ["apps"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifs"]
      });
      toast.success(`${app.name} scanned successfully.`);
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  };
  const handleAiAnalysis = async () => {
    if (!app) return;
    setLoadingAi(true);
    setActiveTab("ai");
    try {
      const permSummary = app.permissions.filter((p) => p.granted).map((p) => `${p.name} (${p.risk} risk)`).join(", ");
      const reply = await aiService.chat([{
        role: "user",
        content: `Analyse this Android app for privacy risks:

App: ${app.name}
Category: ${app.category}
Developer: ${app.developer}
Privacy Score: ${app.privacyScore}/100
Granted Permissions: ${permSummary}

Provide:
1. What this app is likely doing with these permissions
2. The biggest privacy risks
3. Specific recommendations for the user

Be specific and practical. Use plain language.`
      }]);
      setAiAnalysis(reply);
    } catch {
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-6 h-40 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-6 h-64 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-6 h-48 animate-pulse" })
    ] });
  }
  if (!app) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "App not found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/apps", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-4", children: "Back to apps" }) })
    ] });
  }
  const grantedPerms = app.permissions.filter((p) => p.granted);
  const deniedPerms = app.permissions.filter((p) => !p.granted);
  const highRiskGranted = grantedPerms.filter((p) => p.risk === "high");
  grantedPerms.filter((p) => p.risk === "medium");
  const purposeMismatch = detectPurposeMismatch(app);
  const permGroups = groupPermissions(app.permissions);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apps", className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to apps"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-6 shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 rounded-2xl bg-muted grid place-items-center text-4xl shrink-0", children: app.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: app.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { risk: app.riskLevel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: Building2, label: "Developer", value: app.developer }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: Tag, label: "Category", value: app.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: Package, label: "Version", value: app.version }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: Calendar, label: "Last scan", value: format(new Date(app.lastScan), "PP") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: handleScan, disabled: scanning, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
            "Scanning…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-3.5 w-3.5 mr-1.5" }),
            "Scan Now"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: handleAiAnalysis, disabled: loadingAi, children: loadingAi ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
            "Analysing…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 mr-1.5" }),
            "AI Analysis"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score: app.privacyScore, size: 110, label: "Score" })
    ] }) }),
    purposeMismatch && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-4 shadow-card border border-destructive/40 bg-destructive/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm text-destructive", children: "⚠️ Suspicious Permission Pattern" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: purposeMismatch })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Total permissions", value: app.permissions.length, color: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Granted", value: grantedPerms.length, color: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "High risk active", value: highRiskGranted.length, color: highRiskGranted.length > 0 ? "destructive" : "muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Denied / Not granted", value: deniedPerms.length, color: "muted" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold mb-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary" }),
        "What ",
        app.name,
        " can access right now"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "These permissions are currently granted — the app can use them at any time." }),
      grantedPerms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: "No permissions currently granted." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: grantedPerms.map((p) => {
        const meta = getPermMeta(p.name);
        const Icon = meta.icon;
        const riskColor = p.risk === "high" ? "text-destructive bg-destructive/10 border-destructive/30" : p.risk === "medium" ? "text-warning bg-warning/10 border-warning/30" : "text-success bg-success/10 border-success/30";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setExpandedPerm(expandedPerm === p.name ? null : p.name);
          setActiveTab("permissions");
        }, className: `rounded-xl border p-3 text-left transition-all hover:shadow-md ${riskColor} ${expandedPerm === p.name ? "ring-2 ring-current/30" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wider mt-0.5 opacity-70", children: [
            p.risk,
            " risk"
          ] })
        ] }, p.name);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl shadow-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b border-border/60", children: ["permissions", "behavior", "ai"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab(tab), className: `flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`, children: tab === "permissions" ? "All Permissions" : tab === "behavior" ? "Behavior Analysis" : "AI Analysis" }, tab)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        activeTab === "permissions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Click any permission to see exactly what data it accesses and how to revoke it." }),
          Object.entries(permGroups).map(([group, perms]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 px-1", children: group }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: perms.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionCard, { perm: p, appName: app.name, expanded: expandedPerm === p.name, onToggle: () => setExpandedPerm(expandedPerm === p.name ? null : p.name) }, p.name)) })
          ] }, group))
        ] }),
        activeTab === "behavior" && /* @__PURE__ */ jsxRuntimeExports.jsx(BehaviorAnalysis, { app }),
        activeTab === "ai" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: loadingAi ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-8 justify-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
            "AI is analysing ",
            app.name,
            "…"
          ] })
        ] }) : aiAnalysis ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "AI Privacy Analysis" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Powered by OpenRouter" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground", children: aiAnalysis })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-10 w-10 mx-auto mb-3 text-accent opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Get AI-powered analysis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 mb-4", children: [
            "Ask AI to explain exactly what ",
            app.name,
            " is doing with its permissions."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAiAnalysis, disabled: loadingAi, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Analyse with AI"
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function PermissionCard({
  perm,
  appName,
  expanded,
  onToggle
}) {
  const meta = getPermMeta(perm.name);
  const Icon = meta.icon;
  const borderColor = !perm.granted ? "border-border/40 bg-muted/10" : perm.risk === "high" ? "border-destructive/40 bg-destructive/5" : perm.risk === "medium" ? "border-warning/30 bg-warning/5" : "border-success/20 bg-success/5";
  const iconColor = !perm.granted ? "text-muted-foreground" : perm.risk === "high" ? "text-destructive" : perm.risk === "medium" ? "text-warning" : "text-success";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border transition-all ${borderColor}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onToggle, className: "w-full flex items-center gap-3 p-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-lg bg-current/10 grid place-items-center shrink-0 ${iconColor}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: perm.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { risk: perm.risk }),
          perm.granted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-success font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            " Granted"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
            " Not granted"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 line-clamp-1", children: perm.explanation })
      ] }),
      expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-4 border-t border-border/40 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5", children: [
          "What ",
          appName,
          " can do"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: meta.what })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          " When it activates"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: meta.when })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
          " Data it can access"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: meta.dataAccessed.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary shrink-0" }),
          d
        ] }, d)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 ${perm.granted ? "bg-primary/8 border border-primary/20" : "bg-muted/30"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1", children: [
          perm.granted ? /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
          perm.granted ? "How to revoke" : "How to grant"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: meta.revokeInstructions })
      ] })
    ] })
  ] });
}
function BehaviorAnalysis({
  app
}) {
  const grantedPerms = app.permissions.filter((p) => p.granted);
  const hasCamera = grantedPerms.some((p) => p.name === "Camera");
  const hasMic = grantedPerms.some((p) => p.name === "Microphone");
  const hasLocation = grantedPerms.some((p) => p.name === "Location");
  const hasContacts = grantedPerms.some((p) => p.name === "Contacts");
  const hasStorage = grantedPerms.some((p) => p.name === "Storage");
  const hasSms = grantedPerms.some((p) => p.name === "SMS");
  const hasPhone = grantedPerms.some((p) => p.name === "Phone");
  const hasNotifs = grantedPerms.some((p) => p.name === "Notifications");
  const behaviors = [{
    title: "Can photograph you or your surroundings",
    description: "Camera access allows the app to take photos and record video. Some apps access the camera in the background.",
    severity: "high",
    active: hasCamera,
    icon: Camera
  }, {
    title: "Can listen through your microphone",
    description: "Microphone access allows the app to record audio. This includes ambient sounds when the app is in the background.",
    severity: "high",
    active: hasMic,
    icon: Mic
  }, {
    title: "Can track your physical location",
    description: "Location access lets the app know where you are. This data is often used for ad targeting and profiling.",
    severity: "high",
    active: hasLocation,
    icon: MapPin
  }, {
    title: "Can read your contact list",
    description: "Contact access gives the app your full address book. Most apps upload this to their servers for 'friend suggestions'.",
    severity: "high",
    active: hasContacts,
    icon: Users
  }, {
    title: "Can read your SMS messages",
    description: "SMS access is extremely sensitive — the app can read all your text messages including OTP codes and private conversations.",
    severity: "critical",
    active: hasSms,
    icon: MessageSquare
  }, {
    title: "Can access your phone identity",
    description: "Phone access reveals your phone number, IMEI, and call history. Used for device fingerprinting and ad tracking.",
    severity: "high",
    active: hasPhone,
    icon: Phone
  }, {
    title: "Can read and write your files",
    description: "Storage access lets the app read your photos, documents, and downloads. It can also create and delete files.",
    severity: "medium",
    active: hasStorage,
    icon: HardDrive
  }, {
    title: "Can send you notifications",
    description: "The app can send push notifications at any time, including promotional and advertising messages.",
    severity: "low",
    active: hasNotifs,
    icon: Bell
  }];
  const activeBehaviors = behaviors.filter((b) => b.active);
  const inactiveBehaviors = behaviors.filter((b) => !b.active);
  const severityColor = {
    critical: "border-destructive/60 bg-destructive/8 text-destructive",
    high: "border-destructive/30 bg-destructive/5 text-destructive",
    medium: "border-warning/30 bg-warning/5 text-warning",
    low: "border-border/60 bg-muted/20 text-muted-foreground",
    safe: "border-success/30 bg-success/5 text-success"
  };
  const severityLabel = {
    critical: "Critical",
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
    safe: "Safe"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-1", children: "Active capabilities" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
        "Based on granted permissions, ",
        app.name,
        " can currently do the following:"
      ] }),
      activeBehaviors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-4 glass rounded-xl", children: "No sensitive capabilities are currently active." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: activeBehaviors.map((b) => {
        const Icon = b.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl border p-4 ${severityColor[b.severity]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: b.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-medium ${severityColor[b.severity]}`, children: severityLabel[b.severity] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-80", children: b.description })
          ] })
        ] }) }, b.title);
      }) })
    ] }),
    inactiveBehaviors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-1 text-muted-foreground", children: "Not granted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
        "These capabilities are NOT currently active for ",
        app.name,
        ":"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: inactiveBehaviors.map((b) => {
        const Icon = b.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/40 bg-muted/10 p-3 flex items-center gap-2 opacity-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground line-clamp-1", children: b.title })
        ] }, b.title);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 border border-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3" }),
        " Data flow summary"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        hasCamera && /* @__PURE__ */ jsxRuntimeExports.jsx(DataFlow, { from: "Your camera", to: `${app.developer} servers`, risk: "high" }),
        hasMic && /* @__PURE__ */ jsxRuntimeExports.jsx(DataFlow, { from: "Your microphone", to: `${app.developer} servers`, risk: "high" }),
        hasLocation && /* @__PURE__ */ jsxRuntimeExports.jsx(DataFlow, { from: "Your GPS location", to: `${app.developer} + ad networks`, risk: "high" }),
        hasContacts && /* @__PURE__ */ jsxRuntimeExports.jsx(DataFlow, { from: "Your contact list", to: `${app.developer} servers`, risk: "high" }),
        hasSms && /* @__PURE__ */ jsxRuntimeExports.jsx(DataFlow, { from: "Your SMS messages", to: `${app.developer} servers`, risk: "critical" }),
        hasStorage && /* @__PURE__ */ jsxRuntimeExports.jsx(DataFlow, { from: "Your files & photos", to: `${app.name} local storage`, risk: "medium" }),
        !hasCamera && !hasMic && !hasLocation && !hasContacts && !hasSms && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "No sensitive data flows detected." })
      ] })
    ] })
  ] });
}
function DataFlow({
  from,
  to,
  risk
}) {
  const color = risk === "critical" || risk === "high" ? "text-destructive" : risk === "medium" ? "text-warning" : "text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: from }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${color} font-bold`, children: "→" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: to }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-auto text-[10px] uppercase tracking-wider ${color} font-medium`, children: risk })
  ] });
}
function SummaryCard({
  label,
  value,
  color
}) {
  const colors = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
    muted: "text-muted-foreground bg-muted/30"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold tabular-nums mb-1 ${colors[color]?.split(" ")[0] ?? "text-foreground"}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label })
  ] });
}
function InfoRow({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "uppercase tracking-wider text-[10px] text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs truncate", children: value })
    ] })
  ] });
}
function groupPermissions(permissions) {
  const groups = {};
  const sorted = [...permissions].sort((a, b) => {
    if (a.granted !== b.granted) return a.granted ? -1 : 1;
    const order = {
      high: 0,
      medium: 1,
      low: 2
    };
    return order[a.risk] - order[b.risk];
  });
  for (const perm of sorted) {
    const meta = getPermMeta(perm.name);
    if (!groups[meta.group]) groups[meta.group] = [];
    groups[meta.group].push(perm);
  }
  return groups;
}
function detectPurposeMismatch(app) {
  const cat = app.category.toLowerCase();
  const granted = app.permissions.filter((p) => p.granted).map((p) => p.name.toLowerCase());
  const hasSms = granted.some((p) => p.includes("sms"));
  const hasContacts = granted.some((p) => p.includes("contact"));
  const hasCamera = granted.some((p) => p.includes("camera"));
  const hasMic = granted.some((p) => p.includes("microphone"));
  const isUtility = cat.includes("tool") || cat.includes("util") || cat.includes("calculator");
  const isGame = cat.includes("game");
  const isFinance = cat.includes("finance") || cat.includes("bank");
  if (isUtility && (hasSms || hasContacts || hasCamera)) {
    const suspicious = [hasSms && "SMS", hasContacts && "Contacts", hasCamera && "Camera"].filter(Boolean).join(", ");
    return `This ${app.category} app requests ${suspicious} — permissions unrelated to its purpose. This strongly suggests data collection for advertising or tracking.`;
  }
  if (isGame && (hasSms || hasContacts)) {
    const suspicious = [hasSms && "SMS", hasContacts && "Contacts"].filter(Boolean).join(" and ");
    return `This game requests ${suspicious} access — highly unusual for a game. This is a red flag for data harvesting or ad targeting.`;
  }
  if (isFinance && hasMic) {
    return `This finance app requests microphone access. Unless it explicitly supports voice commands, this is unusual and worth investigating.`;
  }
  return null;
}
export {
  AppDetail as component
};
