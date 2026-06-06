import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useAuth, e as firestoreService } from "./router-x6rZinQA.mjs";
import { a as aiService } from "./ai.service-DoSfZ9ki.mjs";
import { S as ScoreRing, s as scanAllApps, A as APP_CATALOG } from "./score-ring-sq4HaJE7.mjs";
import { B as Button, c as cn } from "./button-DjOZMqFS.mjs";
import { R as RiskBadge } from "./risk-badge-5VLUO8Nt.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/firebase__auth.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/seroval.mjs";
import { r as LoaderCircle, S as ScanLine, R as RefreshCw, Y as Smartphone, V as ShieldCheck, U as ShieldAlert, X as ShieldX, a3 as TrendingUp, Z as Sparkles, M as MapPin, h as Camera, w as Mic, a6 as Users, H as HardDrive, c as ArrowRight } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, a as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, A as Area, c as PieChart, P as Pie, b as Cell } from "../_libs/recharts.mjs";
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
import "./server-BQeBvh7z.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const tones = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  muted: "text-muted-foreground bg-muted/40"
};
function StatCard({ icon: Icon, label, value, hint, tone = "primary" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card hover:shadow-glow transition-shadow", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-9 w-9 rounded-xl grid place-items-center", tones[tone]), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-bold tabular-nums", children: value }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: hint })
  ] });
}
function Dashboard() {
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();
  const [scanning, setScanning] = reactExports.useState(false);
  const [scanProgress, setScanProgress] = reactExports.useState(0);
  const {
    data: apps = []
  } = useQuery({
    queryKey: ["apps"],
    queryFn: () => firestoreService.listApps()
  });
  const {
    data: report
  } = useQuery({
    queryKey: ["weekly-report"],
    queryFn: () => firestoreService.getWeeklyReport()
  });
  const {
    data: insights = []
  } = useQuery({
    queryKey: ["insights", apps.length],
    queryFn: () => {
      if (apps.length === 0) return aiService.generateInsights();
      const summary = apps.slice(0, 15).map((a) => `${a.name} (${a.category}): score ${a.privacyScore}/100, risk ${a.riskLevel}`).join("\n");
      return aiService.generateInsights(summary);
    },
    staleTime: 10 * 60 * 1e3,
    enabled: true
  });
  const {
    data: notifs = []
  } = useQuery({
    queryKey: ["notifs"],
    queryFn: () => firestoreService.listNotifications(),
    refetchInterval: 3e4
  });
  const unreadCount = notifs.filter((n) => !n.read).length;
  const counts = {
    total: apps.length,
    safe: apps.filter((a) => a.riskLevel === "safe" || a.riskLevel === "low").length,
    medium: apps.filter((a) => a.riskLevel === "medium").length,
    high: apps.filter((a) => a.riskLevel === "high").length
  };
  const overallScore = apps.length === 0 ? 0 : Math.round(apps.reduce((s, a) => s + a.privacyScore, 0) / apps.length);
  const chartData = report?.days.map((d, i) => ({
    day: d,
    Location: report.locationUsage[i],
    Camera: report.cameraUsage[i],
    Microphone: report.microphoneUsage[i]
  })) ?? [];
  const pieData = [{
    name: "Safe",
    value: counts.safe,
    color: "var(--color-success)"
  }, {
    name: "Medium",
    value: counts.medium,
    color: "var(--color-warning)"
  }, {
    name: "High",
    value: counts.high,
    color: "var(--color-destructive)"
  }];
  const handleScanAll = async () => {
    setScanning(true);
    setScanProgress(0);
    toast.info("Starting full device scan…");
    try {
      await scanAllApps(APP_CATALOG, (done, total) => {
        setScanProgress(Math.round(done / total * 100));
      });
      await queryClient.invalidateQueries({
        queryKey: ["apps"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifs"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["weekly-report"]
      });
      toast.success("Scan complete! Dashboard updated.");
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: [
          "Welcome back, ",
          user?.displayName?.split(" ")[0] || "there"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Here's the privacy posture of your device today." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[9px] text-white grid place-items-center font-bold", children: unreadCount }),
          "Alerts"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: handleScanAll, disabled: scanning, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
          " ",
          scanProgress,
          "%"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Scan Now"
        ] }) })
      ] })
    ] }),
    scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }),
          "Scanning all apps…"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
          scanProgress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-primary rounded-full transition-all duration-300", style: {
        width: `${scanProgress}%`
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr_2fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6 shadow-card flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score: overallScore, size: 150, label: "Privacy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Overall" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold mt-1", children: "Your privacy score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1.5 max-w-xs", children: [
            "Based on ",
            counts.total,
            " installed apps and their permission profiles."
          ] }),
          counts.total === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleScanAll, disabled: scanning, className: "mt-3 bg-gradient-primary text-primary-foreground hover:opacity-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Run First Scan"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Smartphone, label: "Total apps", value: counts.total, tone: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ShieldCheck, label: "Safe", value: counts.safe, tone: "success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ShieldAlert, label: "Medium risk", value: counts.medium, tone: "warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ShieldX, label: "High risk", value: counts.high, tone: "destructive" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Weekly permission usage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Times apps accessed sensitive permissions" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-accent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: chartData, margin: {
          top: 10,
          right: 10,
          left: -20,
          bottom: 0
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "g1", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--color-primary)", stopOpacity: 0.5 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--color-primary)", stopOpacity: 0 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "g2", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--color-accent)", stopOpacity: 0.5 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--color-accent)", stopOpacity: 0 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "g3", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--color-warning)", stopOpacity: 0.5 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--color-warning)", stopOpacity: 0 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "Location", stroke: "var(--color-primary)", fill: "url(#g1)", strokeWidth: 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "Camera", stroke: "var(--color-accent)", fill: "url(#g2)", strokeWidth: 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "Microphone", stroke: "var(--color-warning)", fill: "url(#g3)", strokeWidth: 2 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-1", children: "Risk distribution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "All scanned apps" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[220px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: pieData, dataKey: "value", innerRadius: 55, outerRadius: 85, paddingAngle: 3, children: pieData.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: d.color }, d.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8
          } })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 mt-2 text-xs", children: pieData.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
              background: d.color
            } }),
            d.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-muted-foreground", children: d.value })
        ] }, d.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "AI insights" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Generated from your latest scan" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5", children: insights.map((i, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm flex gap-2.5 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: i })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3", children: "This week's sensitive access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [{
          icon: MapPin,
          label: "Location",
          value: sum(report?.locationUsage),
          tone: "text-primary"
        }, {
          icon: Camera,
          label: "Camera",
          value: sum(report?.cameraUsage),
          tone: "text-accent"
        }, {
          icon: Mic,
          label: "Microphone",
          value: sum(report?.microphoneUsage),
          tone: "text-warning"
        }, {
          icon: Users,
          label: "Contacts",
          value: sum(report?.contactsUsage),
          tone: "text-primary"
        }, {
          icon: HardDrive,
          label: "Storage",
          value: sum(report?.storageUsage),
          tone: "text-muted-foreground"
        }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: `h-4 w-4 ${s.tone}` }),
            s.label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums font-medium", children: s.value })
        ] }, s.label)) })
      ] })
    ] }),
    notifs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Recent alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Latest privacy events" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/notifications", className: "text-xs text-primary hover:underline inline-flex items-center gap-1", children: [
          "View all ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: notifs.slice(0, 3).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 rounded-lg p-3 ${!n.read ? "bg-primary/5" : "bg-muted/20"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.type === "high-risk" ? "bg-destructive" : n.type === "new-app" ? "bg-primary" : n.type === "score-change" ? "bg-success" : "bg-accent"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: n.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: n.message })
        ] }),
        !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0 mt-1.5" })
      ] }, n.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Apps needing attention" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Highest risk first" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apps", className: "text-xs text-primary hover:underline inline-flex items-center gap-1", children: [
          "View all ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
        ] })
      ] }),
      apps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No apps scanned yet." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleScanAll, disabled: scanning, className: "mt-3 bg-gradient-primary text-primary-foreground hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Scan All Apps"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: [...apps].sort((a, b) => a.privacyScore - b.privacyScore).slice(0, 4).map((app) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apps/$appId", params: {
        appId: app.id
      }, className: "flex items-center justify-between rounded-lg p-3 hover:bg-muted/40 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-muted grid place-items-center text-xl", children: app.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: app.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: app.category })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { risk: app.riskLevel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm tabular-nums w-8 text-right", children: app.privacyScore })
        ] })
      ] }, app.id)) })
    ] })
  ] });
}
function sum(arr) {
  return arr ? arr.reduce((a, b) => a + b, 0) : 0;
}
export {
  Dashboard as component
};
