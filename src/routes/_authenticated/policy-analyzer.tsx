import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSearch, Sparkles, Database, Share2, Clock, ShieldAlert, Lightbulb, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiService, type PolicyAnalysis } from "@/lib/ai/ai.service";
import { firestoreService } from "@/lib/firebase/firestore.service";
import { RiskBadge } from "@/components/risk-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/policy-analyzer")({
  head: () => ({ meta: [{ title: "Policy Analyzer — Privacy Guard AI" }] }),
  component: PolicyAnalyzer,
});

function PolicyAnalyzer() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PolicyAnalysis | null>(null);

  const analyze = async (input: { url?: string; text?: string }) => {
    if (!input.url && !input.text) {
      toast.error("Please enter a URL or paste policy text.");
      return;
    }
    setBusy(true);
    try {
      const r = await aiService.analyzePolicy(input);
      setResult(r);
      // Save analysis to Firestore ai_analyses collection
      const sourceType = input.url ? "url" : "text";
      const source = input.url || input.text || "";
      await firestoreService.saveAiAnalysis(r, sourceType, source);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileSearch className="h-6 w-6 text-primary" /> Privacy Policy Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a URL or text and get a plain-English breakdown.
          </p>
        </div>
        <div className="text-[11px] inline-flex items-center gap-1.5 rounded-full border border-border bg-success/10 px-2.5 py-1 text-success">
          <Sparkles className="h-3 w-3" /> AI · Powered by OpenRouter
        </div>
      </div>

      <div className="glass rounded-2xl p-5 shadow-card">
        <Tabs defaultValue="url">
          <TabsList>
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="text">Paste text</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="mt-4 space-y-3">
            <Input
              placeholder="https://example.com/privacy"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              disabled={busy}
              onClick={() => analyze({ url })}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              {busy ? "Analysing…" : "Analyse policy"}
            </Button>
          </TabsContent>
          <TabsContent value="text" className="mt-4 space-y-3">
            <Textarea
              rows={8}
              placeholder="Paste the privacy policy text here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              disabled={busy}
              onClick={() => analyze({ text })}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              {busy ? "Analysing…" : "Analyse text"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Summary</h2>
              <RiskBadge risk={result.riskLevel} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Section icon={Database} title="Data collected">
              <ul className="space-y-1.5 text-sm">
                {result.dataCollected.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </Section>
            <Section icon={Share2} title="Third-party sharing">
              <ul className="space-y-1.5 text-sm">
                {result.thirdPartySharing.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </Section>
            <Section icon={Clock} title="Retention">
              <p className="text-sm text-muted-foreground leading-relaxed">{result.retention}</p>
            </Section>
            <Section icon={ShieldAlert} title="Risk analysis">
              <RiskBadge risk={result.riskLevel} className="mb-2" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Overall classification based on data collection, sharing, and retention practices.
              </p>
            </Section>
          </div>

          <div className="glass rounded-2xl p-5 shadow-card border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center">
                <Lightbulb className="h-4 w-4" />
              </div>
              <h2 className="font-semibold">AI recommendation</h2>
            </div>
            <p className="text-sm leading-relaxed">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Database;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
