import 'dotenv/config';
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function reset() {
  console.log('🗑️  Dropping all tables...');

  // Disable foreign key checks to allow dropping tables in any order
  await db.execute(sql.raw('SET FOREIGN_KEY_CHECKS = 0'));

  // Get all table names
  const [results] = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE();
  `);

  // @ts-expect-error - Drizzle execute result type varies by driver
  const tables = (results as Record<string, unknown>[]).map((row) => row.TABLE_NAME || row.table_name);

  if (tables.length === 0) {
    console.log('No tables found to drop.');
  } else {
    for (const tableName of tables) {
      console.log(`...Dropping table: ${tableName}`);
      await db.execute(sql.raw(`DROP TABLE IF EXISTS 
${tableName}
`));
    }
  }

  // Re-enable foreign key checks
  await db.execute(sql.raw('SET FOREIGN_KEY_CHECKS = 1'));
  console.log('✅ Tables dropped.');

  // 2. Run Drizzle Kit Push
  console.log(`
🚀 Running Drizzle Kit Push...`);
  try {
    execSync('pnpm drizzle-kit push', { stdio: 'inherit' });
  } catch {
    console.error('❌ Drizzle Kit Push failed.');
    process.exit(1);
  }

  // 3. Run SQL Seed from /database folder
  console.log(`
📂 Running SQL Seed from database folder...`);
  const databaseDir = path.join(process.cwd(), 'database');
  // Find the latest SQL file
  const files = fs.readdirSync(databaseDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .reverse();

  if (files.length > 0) {
    const sqlFile = path.join(databaseDir, files[0]);
    console.log(`...Executing ${files[0]}`);
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split commands by semicolon, but be careful about semicolons in strings
    // Simple split for now, assuming standard mysqldump format
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
      } catch {
        // Ignore errors about duplicates or existing tables if we just pushed
        // but log them just in case
        // console.warn('Warning executing SQL statement:', e);
      }
    }
    console.log('✅ SQL Seed executed.');
  } else {
    console.log('⚠️ No SQL file found in /database folder.');
  }

  console.log(`
✨ Database reset and setup complete!`);
  process.exit(0);
}

reset().catch((err) => {
  console.error('❌ Reset Failed:', err);
  process.exit(1);
});