import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  FileText,
  CheckCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  writeBatch,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { firebaseApp, firebaseAuth } from "@/lib/firebase/config";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";
import type { NotificationItem } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Privacy Guard AI" }] }),
  component: NotificationsPage,
});

const db = getFirestore(firebaseApp);

const iconFor = (t: NotificationItem["type"]) =>
  t === "high-risk"
    ? { Icon: ShieldAlert, tone: "text-destructive bg-destructive/10" }
    : t === "new-app"
      ? { Icon: Smartphone, tone: "text-primary bg-primary/10" }
      : t === "score-change"
        ? { Icon: TrendingUp, tone: "text-success bg-success/10" }
        : { Icon: FileText, tone: "text-accent bg-accent/10" };

function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ["notifs"],
    queryFn: () => firestoreService.listNotifications(),
    refetchInterval: 15_000, // Poll every 15s for new notifications
  });

  // Real-time listener for new notifications
  useEffect(() => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;

    const notifsRef = collection(db, "users", uid, "notifications");
    const q = query(notifsRef, orderBy("time", "desc"), limit(50));

    const unsub = onSnapshot(q, () => {
      queryClient.invalidateQueries({ queryKey: ["notifs"] });
    });

    return () => unsub();
  }, [queryClient]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;

    try {
      const notifsRef = collection(db, "users", uid, "notifications");
      const snapshot = await getDocs(notifsRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        if (!d.data().read) batch.update(d.ref, { read: true });
      });
      await batch.commit();
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark notifications as read.");
    }
  };

  const markOneRead = async (id: string) => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;
    try {
      // Find the Firestore doc by querying for matching id field
      const notifsRef = collection(db, "users", uid, "notifications");
      const snapshot = await getDocs(notifsRef);
      const match = snapshot.docs.find((d) => d.data().id === id || d.id === id);
      if (match) await updateDoc(match.ref, { read: true });
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });
    } catch {
      // Silent fail
    }
  };

  const clearAll = async () => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;

    try {
      const notifsRef = collection(db, "users", uid, "notifications");
      const snapshot = await getDocs(notifsRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      await queryClient.invalidateQueries({ queryKey: ["notifs"] });
      toast.success("All notifications cleared.");
    } catch {
      toast.error("Failed to clear notifications.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time alerts about your privacy posture.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["notifs"] })}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark all read
            </Button>
          )}
          {notifs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="glass rounded-2xl shadow-card overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 border-b border-border/60 last:border-0">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center shadow-card">
          <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Scan your apps to start receiving privacy alerts.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-border/60 shadow-card overflow-hidden">
          {notifs.map((n) => {
            const { Icon, tone } = iconFor(n.type);
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/20 cursor-pointer ${
                  !n.read ? "bg-primary/5" : ""
                }`}
                onClick={() => !n.read && markOneRead(n.id)}
              >
                <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{n.title}</span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    {/* Type badge */}
                    <span
                      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        n.type === "high-risk"
                          ? "text-destructive border-destructive/30 bg-destructive/10"
                          : n.type === "new-app"
                            ? "text-primary border-primary/30 bg-primary/10"
                            : n.type === "score-change"
                              ? "text-success border-success/30 bg-success/10"
                              : "text-accent border-accent/30 bg-accent/10"
                      }`}
                    >
                      {n.type.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
