import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Sparkles, Send, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiService, type ChatMessage } from "@/lib/ai/ai.service";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — Privacy Guard AI" }] }),
  component: AssistantPage,
});

const suggestions = [
  "Is TikTok safe to keep installed?",
  "Why does this app need location access?",
  "Should I uninstall this app?",
  "Explain this privacy policy in simple terms",
];

function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Privacy Guard assistant. Ask me about an app, a permission, or paste a privacy policy snippet. (Heads up: live AI responses activate once OpenRouter is connected — for now I'll respond with helpful mock answers.)",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (content: string) => {
    if (!content.trim()) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const reply = await aiService.chat(next);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" /> AI Privacy Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Plain-English answers about your apps and privacy.</p>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden shadow-card">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-primary text-primary-foreground"
                    : "bg-muted/50 border border-border/60"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="bg-muted/50 border border-border/60 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs rounded-full border border-border bg-muted/30 hover:bg-muted px-3 py-1.5 transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldQuestion className="h-3 w-3" /> {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border/60 p-3 flex gap-2"
        >
          <Input
            placeholder="Ask anything about your privacy…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <Button
            type="submit"
            disabled={busy || !input.trim()}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
