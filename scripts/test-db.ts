import { neon } from "@neondatabase/serverless";
import "dotenv/config";

async function testConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is missing in .env");
    process.exit(1);
  }

  // Mask password for safe logging
  const maskedUrl = url.replace(/:[^:@]+@/, ":****@");
  console.log(`🔌 Testing connection to: ${maskedUrl}`);

  try {
    const sql = neon(url);

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log("✅ Connection established!");
    console.log(
      "📊 Tables found:",
      tables.map((r) => r.table_name),
    );

    // Check products count
    const products = await sql`SELECT count(*)::int AS count FROM products`;
    console.log("📦 Products count:", products[0].count);
  } catch (error: unknown) {
    console.error(
      "❌ Connection Failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

testConnection();
