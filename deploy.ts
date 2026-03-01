#!/usr/bin/env bun
/**
 * Deploy script — builds the app then publishes to Cloudflare Pages via wrangler.
 *
 * Required env vars:
 *   CLOUDFLARE_API_TOKEN   — Cloudflare API token with Pages:Edit permission
 *   CLOUDFLARE_ACCOUNT_ID  — Cloudflare account ID
 */

function run(cmd: string, args: string[]): void {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const result = Bun.spawnSync([cmd, ...args], { stdin: "inherit", stdout: "inherit", stderr: "inherit" });
  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
}

const requiredEnv = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

// Build
run("bun", ["run", "build"]);

// Deploy via wrangler (picks up wrangler.toml config)
run("bunx", ["wrangler", "pages", "deploy", "app/dist"]);
