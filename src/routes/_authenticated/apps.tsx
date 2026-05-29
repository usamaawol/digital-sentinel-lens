import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/risk-badge";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/apps")({
  head: () => ({ meta: [{ title: "Applications — Privacy Guard AI" }] }),
  component: AppsPage,
});

type Filter = "all" | "safe" | "medium" | "high";

function AppsPage() {
  const { data: apps = [] } = useQuery({
    queryKey: ["apps"],
    queryFn: () => firestoreService.listApps(),
  });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return apps
      .filter((a) => {
        if (filter === "safe") return a.riskLevel === "safe" || a.riskLevel === "low";
        if (filter === "medium") return a.riskLevel === "medium";
        if (filter === "high") return a.riskLevel === "high";
        return true;
      })
      .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  }, [apps, q, filter]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "safe", label: "Safe" },
    { id: "medium", label: "Medium" },
    { id: "high", label: "High" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {apps.length} apps scanned · review permissions and privacy scores
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps…"
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((app) => (
          <Link
            key={app.id}
            to="/apps/$appId"
            params={{ appId: app.id }}
            className="glass rounded-2xl p-5 shadow-card hover:shadow-glow transition-all hover:-translate-y-0.5"
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
              <span className="text-muted-foreground">
                Scanned {formatDistanceToNow(new Date(app.lastScan), { addSuffix: true })}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No apps match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
