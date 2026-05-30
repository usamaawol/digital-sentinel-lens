import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/lib/firebase/auth.service";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { useTheme } from "@/context/theme-context";
import {
  requestNotificationPermission,
  getNotificationPermission,
  showLocalNotification,
  canInstallPWA,
  installPWA,
  isPWAInstalled,
  getInstallInstructions,
  getPlatform,
} from "@/lib/pwa";
import { toast } from "sonner";
import { User, KeyRound, Bell, Palette, Shield, Moon, Sun, Download, BellOff, BellRing, Smartphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Privacy Guard AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [installingPwa, setInstallingPwa] = useState(false);

  useEffect(() => {
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
      // Update Firebase Auth profile
      const { updateProfile } = await import("firebase/auth");
      const { firebaseAuth } = await import("@/lib/firebase/config");
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, { displayName: displayName.trim() });
      }
      // Update Firestore profile
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
      // Send a test notification
      await showLocalNotification({
        title: "Privacy Guard AI",
        body: "Notifications are now enabled. You'll be alerted about privacy risks.",
        type: "general",
        url: "/notifications",
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

  const onChangePw = async (e: FormEvent) => {
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, security, and preferences.</p>
      </div>

      <Section icon={User} title="Profile">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user?.email} disabled />
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Section>

      <Section icon={KeyRound} title="Change password">
        <form onSubmit={onChangePw} className="grid sm:grid-cols-2 gap-4 max-w-md">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Current password</Label>
            <Input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>New password</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {busy ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </Section>

      <Section icon={Bell} title="Notifications">
        {/* Notification permission status */}
        <div className="mb-4 p-3 rounded-xl bg-muted/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {notifPermission === "granted" ? (
              <BellRing className="h-5 w-5 text-success" />
            ) : notifPermission === "denied" ? (
              <BellOff className="h-5 w-5 text-destructive" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm font-medium">
                {notifPermission === "granted"
                  ? "Notifications enabled"
                  : notifPermission === "denied"
                    ? "Notifications blocked"
                    : "Notifications not enabled"}
              </div>
              <div className="text-xs text-muted-foreground">
                {notifPermission === "granted"
                  ? "You'll receive real-time privacy alerts"
                  : notifPermission === "denied"
                    ? "Enable in browser settings → Site permissions"
                    : "Enable to get instant privacy alerts"}
              </div>
            </div>
          </div>
          {notifPermission !== "granted" && notifPermission !== "denied" && (
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0"
            >
              Enable
            </Button>
          )}
        </div>
        <SettingsRow label="High-risk permission alerts" hint="Notify when an app gains a high-risk permission" defaultChecked />
        <Separator className="my-3" />
        <SettingsRow label="New app detected" hint="Alert when a new app is added to your scan list" defaultChecked />
        <Separator className="my-3" />
        <SettingsRow label="Weekly report" hint="Get a weekly privacy summary notification" />
      </Section>

      {/* PWA Install */}
      <Section icon={Smartphone} title="Install App">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium">
              {isPWAInstalled() ? "App installed" : "Install Privacy Guard AI"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isPWAInstalled()
                ? "Privacy Guard AI is installed on your device."
                : getPlatform() === "ios"
                  ? getInstallInstructions()
                  : "Install as a native-like app for offline access, push notifications, and a better experience."}
            </div>
          </div>
          {!isPWAInstalled() && canInstallPWA() && (
            <Button
              size="sm"
              onClick={handleInstallPwa}
              disabled={installingPwa}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {installingPwa ? "Installing…" : "Install"}
            </Button>
          )}
          {isPWAInstalled() && (
            <span className="text-xs text-success font-medium shrink-0">✓ Installed</span>
          )}
        </div>
      </Section>

      <Section icon={Palette} title="Appearance">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Theme</div>
            <div className="text-xs text-muted-foreground mt-0.5">Dark is the default. Switch to light any time.</div>
          </div>
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
          </div>
        </div>
      </Section>

      <Section icon={Shield} title="Security preferences">
        <SettingsRow label="Auto-scan new apps" hint="Run a scan automatically when an app is installed" defaultChecked />
        <Separator className="my-3" />
        <SettingsRow label="Block trackers (coming soon)" hint="Will require native Android module" />
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  hint,
  defaultChecked,
}: {
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
