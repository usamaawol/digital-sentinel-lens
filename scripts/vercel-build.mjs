/**
 * Vercel build script for Privacy Guard AI (TanStack Start + Nitro)
 *
 * Nitro's vercel preset outputs to dist/ but Vercel's Build Output API
 * expects the output at .vercel/output/
 *
 * This script:
 * 1. Runs the Vite build with NITRO_PRESET=vercel
 * 2. Moves dist/ to .vercel/output/
 * 3. Sets up the correct directory structure:
 *    .vercel/output/
 *      config.json          ← Vercel routing config (from dist/config.json)
 *      static/              ← Static assets (from dist/client/)
 *      functions/
 *        __server.func/     ← SSR serverless function (from dist/server/)
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, cpSync, renameSync, copyFileSync, rmSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const distDir = join(root, "dist");
const vercelOut = join(root, ".vercel", "output");

// ── Step 1: Build with vercel preset ─────────────────────────────────────────
console.log("Building with Nitro vercel preset...");
process.env.NITRO_PRESET = "vercel";
execSync("npm run build", { stdio: "inherit", env: { ...process.env, NITRO_PRESET: "vercel" } });

// ── Step 2: Clean and create .vercel/output ───────────────────────────────────
if (existsSync(vercelOut)) {
  rmSync(vercelOut, { recursive: true });
}
mkdirSync(vercelOut, { recursive: true });
mkdirSync(join(vercelOut, "static"), { recursive: true });
mkdirSync(join(vercelOut, "functions", "__server.func"), { recursive: true });

// ── Step 3: Copy config.json ──────────────────────────────────────────────────
copyFileSync(join(distDir, "config.json"), join(vercelOut, "config.json"));
console.log("✓ Copied config.json");

// ── Step 4: Copy static files (dist/client → .vercel/output/static) ──────────
cpSync(join(distDir, "client"), join(vercelOut, "static"), { recursive: true });
console.log("✓ Copied static assets");

// ── Step 5: Copy server function (dist/server → .vercel/output/functions/__server.func) ──
cpSync(join(distDir, "server"), join(vercelOut, "functions", "__server.func"), { recursive: true });
console.log("✓ Copied server function");

// ── Step 6: Patch .vc-config.json to use nodejs22.x (Vercel doesn't support node 24 yet) ──
const vcConfigPath = join(vercelOut, "functions", "__server.func", ".vc-config.json");
if (existsSync(vcConfigPath)) {
  const vcConfig = JSON.parse(readFileSync(vcConfigPath, "utf8"));
  if (vcConfig.runtime && vcConfig.runtime !== "nodejs22.x") {
    console.log(`⚠ Patching runtime from ${vcConfig.runtime} → nodejs22.x (Vercel max supported)`);
    vcConfig.runtime = "nodejs22.x";
    writeFileSync(vcConfigPath, JSON.stringify(vcConfig, null, 2));
  }
  console.log("✓ Verified .vc-config.json runtime: nodejs22.x");
}

console.log("\n✅ Vercel output ready at .vercel/output/");
console.log("   config.json — routing");
console.log("   static/     — " + (existsSync(join(vercelOut, "static", "assets")) ? "assets included" : "no assets"));
console.log("   functions/__server.func/ — SSR handler");
