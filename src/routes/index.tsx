import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Sparkles, FileSearch, Smartphone, ArrowRight, Lock, Eye, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Privacy Guard AI — Take back control of your privacy" },
      {
        name: "description",
        content:
          "Scan your apps, understand permissions in plain English, and analyse privacy policies with AI. Built for Android.",
      },
      { property: "og:title", content: "Privacy Guard AI" },
      {
        property: "og:description",
        content: "AI-powered privacy and security for your Android device.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="container mx-auto flex items-center justify-between py-6 px-4">
        <BrandLogo />
        <nav className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 pt-16 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-powered privacy intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Understand what your apps are <span className="text-gradient">really doing</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Privacy Guard AI scans your Android apps, explains every permission in plain language, and
            translates dense privacy policies into clear risk insights.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Create free account <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Shield,
            title: "App risk scanning",
            desc: "Privacy scores for every installed app, scored 0–100 with clear risk bands.",
          },
          {
            icon: FileSearch,
            title: "Policy analyser",
            desc: "Paste any privacy policy. Get a plain-English summary and risk verdict in seconds.",
          },
          {
            icon: Sparkles,
            title: "AI assistant",
            desc: "Ask anything — 'Why does this app want my location?' — and get straightforward answers.",
          },
          {
            icon: Eye,
            title: "Permission insights",
            desc: "See which apps use your camera, microphone, location, and contacts — and when.",
          },
          {
            icon: Activity,
            title: "Weekly reports",
            desc: "Track trends across permissions and watch your privacy score improve.",
          },
          {
            icon: Lock,
            title: "Built for Android",
            desc: "Ready for native integration with Android's PackageManager and UsageStats APIs.",
          },
        ].map((f) => (
          <div key={f.title} className="glass rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <Smartphone className="h-3.5 w-3.5" /> Android-first · Built with privacy in mind
        </div>
      </footer>
    </div>
  );
}
