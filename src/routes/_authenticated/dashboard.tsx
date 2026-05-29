import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Smartphone,
  Sparkles,
  TrendingUp,
  Camera,
  Mic,
  MapPin,
  Users,
  HardDrive,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { aiService } from "@/lib/ai/ai.service";
import { StatCard } from "@/components/stat-card";
import { ScoreRing } from "@/components/score-ring";
import { RiskBadge } from "@/components/risk-badge";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Privacy Guard AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: apps = [] } = useQuery({
    queryKey: ["apps"],
    queryFn: () => firestoreService.listApps(),
  });
  const { data: report } = useQuery({
    queryKey: ["weekly-report"],
    queryFn: () => firestoreService.getWeeklyReport(),
  });
  const { data: insights = [] } = useQuery({
    queryKey: ["insights"],
    queryFn: () => aiService.generateInsights(),
  });

  const counts = {
    total: apps.length,
    safe: apps.filter((a) => a.riskLevel === "safe" || a.riskLevel === "low").length,
    medium: apps.filter((a) => a.riskLevel === "medium").length,
    high: apps.filter((a) => a.riskLevel === "high").length,
  };
  const overallScore =
    apps.length === 0
      ? 0
      : Math.round(apps.reduce((s, a) => s + a.privacyScore, 0) / apps.length);

  const chartData =
    report?.days.map((d, i) => ({
      day: d,
      Location: report.locationUsage[i],
      Camera: report.cameraUsage[i],
      Microphone: report.microphoneUsage[i],
    })) ?? [];

  const pieData = [
    { name: "Safe", value: counts.safe, color: "var(--color-success)" },
    { name: "Medium", value: counts.medium, color: "var(--color-warning)" },
    { name: "High", value: counts.high, color: "var(--color-destructive)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.displayName?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's the privacy posture of your device today.
          </p>
        </div>
      </div>

      {/* Score + stats */}
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="glass rounded-2xl p-6 shadow-card flex items-center gap-6">
          <ScoreRing score={overallScore} size={150} label="Privacy" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall</div>
            <div className="text-lg font-semibold mt-1">Your privacy score</div>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
              Based on {counts.total} installed apps and their permission profiles.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Smartphone} label="Total apps" value={counts.total} tone="primary" />
          <StatCard icon={ShieldCheck} label="Safe" value={counts.safe} tone="success" />
          <StatCard icon={ShieldAlert} label="Medium risk" value={counts.medium} tone="warning" />
          <StatCard icon={ShieldX} label="High risk" value={counts.high} tone="destructive" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">Weekly permission usage</div>
              <div className="text-xs text-muted-foreground">Times apps accessed sensitive permissions</div>
            </div>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Area type="monotone" dataKey="Location" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="Camera" stroke="var(--color-accent)" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="Microphone" stroke="var(--color-warning)" fill="url(#g3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 shadow-card">
          <div className="text-sm font-semibold mb-1">Risk distribution</div>
          <div className="text-xs text-muted-foreground mb-2">All scanned apps</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
                <span className="tabular-nums text-muted-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI insights + permission summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">AI insights</div>
              <div className="text-xs text-muted-foreground">Generated from your latest scan</div>
            </div>
          </div>
          <ul className="space-y-2.5">
            {insights.map((i, idx) => (
              <li key={idx} className="text-sm flex gap-2.5 items-start">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5 shadow-card">
          <div className="text-sm font-semibold mb-3">This week's sensitive access</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: MapPin, label: "Location", value: sum(report?.locationUsage), tone: "text-primary" },
              { icon: Camera, label: "Camera", value: sum(report?.cameraUsage), tone: "text-accent" },
              { icon: Mic, label: "Microphone", value: sum(report?.microphoneUsage), tone: "text-warning" },
              { icon: Users, label: "Contacts", value: sum(report?.contactsUsage), tone: "text-primary" },
              { icon: HardDrive, label: "Storage", value: sum(report?.storageUsage), tone: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.tone}`} />
                  {s.label}
                </div>
                <span className="tabular-nums font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top apps */}
      <div className="glass rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Apps needing attention</div>
            <div className="text-xs text-muted-foreground">Highest risk first</div>
          </div>
          <Link to="/apps" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-2">
          {[...apps]
            .sort((a, b) => a.privacyScore - b.privacyScore)
            .slice(0, 4)
            .map((app) => (
              <Link
                key={app.id}
                to="/apps/$appId"
                params={{ appId: app.id }}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center text-xl">{app.icon}</div>
                  <div>
                    <div className="text-sm font-medium">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge risk={app.riskLevel} />
                  <div className="text-sm tabular-nums w-8 text-right">{app.privacyScore}</div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function sum(arr?: number[]) {
  return arr ? arr.reduce((a, b) => a + b, 0) : 0;
}
