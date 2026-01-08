/* eslint-disable @typescript-eslint/no-require-imports */

require("ts-node/register");

const path = require("path");
const fse = require("fs-extra");
const { execSync } = require("child_process");

const buildDir = path.join(process.cwd(), "build");
fse.removeSync(buildDir);
fse.ensureDirSync(buildDir);

// Determine mode
const config =
  require(path.join(process.cwd(), "next.config.ts")).default || {};
const standalone = config.output === "standalone";
console.log(`⚙️  Output mode: ${standalone ? "standalone" : "default"}`);

// Build
execSync("next build", { stdio: "inherit" });

if (standalone) {
  const src = path.join(process.cwd(), ".next/standalone");
  const dest = buildDir;
  console.log("📦 Copying standalone server files...");
  fse.copySync(src, dest);

  console.log("📦 Adding public and static assets...");
  fse.copySync("public", path.join(dest, "public"));
  fse.copySync(
    path.join(process.cwd(), ".next/static"),
    path.join(dest, ".next/static")
  );
} else {
  console.log("📦 Default mode: copying .next and public...");
  fse.copySync(".next", path.join(buildDir, ".next"));
  fse.copySync("public", path.join(buildDir, "public"));
}

console.log("✅ Build completed. Deploy /build to your server.");
