// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// NITRO_PRESET env var controls the deployment target:
//   - "vercel"            → Vercel (set in Vercel dashboard: NITRO_PRESET=vercel)
//   - "cloudflare-module" → Cloudflare Workers (default)
//   - "node-server"       → plain Node.js server
//
// For Vercel: set NITRO_PRESET=vercel in your Vercel project environment variables.

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // Use NITRO_PRESET env var if set, otherwise default to vercel for deployment
    preset: (process.env.NITRO_PRESET as string) || "vercel",
  },
});
