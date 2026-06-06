import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button, c as cn } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { R as Root, T as Thumb } from "../_libs/radix-ui__react-switch.mjs";
import { S as Separator } from "./separator-FbHnBuBJ.mjs";
import { u as useAuth, n as useTheme, h as getNotificationPermission, k as isPWAInstalled, i as getPlatform, g as getInstallInstructions, c as canInstallPWA, e as firestoreService, a as authService, r as requestNotificationPermission, m as showLocalNotification, j as installPWA } from "./router-x6rZinQA.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/firebase__auth.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__firestore.mjs";
import { a5 as User, K as KeyRound, B as Bell, e as BellRing, d as BellOff, Y as Smartphone, o as Download, y as Palette, a0 as Sun, x as Moon, T as Shield } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root.displayName;
function SettingsPage() {
  const {
    user
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const [displayName, setDisplayName] = reactExports.useState(user?.displayName ?? "");
  const [currentPw, setCurrentPw] = reactExports.useState("");
  const [newPw, setNewPw] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [savingProfile, setSavingProfile] = reactExports.useState(false);
  const [notifPermission, setNotifPermission] = reactExports.useState("default");
  const [installingPwa, setInstallingPwa] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setNotifPermission(getNotificationPermission());
    setDisplayName(user?.displayName ?? "");
  }, [user]);
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }
    setSavingProfile(true);
    try {
      const {
        updateProfile
      } = await import("../_libs/firebase.mjs").then(function(n) {
        return n.i;
      });
      const {
        firebaseAuth
      } = await import("./router-x6rZinQA.mjs").then((n) => n.b);
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, {
          displayName: displayName.trim()
        });
      }
      await firestoreService.updateDisplayName(displayName.trim());
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    if (granted) {
      toast.success("Notifications enabled!");
      await showLocalNotification({
        title: "Privacy Guard AI",
        body: "Notifications are now enabled. You'll be alerted about privacy risks.",
        type: "general",
        url: "/notifications"
      });
    } else {
      toast.error("Notification permission denied. Enable it in your browser settings.");
    }
  };
  const handleInstallPwa = async () => {
    setInstallingPwa(true);
    const result = await installPWA();
    setInstallingPwa(false);
    if (result === "accepted") toast.success("Privacy Guard AI installed!");
    else if (result === "dismissed") toast.info("Installation cancelled.");
    else toast.info(getInstallInstructions());
  };
  const onChangePw = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await authService.updatePassword(currentPw, newPw);
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage your profile, security, and preferences." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { icon: User, title: "Profile", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Display name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: displayName, onChange: (e) => setDisplayName(e.target.value), placeholder: "Your name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { defaultValue: user?.email, disabled: true })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleSaveProfile, disabled: savingProfile, children: savingProfile ? "Saving…" : "Save changes" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: KeyRound, title: "Change password", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: onChangePw, className: "grid sm:grid-cols-2 gap-4 max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, value: currentPw, onChange: (e) => setCurrentPw(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "New password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, minLength: 6, value: newPw, onChange: (e) => setNewPw(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy, className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: busy ? "Updating…" : "Update password" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { icon: Bell, title: "Notifications", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 rounded-xl bg-muted/30 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          notifPermission === "granted" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "h-5 w-5 text-success" }) : notifPermission === "denied" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "h-5 w-5 text-destructive" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: notifPermission === "granted" ? "Notifications enabled" : notifPermission === "denied" ? "Notifications blocked" : "Notifications not enabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: notifPermission === "granted" ? "You'll receive real-time privacy alerts" : notifPermission === "denied" ? "Enable in browser settings → Site permissions" : "Enable to get instant privacy alerts" })
          ] })
        ] }),
        notifPermission !== "granted" && notifPermission !== "denied" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: handleEnableNotifications, className: "bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0", children: "Enable" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRow, { label: "High-risk permission alerts", hint: "Notify when an app gains a high-risk permission", defaultChecked: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRow, { label: "New app detected", hint: "Alert when a new app is added to your scan list", defaultChecked: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRow, { label: "Weekly report", hint: "Get a weekly privacy summary notification" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: Smartphone, title: "Install App", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: isPWAInstalled() ? "App installed" : "Install Privacy Guard AI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: isPWAInstalled() ? "Privacy Guard AI is installed on your device." : getPlatform() === "ios" ? getInstallInstructions() : "Install as a native-like app for offline access, push notifications, and a better experience." })
      ] }),
      !isPWAInstalled() && canInstallPWA() && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleInstallPwa, disabled: installingPwa, className: "bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 mr-1.5" }),
        installingPwa ? "Installing…" : "Install"
      ] }),
      isPWAInstalled() && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-success font-medium shrink-0", children: "✓ Installed" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: Palette, title: "Appearance", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Theme" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: "Dark is the default. Switch to light any time." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex rounded-lg border border-border p-1 bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setTheme("light"), className: `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-3.5 w-3.5" }),
          " Light"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setTheme("dark"), className: `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-3.5 w-3.5" }),
          " Dark"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { icon: Shield, title: "Security preferences", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRow, { label: "Auto-scan new apps", hint: "Run a scan automatically when an app is installed", defaultChecked: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRow, { label: "Block trackers (coming soon)", hint: "Will require native Android module" })
    ] })
  ] });
}
function Section({
  icon: Icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: title })
    ] }),
    children
  ] });
}
function SettingsRow({
  label,
  hint,
  defaultChecked
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { defaultChecked })
  ] });
}
export {
  SettingsPage as component
};
