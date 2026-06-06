import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// NITRO_PRESET env var controls the deployment target:
//   - "vercel"            → Vercel (set NITRO_PRESET=vercel in Vercel dashboard env vars)
//   - "cloudflare-module" → Cloudflare Workers
//   - "node-server"       → plain Node.js server
const preset = (process.env.NITRO_PRESET as string) || "vercel";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Nitro only runs during build
    ...(process.env.NODE_ENV !== "test"
      ? [
          nitro({
            preset,
            output: {
              dir: "dist",
              serverDir: "dist/server",
              publicDir: "dist/client",
            },
          }),
        ]
      : []),
    react(),
  ],
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: "::",
    port: 8080,
  },
});
