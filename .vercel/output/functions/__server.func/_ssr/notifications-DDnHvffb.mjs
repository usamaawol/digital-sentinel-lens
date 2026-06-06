import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { U as collection, aL as query, at as limit, aH as orderBy, aD as onSnapshot, ao as getFirestore, al as getDocs, b2 as writeBatch } from "../_libs/firebase__firestore.mjs";
import { e as firestoreService, d as firebaseAuth, f as firebaseApp } from "./router-x6rZinQA.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/firebase__auth.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/firebase.mjs";
import { B as Bell, R as RefreshCw, i as CheckCheck, a2 as Trash2, U as ShieldAlert, Y as Smartphone, a3 as TrendingUp, p as FileText } from "../_libs/lucide-react.mjs";
import { a as formatDistanceToNow } from "../_libs/date-fns.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "util";
import "crypto";
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
import "stream";
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
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "../_libs/isbot.mjs";
import "../_libs/idb.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const db = getFirestore(firebaseApp);
const iconFor = (t) => t === "high-risk" ? {
  Icon: ShieldAlert,
  tone: "text-destructive bg-destructive/10"
} : t === "new-app" ? {
  Icon: Smartphone,
  tone: "text-primary bg-primary/10"
} : t === "score-change" ? {
  Icon: TrendingUp,
  tone: "text-success bg-success/10"
} : {
  Icon: FileText,
  tone: "text-accent bg-accent/10"
};
function NotificationsPage() {
  const queryClient = useQueryClient();
  const {
    data: fetchedNotifs = [],
    isLoading
  } = useQuery({
    queryKey: ["notifs"],
    queryFn: () => firestoreService.listNotifications(),
    refetchInterval: 15e3
  });
  const [localReadIds, setLocalReadIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [localDeletedIds, setLocalDeletedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [cleared, setCleared] = reactExports.useState(false);
  const notifs = cleared ? [] : fetchedNotifs.filter((n) => !localDeletedIds.has(n.id)).map((n) => ({
    ...n,
    read: n.read || localReadIds.has(n.id)
  }));
  const unreadCount = notifs.filter((n) => !n.read).length;
  reactExports.useEffect(() => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;
    const notifsRef = collection(db, "users", uid, "notifications");
    const q = query(notifsRef, orderBy("time", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        queryClient.invalidateQueries({
          queryKey: ["notifs"]
        });
      }
    }, () => {
    });
    return () => unsub();
  }, [queryClient]);
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["notifs"]
    });
    toast.success("Notifications refreshed.");
  };
  const markAllRead = async () => {
    const unreadIds = notifs.filter((n) => !n.read).map((n) => n.id);
    setLocalReadIds((prev) => /* @__PURE__ */ new Set([...prev, ...unreadIds]));
    const uid = firebaseAuth.currentUser?.uid;
    if (uid) {
      try {
        const notifsRef = collection(db, "users", uid, "notifications");
        const snapshot = await getDocs(notifsRef);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((d) => {
            if (!d.data().read) batch.update(d.ref, {
              read: true
            });
          });
          await batch.commit();
          await queryClient.invalidateQueries({
            queryKey: ["notifs"]
          });
        }
      } catch {
      }
    }
    toast.success("All notifications marked as read.");
  };
  const markOneRead = async (id) => {
    setLocalReadIds((prev) => /* @__PURE__ */ new Set([...prev, id]));
    const uid = firebaseAuth.currentUser?.uid;
    if (uid) {
      try {
        const notifsRef = collection(db, "users", uid, "notifications");
        const snapshot = await getDocs(notifsRef);
        const match = snapshot.docs.find((d) => d.data().id === id || d.id === id);
        if (match) {
          const {
            updateDoc
          } = await import("../_libs/firebase.mjs").then(function(n) {
            return n.a;
          });
          await updateDoc(match.ref, {
            read: true
          });
          await queryClient.invalidateQueries({
            queryKey: ["notifs"]
          });
        }
      } catch {
      }
    }
  };
  const clearAll = async () => {
    setCleared(true);
    setLocalDeletedIds(/* @__PURE__ */ new Set());
    setLocalReadIds(/* @__PURE__ */ new Set());
    const uid = firebaseAuth.currentUser?.uid;
    if (uid) {
      try {
        const notifsRef = collection(db, "users", uid, "notifications");
        const snapshot = await getDocs(notifsRef);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          await queryClient.invalidateQueries({
            queryKey: ["notifs"]
          });
        }
      } catch {
      }
    }
    toast.success("All notifications cleared.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6 text-primary" }),
          " Notifications",
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold", children: unreadCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Real-time alerts about your privacy posture." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleRefresh, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Refresh"
        ] }),
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: markAllRead, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Mark all read"
        ] }),
        notifs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: clearAll, className: "text-destructive hover:text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 mr-1.5" }),
          " Clear all"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl shadow-card overflow-hidden", children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 border-b border-border/60 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-muted rounded animate-pulse w-1/3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-muted rounded animate-pulse w-2/3" })
      ] })
    ] }, i)) }) : notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-12 text-center shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "No notifications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Scan your apps to start receiving privacy alerts." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl divide-y divide-border/60 shadow-card overflow-hidden", children: notifs.map((n) => {
      const {
        Icon,
        tone
      } = iconFor(n.type);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 p-4 transition-colors hover:bg-muted/20 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`, onClick: () => !n.read && markOneRead(n.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-xl grid place-items-center shrink-0 ${tone}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: n.title }),
            !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${n.type === "high-risk" ? "text-destructive border-destructive/30 bg-destructive/10" : n.type === "new-app" ? "text-primary border-primary/30 bg-primary/10" : n.type === "score-change" ? "text-success border-success/30 bg-success/10" : "text-accent border-accent/30 bg-accent/10"}`, children: n.type.replace("-", " ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5 leading-relaxed", children: n.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: formatDistanceToNow(new Date(n.time), {
            addSuffix: true
          }) })
        ] })
      ] }, n.id);
    }) })
  ] });
}
export {
  NotificationsPage as component
};
