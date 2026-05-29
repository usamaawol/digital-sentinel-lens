import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Tag, Package, Calendar } from "lucide-react";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { ScoreRing } from "@/components/score-ring";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/apps/$appId")({
  head: () => ({ meta: [{ title: "App details — Privacy Guard AI" }] }),
  component: AppDetail,
});

function AppDetail() {
  const { appId } = useParams({ from: "/_authenticated/apps/$appId" });
  const { data: app, isLoading } = useQuery({
    queryKey: ["app", appId],
    queryFn: () => firestoreService.getApp(appId),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading app…</div>;
  if (!app) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm">App not found.</p>
        <Link to="/apps">
          <Button variant="outline" size="sm" className="mt-4">
            Back to apps
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/apps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to apps
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-6 shadow-card flex flex-wrap items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-muted grid place-items-center text-4xl">{app.icon}</div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{app.name}</h1>
            <RiskBadge risk={app.riskLevel} />
          </div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <Info icon={Building2} label="Developer" value={app.developer} />
            <Info icon={Tag} label="Category" value={app.category} />
            <Info icon={Package} label="Version" value={app.version} />
            <Info icon={Calendar} label="Last scan" value={format(new Date(app.lastScan), "PP p")} />
          </div>
        </div>
        <ScoreRing score={app.privacyScore} size={120} label="Score" />
      </div>

      {/* Permissions */}
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Permissions</h2>
            <p className="text-xs text-muted-foreground">What this app can access and why it matters</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {app.permissions.filter((p) => p.granted).length} of {app.permissions.length} granted
          </div>
        </div>
        <div className="grid gap-3">
          {app.permissions.map((p) => (
            <div key={p.name} className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{p.name}</div>
                  <RiskBadge risk={p.risk} />
                  {!p.granted && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
                      Not granted
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Permission
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="uppercase tracking-wider text-[10px]">{label}</div>
        <div className="text-foreground text-xs truncate">{value}</div>
      </div>
    </div>
  );
}
