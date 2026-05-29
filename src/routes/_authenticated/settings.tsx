import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/lib/firebase/auth.service";
import { toast } from "sonner";
import { User, KeyRound, Bell, Palette, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Privacy Guard AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);

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
            <Input defaultValue={user?.displayName} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user?.email} disabled />
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm">
            Save changes
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
        <SettingsRow label="High-risk permission alerts" hint="Notify me when an app gains a high-risk permission" defaultChecked />
        <Separator className="my-3" />
        <SettingsRow label="New app detected" hint="Alert when a new app is installed" defaultChecked />
        <Separator className="my-3" />
        <SettingsRow label="Weekly report" hint="Email me a privacy summary every week" />
      </Section>

      <Section icon={Palette} title="Appearance">
        <SettingsRow label="Dark theme" hint="Privacy Guard is dark-first" defaultChecked />
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
