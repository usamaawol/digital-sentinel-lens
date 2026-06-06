import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as showLocalNotification, e as firestoreService } from "./router-x6rZinQA.mjs";
import { d as detectInstalledApps, A as APP_CATALOG, g as groupByCategory, S as ScoreRing, s as scanAllApps, a as scanApp } from "./score-ring-sq4HaJE7.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { R as RiskBadge } from "./risk-badge-5VLUO8Nt.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/firebase__auth.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__firestore.mjs";
import { Y as Smartphone, r as LoaderCircle, R as RefreshCw, V as ShieldCheck, J as Search, i as CheckCheck, a8 as X, S as ScanLine, $ as SquareCheckBig, _ as Square, k as ChevronUp, j as ChevronDown } from "../_libs/lucide-react.mjs";
import { a as formatDistanceToNow } from "../_libs/date-fns.mjs";
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
function AppsPage() {
  const queryClient = useQueryClient();
  const {
    data: scannedApps = [],
    isLoading
  } = useQuery({
    queryKey: ["apps"],
    queryFn: () => firestoreService.listApps()
  });
  const [view, setView] = reactExports.useState("scanned");
  const [q, setQ] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const [scanning, setScanning] = reactExports.useState(false);
  const [scanProgress, setScanProgress] = reactExports.useState(0);
  const [scanningOne, setScanningOne] = reactExports.useState(null);
  const [detectedPackages, setDetectedPackages] = reactExports.useState([]);
  const [expandedCategories, setExpandedCategories] = reactExports.useState(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    detectInstalledApps().then((ids) => {
      if (ids.length > 0) setDetectedPackages(ids);
    });
  }, []);
  const scannedPackages = new Set(scannedApps.map((a) => a.packageName));
  const availableApps = APP_CATALOG.filter((a) => !scannedPackages.has(a.packageName));
  const grouped = groupByCategory(availableApps);
  const categories = Object.keys(grouped).sort();
  const filtered = reactExports.useMemo(() => {
    return scannedApps.filter((a) => {
      if (filter === "safe") return a.riskLevel === "safe" || a.riskLevel === "low";
      if (filter === "medium") return a.riskLevel === "medium";
      if (filter === "high") return a.riskLevel === "high";
      return true;
    }).filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  }, [scannedApps, q, filter]);
  const toggleSelect = (packageName) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(packageName) ? next.delete(packageName) : next.add(packageName);
      return next;
    });
  };
  const selectAllVisible = () => {
    const visiblePkgs = availableApps.filter((a) => q === "" || a.name.toLowerCase().includes(q.toLowerCase())).map((a) => a.packageName);
    setSelected(new Set(visiblePkgs));
  };
  const clearSelection = () => setSelected(/* @__PURE__ */ new Set());
  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };
  const selectCategory = (cat) => {
    const pkgs = (grouped[cat] || []).map((a) => a.packageName);
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pkgs.every((p) => next.has(p));
      pkgs.forEach((p) => allSelected ? next.delete(p) : next.add(p));
      return next;
    });
  };
  const scanSelected = async () => {
    const toScan = APP_CATALOG.filter((a) => selected.has(a.packageName));
    if (toScan.length === 0) return;
    setScanning(true);
    setScanProgress(0);
    toast.info(`Scanning ${toScan.length} app${toScan.length > 1 ? "s" : ""}…`);
    try {
      await scanAllApps(toScan, (done, total) => {
        setScanProgress(Math.round(done / total * 100));
      });
      await queryClient.invalidateQueries({
        queryKey: ["apps"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifs"]
      });
      await showLocalNotification({
        title: "Scan Complete",
        body: `${toScan.length} app${toScan.length > 1 ? "s" : ""} scanned. Check your results.`,
        type: "general",
        url: "/apps"
      });
      toast.success(`${toScan.length} app${toScan.length > 1 ? "s" : ""} scanned successfully.`);
      clearSelection();
      setView("scanned");
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };
  const handleScanAll = async () => {
    setScanning(true);
    setScanProgress(0);
    toast.info(`Scanning all ${APP_CATALOG.length} apps…`);
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
      await showLocalNotification({
        title: "Full Scan Complete",
        body: `All ${APP_CATALOG.length} apps analysed. View your privacy report.`,
        type: "general",
        url: "/dashboard"
      });
      toast.success("Full scan complete! All apps analysed.");
      setView("scanned");
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  };
  const rescanOne = async (app, e) => {
    e.preventDefault();
    e.stopPropagation();
    setScanningOne(app.id);
    try {
      await scanApp(app);
      await queryClient.invalidateQueries({
        queryKey: ["apps"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifs"]
      });
      toast.success(`${app.name} rescanned.`);
    } catch {
      toast.error(`Failed to rescan ${app.name}.`);
    } finally {
      setScanningOne(null);
    }
  };
  const filters = [{
    id: "all",
    label: "All"
  }, {
    id: "safe",
    label: "Safe"
  }, {
    id: "medium",
    label: "Medium"
  }, {
    id: "high",
    label: "High"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Applications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: scannedApps.length > 0 ? `${scannedApps.length} apps scanned · select more to add` : "Select apps from your device to scan" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "select" ? "default" : "outline", onClick: () => setView(view === "select" ? "scanned" : "select"), className: view === "select" ? "bg-gradient-primary text-primary-foreground" : "", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3.5 w-3.5 mr-1.5" }),
          view === "select" ? "View Scanned" : "Select Apps"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: handleScanAll, disabled: scanning, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
          " ",
          scanProgress,
          "%"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Scan All"
        ] }) })
      ] })
    ] }),
    scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }),
          "Scanning apps…"
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
    view === "select" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      detectedPackages.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-xl p-4 border border-success/30 bg-success/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-success", children: [
          detectedPackages.length,
          " apps detected on your device"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "ml-auto text-xs h-7", onClick: () => {
          const detected = APP_CATALOG.filter((a) => detectedPackages.includes(a.packageName) && !scannedPackages.has(a.packageName));
          setSelected(new Set(detected.map((a) => a.packageName)));
        }, children: "Select detected apps" })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-xl p-4 border border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5 text-primary shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Select your installed apps" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: 'Browse by category and select the apps installed on your phone. Then tap "Scan Selected" to analyse them.' })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search apps…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: selectAllVisible, className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5 mr-1" }),
          " Select all"
        ] }),
        selected.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: clearSelection, className: "text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 mr-1" }),
            " Clear (",
            selected.size,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: scanSelected, disabled: scanning, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
            " Scanning…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Scan ",
            selected.size,
            " selected"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: categories.filter((cat) => {
        if (q === "") return true;
        return (grouped[cat] || []).some((a) => a.name.toLowerCase().includes(q.toLowerCase()));
      }).map((cat) => {
        const apps = (grouped[cat] || []).filter((a) => q === "" || a.name.toLowerCase().includes(q.toLowerCase()));
        const isExpanded = expandedCategories.has(cat) || q !== "";
        const catSelected = apps.filter((a) => selected.has(a.packageName)).length;
        const allCatSelected = catSelected === apps.length && apps.length > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl overflow-hidden shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors", onClick: () => toggleCategory(cat), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                selectCategory(cat);
              }, className: "shrink-0", children: allCatSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-4 w-4 text-primary" }) : catSelected > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded border-2 border-primary bg-primary/30 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-sm bg-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: cat }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                apps.length,
                " app",
                apps.length !== 1 ? "s" : "",
                catSelected > 0 && ` · ${catSelected} selected`
              ] })
            ] }),
            isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/40", children: apps.map((app) => {
            const isSelected = selected.has(app.packageName);
            const isDetected = detectedPackages.includes(app.packageName);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleSelect(app.packageName), className: `w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors text-left ${isSelected ? "bg-primary/8" : ""}`, children: [
              isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-4 w-4 text-primary shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-muted grid place-items-center text-xl shrink-0", children: app.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: app.name }),
                  isDetected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30", children: "On device" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: app.developer })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground shrink-0", children: [
                app.permissions.length,
                " permissions"
              ] })
            ] }, app.packageName);
          }) })
        ] }, cat);
      }) }),
      selected.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl px-6 py-3 shadow-glow flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
          selected.size,
          " app",
          selected.size !== 1 ? "s" : "",
          " selected"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: scanSelected, disabled: scanning, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: scanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }),
          " ",
          scanProgress,
          "%"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Scan Selected"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: clearSelection, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
      ] }) })
    ] }),
    view === "scanned" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[240px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search scanned apps…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: filters.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: filter === f.id ? "default" : "outline", size: "sm", onClick: () => setFilter(f.id), className: filter === f.id ? "bg-gradient-primary text-primary-foreground" : "", children: f.label }, f.id)) })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-5 h-32 animate-pulse" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-12 text-center shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: scannedApps.length === 0 ? "No apps scanned yet" : "No apps match your filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 mb-4", children: scannedApps.length === 0 ? "Select apps from your phone and scan them to see privacy scores." : "Try a different filter or search term." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setView("select"), className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Select Apps"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleScanAll, disabled: scanning, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Scan All"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map((app) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apps/$appId", params: {
        appId: app.id
      }, className: "glass rounded-2xl p-5 shadow-card hover:shadow-glow transition-all hover:-translate-y-0.5 block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-muted grid place-items-center text-2xl shrink-0", children: app.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: app.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: app.category })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score: app.privacyScore, size: 60, stroke: 6 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { risk: app.riskLevel }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatDistanceToNow(new Date(app.lastScan), {
              addSuffix: true
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => rescanOne(app, e), disabled: scanningOne === app.id, className: "text-primary hover:text-primary/80 transition-colors disabled:opacity-50", title: "Rescan", children: scanningOne === app.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "h-3.5 w-3.5" }) })
          ] })
        ] })
      ] }, app.id)) })
    ] })
  ] });
}
export {
  AppsPage as component
};
