import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/firebase/auth.service";
import { toast } from "sonner";
import { AuthShell } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Privacy Guard AI" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.resetPassword(email);
      setSent(true);
      toast.success("If that email exists, a reset link has been sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="text-sm text-muted-foreground mt-1">We'll email you a link to reset your password.</p>
      {sent ? (
        <div className="mt-6 glass rounded-lg p-4 text-sm">
          Check your inbox at <strong>{email}</strong> for further instructions.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        <Link to="/login" className="hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
