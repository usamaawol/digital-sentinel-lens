
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, Building2, Tag, Package, Calendar, ScanLine, Loader2,
  ShieldAlert, ShieldCheck, Lightbulb, AlertTriangle, Camera, Mic,
  MapPin, Users, HardDrive, Bell, Phone, MessageSquare, Bluetooth,
  Globe, Eye, Lock, Unlock, ChevronDown, ChevronUp, Sparkles,
  Activity, Info as InfoIcon, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { scanApp } from "@/lib/scan-engine";
import { ScoreRing } from "@/components/score-ring";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { aiService } from "@/lib/ai/ai.service";
import type { AppRecord, PermissionInfo } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/apps/$appId")({
  head: () => ({ meta: [{ title: "App details — Privacy Guard AI" }] }),
  component: AppDetail,
});

// ── Permission metadata ───────────────────────────────────────────────────────

interface PermissionMeta {
  icon: React.ElementType;
  group: string;
  what: string;       // What the app can do with this permission
  when: string;       // When it typically activates
  dataAccessed: string[]; // Specific data it can access
  canBeRevoked: boolean;
  revokeInstructions: string;
}

const PERMISSION_META: Record<string, PermissionMeta> = {
  Camera: {
    icon: Camera,
    group: "Hardware",
    what: "Take photos and record videos using your device camera",
    when: "When you open the camera in the app, or potentially in the background",
    dataAccessed: ["Photos you take", "Video recordings", "Live camera feed"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Camera → Deny",
  },
  Microphone: {
    icon: Mic,
    group: "Hardware",
    what: "Record audio using your device microphone",
    when: "During voice calls, voice messages, or potentially in the background",
    dataAccessed: ["Voice recordings", "Ambient audio", "Voice commands"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Microphone → Deny",
  },
  Location: {
    icon: MapPin,
    group: "Location",
    what: "Access your precise GPS location or approximate network location",
    when: "When using location features, or always if background location is granted",
    dataAccessed: ["GPS coordinates", "Location history", "Nearby places"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Location → Deny or 'While in use'",
  },
  Contacts: {
    icon: Users,
    group: "Personal Data",
    what: "Read your full contact list including names, phone numbers, and emails",
    when: "When the app syncs contacts or suggests friends — often uploaded to servers",
    dataAccessed: ["Contact names", "Phone numbers", "Email addresses", "Profile photos"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Contacts → Deny",
  },
  Storage: {
    icon: HardDrive,
    group: "Storage",
    what: "Read and write files on your device storage",
    when: "When saving or loading files, photos, or app data",
    dataAccessed: ["Photos and videos", "Documents", "Downloaded files", "App data"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Storage → Deny",
  },
  Notifications: {
    icon: Bell,
    group: "System",
    what: "Send push notifications to your device",
    when: "Any time the app wants to alert you — including promotional messages",
    dataAccessed: ["Notification content visible on lock screen"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Notifications → Turn off",
  },
  Phone: {
    icon: Phone,
    group: "Communication",
    what: "Access phone state, call logs, and potentially make calls",
    when: "When the app reads your phone number or call history",
    dataAccessed: ["Phone number", "IMEI device ID", "Call history", "Network info"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Phone → Deny",
  },
  SMS: {
    icon: MessageSquare,
    group: "Communication",
    what: "Read, send, or intercept your text messages",
    when: "When reading OTP codes or sending messages on your behalf",
    dataAccessed: ["All SMS messages", "OTP codes", "Private conversations"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → SMS → Deny",
  },
  Bluetooth: {
    icon: Bluetooth,
    group: "Hardware",
    what: "Scan for and connect to nearby Bluetooth devices",
    when: "When connecting to speakers, headphones, or other devices",
    dataAccessed: ["Nearby device names", "Bluetooth MAC addresses"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions → Nearby devices → Deny",
  },
  "Internet Access": {
    icon: Globe,
    group: "Network",
    what: "Send and receive data over the internet",
    when: "Constantly — any time the app is running",
    dataAccessed: ["All data the app sends to its servers", "Your IP address"],
    canBeRevoked: false,
    revokeInstructions: "Cannot be revoked — use a firewall app to block network access",
  },
};

function getPermMeta(name: string): PermissionMeta {
  return PERMISSION_META[name] ?? {
    icon: Eye,
    group: "Other",
    what: `Access ${name.toLowerCase()} on your device`,
    when: "When the app uses this feature",
    dataAccessed: ["Data related to this permission"],
    canBeRevoked: true,
    revokeInstructions: "Settings → Apps → [App] → Permissions",
  };
}

// ── Main component ────────────────────────────────────────────────────────────

function AppDetail() {
  const { appId } = useParams({ from: "/_authenticated/apps/$appId" });
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [expandedPerm, setExpandedPerm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"permissions" | "behavior" | "ai">("permissions");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const { data: app, isLoading } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => firestoreService.getApp(appId),
  });

  const handleScan = async () => {
    if (!app) return;
    setScanning(true);
    try {
      await scanApp(app);
      await queryClient.invalidateQueries({ queryKey: ["app", appId] });
      await queryClient.invalidateQueries({ queryKey: ["apps"] });
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });
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
      const permSummary = app.permissions
        .filter((p) => p.granted)
        .map((p) => `${p.name} (${p.risk} risk)`)
        .join(", ");
      const reply = await aiService.chat([
        {
          role: "user",
          content: `Analyse this Android app for privacy risks:\n\nApp: ${app.name}\nCategory: ${app.category}\nDeveloper: ${app.developer}\nPrivacy Score: ${app.privacyScore}/100\nGranted Permissions: ${permSummary}\n\nProvide:\n1. What this app is likely doing with these permissions\n2. The biggest privacy risks\n3. Specific recommendations for the user\n\nBe specific and practical. Use plain language.`,
        },
      ]);
      setAiAnalysis(reply);
    } catch {
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl p-6 h-40 animate-pulse" />
        <div className="glass rounded-2xl p-6 h-64 animate-pulse" />
        <div className="glass rounded-2xl p-6 h-48 animate-pulse" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-sm font-medium">App not found.</p>
        <Link to="/apps">
          <Button variant="outline" size="sm" className="mt-4">Back to apps</Button>
        </Link>
      </div>
    );
  }

  const grantedPerms = app.permissions.filter((p) => p.granted);
  const deniedPerms = app.permissions.filter((p) => !p.granted);
  const highRiskGranted = grantedPerms.filter((p) => p.risk === "high");
  const mediumRiskGranted = grantedPerms.filter((p) => p.risk === "medium");
  const purposeMismatch = detectPurposeMismatch(app);

  // Group permissions by category
  const permGroups = groupPermissions(app.permissions);

  return (
    <div className="space-y-5">
      <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to apps
      </Link>

      {/* ── App Header ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="flex flex-wrap items-start gap-6">
          <div className="h-20 w-20 rounded-2xl bg-muted grid place-items-center text-4xl shrink-0">
            {app.icon}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{app.name}</h1>
              <RiskBadge risk={app.riskLevel} />
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <InfoRow icon={Building2} label="Developer" value={app.developer} />
              <InfoRow icon={Tag} label="Category" value={app.category} />
              <InfoRow icon={Package} label="Version" value={app.version} />
              <InfoRow icon={Calendar} label="Last scan" value={format(new Date(app.lastScan), "PP")} />
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={handleScan} disabled={scanning}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                {scanning ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Scanning…</> : <><ScanLine className="h-3.5 w-3.5 mr-1.5" />Scan Now</>}
              </Button>
              <Button size="sm" variant="outline" onClick={handleAiAnalysis} disabled={loadingAi}>
                {loadingAi ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Analysing…</> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />AI Analysis</>}
              </Button>
            </div>
          </div>
          <ScoreRing score={app.privacyScore} size={110} label="Score" />
        </div>
      </div>

      {/* ── Purpose mismatch alert ──────────────────────────────────────────── */}
      {purposeMismatch && (
        <div className="glass rounded-2xl p-4 shadow-card border border-destructive/40 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-destructive">⚠️ Suspicious Permission Pattern</div>
              <p className="text-sm text-muted-foreground mt-1">{purposeMismatch}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Permission summary cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total permissions" value={app.permissions.length} color="primary" />
        <SummaryCard label="Granted" value={grantedPerms.length} color="success" />
        <SummaryCard label="High risk active" value={highRiskGranted.length}
          color={highRiskGranted.length > 0 ? "destructive" : "muted"} />
        <SummaryCard label="Denied / Not granted" value={deniedPerms.length} color="muted" />
      </div>

      {/* ── What this app can access RIGHT NOW ─────────────────────────────── */}
      <div className="glass rounded-2xl p-5 shadow-card">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          What {app.name} can access right now
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          These permissions are currently granted — the app can use them at any time.
        </p>
        {grantedPerms.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No permissions currently granted.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {grantedPerms.map((p) => {
              const meta = getPermMeta(p.name);
              const Icon = meta.icon;
              const riskColor = p.risk === "high" ? "text-destructive bg-destructive/10 border-destructive/30"
                : p.risk === "medium" ? "text-warning bg-warning/10 border-warning/30"
                : "text-success bg-success/10 border-success/30";
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    setExpandedPerm(expandedPerm === p.name ? null : p.name);
                    setActiveTab("permissions");
                  }}
                  className={`rounded-xl border p-3 text-left transition-all hover:shadow-md ${riskColor} ${expandedPerm === p.name ? "ring-2 ring-current/30" : ""}`}
                >
                  <Icon className="h-5 w-5 mb-2" />
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5 opacity-70">
                    {p.risk} risk
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl shadow-card overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border/60">
          {(["permissions", "behavior", "ai"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "permissions" ? "All Permissions" : tab === "behavior" ? "Behavior Analysis" : "AI Analysis"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── PERMISSIONS TAB ──────────────────────────────────────────── */}
          {activeTab === "permissions" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">
                Click any permission to see exactly what data it accesses and how to revoke it.
              </p>
              {Object.entries(permGroups).map(([group, perms]) => (
                <div key={group}>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 px-1">
                    {group}
                  </div>
                  <div className="space-y-2">
                    {perms.map((p) => (
                      <PermissionCard
                        key={p.name}
                        perm={p}
                        appName={app.name}
                        expanded={expandedPerm === p.name}
                        onToggle={() => setExpandedPerm(expandedPerm === p.name ? null : p.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── BEHAVIOR TAB ─────────────────────────────────────────────── */}
          {activeTab === "behavior" && (
            <BehaviorAnalysis app={app} />
          )}

          {/* ── AI TAB ───────────────────────────────────────────────────── */}
          {activeTab === "ai" && (
            <div>
              {loadingAi ? (
                <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">AI is analysing {app.name}…</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">AI Privacy Analysis</div>
                      <div className="text-xs text-muted-foreground">Powered by OpenRouter</div>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {aiAnalysis}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-accent opacity-50" />
                  <p className="text-sm font-medium">Get AI-powered analysis</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Ask AI to explain exactly what {app.name} is doing with its permissions.
                  </p>
                  <Button onClick={handleAiAnalysis} disabled={loadingAi}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Analyse with AI
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Permission Card ───────────────────────────────────────────────────────────

function PermissionCard({
  perm,
  appName,
  expanded,
  onToggle,
}: {
  perm: PermissionInfo;
  appName: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = getPermMeta(perm.name);
  const Icon = meta.icon;

  const borderColor = !perm.granted
    ? "border-border/40 bg-muted/10"
    : perm.risk === "high"
    ? "border-destructive/40 bg-destructive/5"
    : perm.risk === "medium"
    ? "border-warning/30 bg-warning/5"
    : "border-success/20 bg-success/5";

  const iconColor = !perm.granted
    ? "text-muted-foreground"
    : perm.risk === "high"
    ? "text-destructive"
    : perm.risk === "medium"
    ? "text-warning"
    : "text-success";

  return (
    <div className={`rounded-xl border transition-all ${borderColor}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`h-9 w-9 rounded-lg bg-current/10 grid place-items-center shrink-0 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{perm.name}</span>
            <RiskBadge risk={perm.risk} />
            {perm.granted ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                <CheckCircle2 className="h-3 w-3" /> Granted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <XCircle className="h-3 w-3" /> Not granted
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{perm.explanation}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
          {/* What it does */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              What {appName} can do
            </div>
            <p className="text-sm">{meta.what}</p>
          </div>

          {/* When it activates */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> When it activates
            </div>
            <p className="text-sm text-muted-foreground">{meta.when}</p>
          </div>

          {/* Data accessed */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <Eye className="h-3 w-3" /> Data it can access
            </div>
            <ul className="space-y-1">
              {meta.dataAccessed.map((d) => (
                <li key={d} className="text-sm flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* How to revoke */}
          <div className={`rounded-lg p-3 ${perm.granted ? "bg-primary/8 border border-primary/20" : "bg-muted/30"}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              {perm.granted ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {perm.granted ? "How to revoke" : "How to grant"}
            </div>
            <p className="text-xs text-muted-foreground font-mono">{meta.revokeInstructions}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Behavior Analysis ─────────────────────────────────────────────────────────

function BehaviorAnalysis({ app }: { app: AppRecord }) {
  const grantedPerms = app.permissions.filter((p) => p.granted);

  const hasCamera = grantedPerms.some((p) => p.name === "Camera");
  const hasMic = grantedPerms.some((p) => p.name === "Microphone");
  const hasLocation = grantedPerms.some((p) => p.name === "Location");
  const hasContacts = grantedPerms.some((p) => p.name === "Contacts");
  const hasStorage = grantedPerms.some((p) => p.name === "Storage");
  const hasSms = grantedPerms.some((p) => p.name === "SMS");
  const hasPhone = grantedPerms.some((p) => p.name === "Phone");
  const hasNotifs = grantedPerms.some((p) => p.name === "Notifications");

  const behaviors: Array<{
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low" | "safe";
    active: boolean;
    icon: React.ElementType;
  }> = [
    {
      title: "Can photograph you or your surroundings",
      description: "Camera access allows the app to take photos and record video. Some apps access the camera in the background.",
      severity: "high",
      active: hasCamera,
      icon: Camera,
    },
    {
      title: "Can listen through your microphone",
      description: "Microphone access allows the app to record audio. This includes ambient sounds when the app is in the background.",
      severity: "high",
      active: hasMic,
      icon: Mic,
    },
    {
      title: "Can track your physical location",
      description: "Location access lets the app know where you are. This data is often used for ad targeting and profiling.",
      severity: "high",
      active: hasLocation,
      icon: MapPin,
    },
    {
      title: "Can read your contact list",
      description: "Contact access gives the app your full address book. Most apps upload this to their servers for 'friend suggestions'.",
      severity: "high",
      active: hasContacts,
      icon: Users,
    },
    {
      title: "Can read your SMS messages",
      description: "SMS access is extremely sensitive — the app can read all your text messages including OTP codes and private conversations.",
      severity: "critical",
      active: hasSms,
      icon: MessageSquare,
    },
    {
      title: "Can access your phone identity",
      description: "Phone access reveals your phone number, IMEI, and call history. Used for device fingerprinting and ad tracking.",
      severity: "high",
      active: hasPhone,
      icon: Phone,
    },
    {
      title: "Can read and write your files",
      description: "Storage access lets the app read your photos, documents, and downloads. It can also create and delete files.",
      severity: "medium",
      active: hasStorage,
      icon: HardDrive,
    },
    {
      title: "Can send you notifications",
      description: "The app can send push notifications at any time, including promotional and advertising messages.",
      severity: "low",
      active: hasNotifs,
      icon: Bell,
    },
  ];

  const activeBehaviors = behaviors.filter((b) => b.active);
  const inactiveBehaviors = behaviors.filter((b) => !b.active);

  const severityColor = {
    critical: "border-destructive/60 bg-destructive/8 text-destructive",
    high: "border-destructive/30 bg-destructive/5 text-destructive",
    medium: "border-warning/30 bg-warning/5 text-warning",
    low: "border-border/60 bg-muted/20 text-muted-foreground",
    safe: "border-success/30 bg-success/5 text-success",
  };

  const severityLabel = {
    critical: "Critical",
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
    safe: "Safe",
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-sm mb-1">Active capabilities</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Based on granted permissions, {app.name} can currently do the following:
        </p>
        {activeBehaviors.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 glass rounded-xl">
            No sensitive capabilities are currently active.
          </div>
        ) : (
          <div className="space-y-2">
            {activeBehaviors.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className={`rounded-xl border p-4 ${severityColor[b.severity]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{b.title}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-medium ${severityColor[b.severity]}`}>
                          {severityLabel[b.severity]}
                        </span>
                      </div>
                      <p className="text-xs mt-1 opacity-80">{b.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {inactiveBehaviors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-1 text-muted-foreground">Not granted</h3>
          <p className="text-xs text-muted-foreground mb-3">
            These capabilities are NOT currently active for {app.name}:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {inactiveBehaviors.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-xl border border-border/40 bg-muted/10 p-3 flex items-center gap-2 opacity-60">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground line-clamp-1">{b.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data flow summary */}
      <div className="glass rounded-xl p-4 border border-primary/20">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
          <Activity className="h-3 w-3" /> Data flow summary
        </div>
        <div className="space-y-2 text-sm">
          {hasCamera && <DataFlow from="Your camera" to={`${app.developer} servers`} risk="high" />}
          {hasMic && <DataFlow from="Your microphone" to={`${app.developer} servers`} risk="high" />}
          {hasLocation && <DataFlow from="Your GPS location" to={`${app.developer} + ad networks`} risk="high" />}
          {hasContacts && <DataFlow from="Your contact list" to={`${app.developer} servers`} risk="high" />}
          {hasSms && <DataFlow from="Your SMS messages" to={`${app.developer} servers`} risk="critical" />}
          {hasStorage && <DataFlow from="Your files & photos" to={`${app.name} local storage`} risk="medium" />}
          {!hasCamera && !hasMic && !hasLocation && !hasContacts && !hasSms && (
            <p className="text-muted-foreground text-xs">No sensitive data flows detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DataFlow({ from, to, risk }: { from: string; to: string; risk: "critical" | "high" | "medium" | "low" }) {
  const color = risk === "critical" || risk === "high" ? "text-destructive" : risk === "medium" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-medium">{from}</span>
      <span className={`${color} font-bold`}>→</span>
      <span className="text-muted-foreground">{to}</span>
      <span className={`ml-auto text-[10px] uppercase tracking-wider ${color} font-medium`}>{risk}</span>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
    muted: "text-muted-foreground bg-muted/30",
  };
  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <div className={`text-2xl font-bold tabular-nums mb-1 ${colors[color]?.split(" ")[0] ?? "text-foreground"}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="uppercase tracking-wider text-[10px] text-muted-foreground">{label}</div>
        <div className="text-xs truncate">{value}</div>
      </div>
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function groupPermissions(permissions: PermissionInfo[]): Record<string, PermissionInfo[]> {
  const groups: Record<string, PermissionInfo[]> = {};
  // Granted first, then denied
  const sorted = [...permissions].sort((a, b) => {
    if (a.granted !== b.granted) return a.granted ? -1 : 1;
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });
  for (const perm of sorted) {
    const meta = getPermMeta(perm.name);
    if (!groups[meta.group]) groups[meta.group] = [];
    groups[meta.group].push(perm);
  }
  return groups;
}

function detectPurposeMismatch(app: { category: string; permissions: Array<{ name: string; granted: boolean; risk: string }> }): string | null {
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
