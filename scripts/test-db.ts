import 'dotenv/config';
import mysql from 'mysql2/promise';

async function testConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is missing in .env');
    process.exit(1);
  }

  // Mask password for safe logging
  const maskedUrl = url.replace(/:[^:@]+@/, ':****@');
  console.log(`🔌 Testing connection to: ${maskedUrl}`);

  try {
    const conn = await mysql.createConnection({ uri: url });
    console.log('✅ Connection established!');

    const [rows] = await conn.query('SHOW TABLES');
    console.log('📊 Tables found:', (rows as Record<string, unknown>[]).map((r) => Object.values(r)[0]));

    // Check products count
    const [products] = await conn.query('SELECT count(*) as count FROM products');
    console.log('📦 Products count:', (products as Record<string, unknown>[])[0].count);

    await conn.end();
  } catch (error: unknown) {
    console.error('❌ Connection Failed:', error instanceof Error ? error.message : error);
  }
}

testConnection();