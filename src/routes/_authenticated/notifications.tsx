import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ShieldAlert, Smartphone, TrendingUp, FileText } from "lucide-react";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { formatDistanceToNow } from "date-fns";
import type { NotificationItem } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Privacy Guard AI" }] }),
  component: NotificationsPage,
});

const iconFor = (t: NotificationItem["type"]) =>
  t === "high-risk"
    ? { Icon: ShieldAlert, tone: "text-destructive bg-destructive/10" }
    : t === "new-app"
      ? { Icon: Smartphone, tone: "text-primary bg-primary/10" }
      : t === "score-change"
        ? { Icon: TrendingUp, tone: "text-success bg-success/10" }
        : { Icon: FileText, tone: "text-accent bg-accent/10" };

function NotificationsPage() {
  const { data: notifs = [] } = useQuery({
    queryKey: ["notifs"],
    queryFn: () => firestoreService.listNotifications(),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Stay on top of changes to your privacy posture.</p>
      </div>

      <div className="glass rounded-2xl divide-y divide-border/60 shadow-card overflow-hidden">
        {notifs.map((n) => {
          const { Icon, tone } = iconFor(n.type);
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 ${!n.read ? "bg-primary/5" : ""}`}
            >
              <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-ring" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
