import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { a as aiService } from "./ai.service-DoSfZ9ki.mjs";
import "../_libs/seroval.mjs";
import { Z as Sparkles, a7 as WifiOff, W as ShieldQuestionMark, N as Send } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./server-BQeBvh7z.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/zod.mjs";
const suggestions = ["Is TikTok safe to keep installed?", "Why does this app need location access?", "Should I uninstall this app?", "Explain this privacy policy in simple terms"];
function AssistantPage() {
  const [messages, setMessages] = reactExports.useState([{
    role: "assistant",
    content: "Hi! I'm your Privacy Guard assistant. Ask me about an app, a permission, or paste a privacy policy snippet — I'll explain it in plain English."
  }]);
  const [input, setInput] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [aiError, setAiError] = reactExports.useState(false);
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, busy]);
  const send = async (content) => {
    if (!content.trim()) return;
    const next = [...messages, {
      role: "user",
      content
    }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const reply = await aiService.chat(next);
      const isHtmlError = reply.trim().startsWith("<!") || reply.trim().startsWith("<html");
      if (isHtmlError) {
        setAiError(true);
        setMessages((m) => [...m, {
          role: "assistant",
          content: "⚠️ The AI server is not reachable right now. Make sure OPENROUTER_API_KEY is set in your environment variables and redeploy."
        }]);
        return;
      }
      setAiError(false);
      setMessages((m) => [...m, {
        role: "assistant",
        content: reply
      }]);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const isHtml = raw.includes("<!doctype") || raw.includes("<html") || raw.includes("<head");
      const msg = isHtml ? "The AI server returned an error. Check that OPENROUTER_API_KEY is configured correctly." : raw || "Something went wrong contacting the AI.";
      setAiError(true);
      setMessages((m) => [...m, {
        role: "assistant",
        content: `⚠️ ${msg}`
      }]);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-[calc(100vh-7rem)] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6 text-accent" }),
          " AI Privacy Assistant"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Plain-English answers about your apps and privacy." })
      ] }),
      aiError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 text-[11px] rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-3 w-3" }),
        " AI offline — set OPENROUTER_API_KEY"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 text-[11px] rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
        " Powered by OpenRouter"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl flex-1 flex flex-col overflow-hidden shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-5 space-y-4", children: [
        messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`, children: [
          m.role === "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "bg-muted/50 border border-border/60"}`, children: m.content })
        ] }, i)),
        busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-accent/15 text-accent grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/50 border border-border/60 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground", children: "Thinking…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
      ] }),
      messages.length <= 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pb-3 flex flex-wrap gap-2", children: suggestions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => send(s), className: "text-xs rounded-full border border-border bg-muted/30 hover:bg-muted px-3 py-1.5 transition-colors inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldQuestionMark, { className: "h-3 w-3" }),
        " ",
        s
      ] }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        send(input);
      }, className: "border-t border-border/60 p-3 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ask anything about your privacy…", value: input, onChange: (e) => setInput(e.target.value), disabled: busy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy || !input.trim(), className: "bg-gradient-primary text-primary-foreground hover:opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] })
    ] })
  ] });
}
export {
  AssistantPage as component
};
