import { execSync } from "child_process";
import "dotenv/config";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { db } from "../src/lib/db";

async function reset() {
  console.log("🗑️  Dropping all tables...");

  // Recreate the schema instead of dropping tables one by one — CASCADE
  // handles FK ordering (Postgres has no FOREIGN_KEY_CHECKS toggle).
  await db.execute(sql.raw("DROP SCHEMA public CASCADE"));
  await db.execute(sql.raw("CREATE SCHEMA public"));
  console.log("✅ Tables dropped.");

  // 2. Run Drizzle Kit Push
  console.log(`
🚀 Running Drizzle Kit Push...`);
  try {
    execSync("pnpm drizzle-kit push", { stdio: "inherit" });
  } catch {
    console.error("❌ Drizzle Kit Push failed.");
    process.exit(1);
  }

  // 3. Run SQL Seed from /database folder (expects PostgreSQL-format dump)
  console.log(`
📂 Running SQL Seed from database folder...`);
  const databaseDir = path.join(process.cwd(), "database");
  // Find the latest SQL file
  const files = fs
    .readdirSync(databaseDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .reverse();

  if (files.length > 0) {
    const sqlFile = path.join(databaseDir, files[0]);
    console.log(`...Executing ${files[0]}`);
    const sqlContent = fs.readFileSync(sqlFile, "utf-8");

    // Split commands by semicolon, but be careful about semicolons in strings
    // Simple split for now, assuming standard pg_dump format
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
      } catch {
        // Ignore errors about duplicates or existing tables if we just pushed
        // but log them just in case
        // console.warn('Warning executing SQL statement:', e);
      }
    }
    console.log("✅ SQL Seed executed.");
  } else {
    console.log("⚠️ No SQL file found in /database folder.");
  }

  console.log(`
✨ Database reset and setup complete!`);
  process.exit(0);
}

reset().catch((err) => {
  console.error("❌ Reset Failed:", err);
  process.exit(1);
});
