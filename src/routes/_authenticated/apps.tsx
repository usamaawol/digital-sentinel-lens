import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ScanLine,
  CheckSquare,
  Square,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronUp,
  X,
  CheckCheck,
} from "lucide-react";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { scanApp, scanAllApps } from "@/lib/scan-engine";
import { APP_CATALOG, groupByCategory, detectInstalledApps } from "@/lib/device-apps";
import { showLocalNotification } from "@/lib/pwa";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/risk-badge";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { AppRecord } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/apps")({
  head: () => ({ meta: [{ title: "Applications — Privacy Guard AI" }] }),
  component: AppsPage,
});

type Filter = "all" | "safe" | "medium" | "high";
type View = "scanned" | "select";

function AppsPage() {
  const queryClient = useQueryClient();
  const { data: scannedApps = [], isLoading } = useQuery({
    queryKey: ["apps"],
    queryFn: () => firestoreService.listApps(),
  });

  const [view, setView] = useState<View>("scanned");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningOne, setScanningOne] = useState<string | null>(null);
  const [detectedPackages, setDetectedPackages] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Try to detect installed apps on mount
  useEffect(() => {
    detectInstalledApps().then((ids) => {
      if (ids.length > 0) setDetectedPackages(ids);
    });
  }, []);

  // Already-scanned package names
  const scannedPackages = new Set(scannedApps.map((a) => a.packageName));

  // Apps available to add (not yet scanned)
  const availableApps = APP_CATALOG.filter((a) => !scannedPackages.has(a.packageName));
  const grouped = groupByCategory(availableApps);
  const categories = Object.keys(grouped).sort();

  // ── Filtered scanned list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return scannedApps
      .filter((a) => {
        if (filter === "safe") return a.riskLevel === "safe" || a.riskLevel === "low";
        if (filter === "medium") return a.riskLevel === "medium";
        if (filter === "high") return a.riskLevel === "high";
        return true;
      })
      .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  }, [scannedApps, q, filter]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (packageName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(packageName) ? next.delete(packageName) : next.add(packageName);
      return next;
    });
  };

  const selectAllVisible = () => {
    const visiblePkgs = availableApps
      .filter((a) => q === "" || a.name.toLowerCase().includes(q.toLowerCase()))
      .map((a) => a.packageName);
    setSelected(new Set(visiblePkgs));
  };

  const clearSelection = () => setSelected(new Set());

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const selectCategory = (cat: string) => {
    const pkgs = (grouped[cat] || []).map((a) => a.packageName);
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pkgs.every((p) => next.has(p));
      pkgs.forEach((p) => (allSelected ? next.delete(p) : next.add(p)));
      return next;
    });
  };

  // ── Scan selected apps ─────────────────────────────────────────────────────
  const scanSelected = async () => {
    const toScan = APP_CATALOG.filter((a) => selected.has(a.packageName));
    if (toScan.length === 0) return;

    setScanning(true);
    setScanProgress(0);
    toast.info(`Scanning ${toScan.length} app${toScan.length > 1 ? "s" : ""}…`);

    try {
      await scanAllApps(toScan, (done, total) => {
        setScanProgress(Math.round((done / total) * 100));
      });
      await queryClient.invalidateQueries({ queryKey: ["apps"] });
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });

      // Show system notification
      await showLocalNotification({
        title: "Scan Complete",
        body: `${toScan.length} app${toScan.length > 1 ? "s" : ""} scanned. Check your results.`,
        type: "general",
        url: "/apps",
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

  // ── Scan ALL apps ──────────────────────────────────────────────────────────
  const handleScanAll = async () => {
    setScanning(true);
    setScanProgress(0);
    toast.info(`Scanning all ${APP_CATALOG.length} apps…`);

    try {
      await scanAllApps(APP_CATALOG, (done, total) => {
        setScanProgress(Math.round((done / total) * 100));
      });
      await queryClient.invalidateQueries({ queryKey: ["apps"] });
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });
      await queryClient.invalidateQueries({ queryKey: ["weekly-report"] });

      await showLocalNotification({
        title: "Full Scan Complete",
        body: `All ${APP_CATALOG.length} apps analysed. View your privacy report.`,
        type: "general",
        url: "/dashboard",
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

  // ── Rescan a single app ────────────────────────────────────────────────────
  const rescanOne = async (app: AppRecord, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScanningOne(app.id);
    try {
      await scanApp(app);
      await queryClient.invalidateQueries({ queryKey: ["apps"] });
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });
      toast.success(`${app.name} rescanned.`);
    } catch {
      toast.error(`Failed to rescan ${app.name}.`);
    } finally {
      setScanningOne(null);
    }
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "safe", label: "Safe" },
    { id: "medium", label: "Medium" },
    { id: "high", label: "High" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {scannedApps.length > 0
              ? `${scannedApps.length} apps scanned · select more to add`
              : "Select apps from your device to scan"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={view === "select" ? "default" : "outline"}
            onClick={() => setView(view === "select" ? "scanned" : "select")}
            className={view === "select" ? "bg-gradient-primary text-primary-foreground" : ""}
          >
            <Smartphone className="h-3.5 w-3.5 mr-1.5" />
            {view === "select" ? "View Scanned" : "Select Apps"}
          </Button>
          <Button
            size="sm"
            onClick={handleScanAll}
            disabled={scanning}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            {scanning ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> {scanProgress}%</>
            ) : (
              <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Scan All</>
            )}
          </Button>
        </div>
      </div>

      {/* Scan progress bar */}
      {scanning && (
        <div className="glass rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Scanning apps…
            </span>
            <span className="text-muted-foreground tabular-nums">{scanProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── SELECT APPS VIEW ─────────────────────────────────────────────── */}
      {view === "select" && (
        <div className="space-y-4">
          {/* Detection banner */}
          {detectedPackages.length > 0 ? (
            <div className="glass rounded-xl p-4 border border-success/30 bg-success/5">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span className="font-medium text-success">
                  {detectedPackages.length} apps detected on your device
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto text-xs h-7"
                  onClick={() => {
                    const detected = APP_CATALOG.filter((a) =>
                      detectedPackages.includes(a.packageName) && !scannedPackages.has(a.packageName)
                    );
                    setSelected(new Set(detected.map((a) => a.packageName)));
                  }}
                >
                  Select detected apps
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Select your installed apps</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Browse by category and select the apps installed on your phone. Then tap "Scan Selected" to analyse them.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search + action bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={selectAllVisible} className="text-xs text-muted-foreground">
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Select all
            </Button>
            {selected.size > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs text-muted-foreground">
                  <X className="h-3.5 w-3.5 mr-1" /> Clear ({selected.size})
                </Button>
                <Button
                  size="sm"
                  onClick={scanSelected}
                  disabled={scanning}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {scanning ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Scanning…</>
                  ) : (
                    <><ScanLine className="h-3.5 w-3.5 mr-1.5" /> Scan {selected.size} selected</>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Category groups */}
          <div className="space-y-3">
            {categories
              .filter((cat) => {
                if (q === "") return true;
                return (grouped[cat] || []).some((a) =>
                  a.name.toLowerCase().includes(q.toLowerCase())
                );
              })
              .map((cat) => {
                const apps = (grouped[cat] || []).filter(
                  (a) => q === "" || a.name.toLowerCase().includes(q.toLowerCase())
                );
                const isExpanded = expandedCategories.has(cat) || q !== "";
                const catSelected = apps.filter((a) => selected.has(a.packageName)).length;
                const allCatSelected = catSelected === apps.length && apps.length > 0;

                return (
                  <div key={cat} className="glass rounded-2xl overflow-hidden shadow-card">
                    {/* Category header */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors"
                      onClick={() => toggleCategory(cat)}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); selectCategory(cat); }}
                          className="shrink-0"
                        >
                          {allCatSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : catSelected > 0 ? (
                            <div className="h-4 w-4 rounded border-2 border-primary bg-primary/30 grid place-items-center">
                              <div className="h-1.5 w-1.5 rounded-sm bg-primary" />
                            </div>
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <span className="font-medium text-sm">{cat}</span>
                        <span className="text-xs text-muted-foreground">
                          {apps.length} app{apps.length !== 1 ? "s" : ""}
                          {catSelected > 0 && ` · ${catSelected} selected`}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* App list */}
                    {isExpanded && (
                      <div className="divide-y divide-border/40">
                        {apps.map((app) => {
                          const isSelected = selected.has(app.packageName);
                          const isDetected = detectedPackages.includes(app.packageName);
                          return (
                            <button
                              key={app.packageName}
                              onClick={() => toggleSelect(app.packageName)}
                              className={`w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors text-left ${
                                isSelected ? "bg-primary/8" : ""
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                              <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center text-xl shrink-0">
                                {app.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{app.name}</span>
                                  {isDetected && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                                      On device
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{app.developer}</div>
                              </div>
                              <div className="text-xs text-muted-foreground shrink-0">
                                {app.permissions.length} permissions
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Bottom action bar */}
          {selected.size > 0 && (
            <div className="sticky bottom-4 flex justify-center">
              <div className="glass-strong rounded-2xl px-6 py-3 shadow-glow flex items-center gap-4">
                <span className="text-sm font-medium">{selected.size} app{selected.size !== 1 ? "s" : ""} selected</span>
                <Button
                  size="sm"
                  onClick={scanSelected}
                  disabled={scanning}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {scanning ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> {scanProgress}%</>
                  ) : (
                    <><ScanLine className="h-3.5 w-3.5 mr-1.5" /> Scan Selected</>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SCANNED APPS VIEW ────────────────────────────────────────────── */}
      {view === "scanned" && (
        <>
          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scanned apps…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5">
              {filters.map((f) => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.id)}
                  className={filter === f.id ? "bg-gradient-primary text-primary-foreground" : ""}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* App grid */}
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center shadow-card">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="font-semibold">
                {scannedApps.length === 0 ? "No apps scanned yet" : "No apps match your filters"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {scannedApps.length === 0
                  ? "Select apps from your phone and scan them to see privacy scores."
                  : "Try a different filter or search term."}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => setView("select")}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  <Smartphone className="h-3.5 w-3.5 mr-1.5" /> Select Apps
                </Button>
                <Button size="sm" variant="outline" onClick={handleScanAll} disabled={scanning}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Scan All
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((app) => (
                <Link
                  key={app.id}
                  to="/apps/$appId"
                  params={{ appId: app.id }}
                  className="glass rounded-2xl p-5 shadow-card hover:shadow-glow transition-all hover:-translate-y-0.5 block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-muted grid place-items-center text-2xl shrink-0">
                        {app.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{app.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{app.category}</div>
                      </div>
                    </div>
                    <ScoreRing score={app.privacyScore} size={60} stroke={6} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <RiskBadge risk={app.riskLevel} />
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(app.lastScan), { addSuffix: true })}
                      </span>
                      <button
                        onClick={(e) => rescanOne(app, e)}
                        disabled={scanningOne === app.id}
                        className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                        title="Rescan"
                      >
                        {scanningOne === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ScanLine className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
