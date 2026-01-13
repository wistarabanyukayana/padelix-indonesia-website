import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createInterface } from "readline/promises";

const ROOT_DIR = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(ROOT_DIR, "build");
const STANDALONE_DIR = path.join(ROOT_DIR, ".next", "standalone");
const STATIC_DIR = path.join(ROOT_DIR, ".next", "static");

function runCommand(command: string) {
  try {
    execSync(command, { stdio: "inherit", cwd: ROOT_DIR, env: { ...process.env, NODE_ENV: "production" } });
  } catch {
    console.error("❌ Command failed: " + command);
    process.exit(1);
  }
}

function copyRecursiveSync(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function confirmEnv() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Is `.env` already set to production values? (y/N) ");
  rl.close();
  if (answer.trim().toLowerCase() !== "y") {
    console.error("❌ Aborting: `.env` is not confirmed as production.");
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 Starting Release Preparation...");
  await confirmEnv();

  if (fs.existsSync(BUILD_DIR)) {
    console.log("🧹 Cleaning previous build output...");
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(BUILD_DIR, { recursive: true });

  console.log("🏗️  Building project (Lint + Build)...");
  runCommand("pnpm lint");
  runCommand("pnpm build");

  if (!fs.existsSync(STANDALONE_DIR)) {
    console.error("❌ Missing .next/standalone. Make sure `output: \"standalone\"` is enabled.");
    process.exit(1);
  }
  if (!fs.existsSync(STATIC_DIR)) {
    console.error("❌ Missing .next/static. Build output is incomplete.");
    process.exit(1);
  }

  console.log("📂 Copying standalone output to build/...");
  copyRecursiveSync(STANDALONE_DIR, BUILD_DIR);

  console.log("🎨 Copying static assets to build/.next/static...");
  const buildStaticDir = path.join(BUILD_DIR, ".next", "static");
  fs.mkdirSync(buildStaticDir, { recursive: true });
  copyRecursiveSync(STATIC_DIR, buildStaticDir);

  console.log("✅ Build prepared successfully at ./build");
}

main().catch((error) => {
  console.error("❌ Release preparation failed:", error);
  process.exit(1);
});
