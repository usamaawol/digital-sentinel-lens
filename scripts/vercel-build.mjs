/**
 * Vercel build script for Privacy Guard AI (TanStack Start + Nitro)
 *
 * Nitro with preset=vercel outputs to dist/ as:
 *   dist/config.json      → Vercel routing config
 *   dist/client/          → static assets
 *   dist/server/          → serverless function files
 *
 * Vercel's Build Output API v3 expects:
 *   .vercel/output/config.json
 *   .vercel/output/static/
 *   .vercel/output/functions/__server.func/
 *
 * This script also patches nodejs24.x → nodejs22.x because Nitro
 * auto-detects the local Node version, and Vercel only supports up to 22.
 */

import { execSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  cpSync,
  copyFileSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";

const root = process.cwd();
const dist = join(root, "dist");
const out = join(root, ".vercel", "output");

// ── 1. Build ──────────────────────────────────────────────────────────────────
console.log("▶ Building (NITRO_PRESET=vercel)…");
execSync("npm run build", {
  stdio: "inherit",
  env: { ...process.env, NITRO_PRESET: "vercel" },
});

// ── 2. Clean output dir ───────────────────────────────────────────────────────
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(join(out, "static"), { recursive: true });
mkdirSync(join(out, "functions", "__server.func"), { recursive: true });

// ── 3. Copy config.json ───────────────────────────────────────────────────────
copyFileSync(join(dist, "config.json"), join(out, "config.json"));
console.log("✓ config.json");

// ── 4. Copy static assets ─────────────────────────────────────────────────────
cpSync(join(dist, "client"), join(out, "static"), { recursive: true });
console.log("✓ static/");

// ── 5. Copy server function ───────────────────────────────────────────────────
cpSync(join(dist, "server"), join(out, "functions", "__server.func"), {
  recursive: true,
});
console.log("✓ functions/__server.func/");

// ── 6. Patch runtime: nodejs24.x → nodejs22.x ────────────────────────────────
// Nitro detects the local Node version. Vercel only supports up to 22.x.
const vcConfig = join(out, "functions", "__server.func", ".vc-config.json");
if (existsSync(vcConfig)) {
  const cfg = JSON.parse(readFileSync(vcConfig, "utf8"));
  if (cfg.runtime !== "nodejs22.x") {
    console.log(`⚠  Patching runtime: ${cfg.runtime} → nodejs22.x`);
    cfg.runtime = "nodejs22.x";
    writeFileSync(vcConfig, JSON.stringify(cfg, null, 2));
  }
  console.log("✓ .vc-config.json runtime: nodejs22.x");
}

console.log("\n✅ .vercel/output/ is ready");
