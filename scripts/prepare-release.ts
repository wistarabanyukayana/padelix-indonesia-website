import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT_DIR, 'release');
const STANDALONE_DIR = path.join(ROOT_DIR, '.next/standalone');
const STATIC_DIR = path.join(ROOT_DIR, '.next/static');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// --- Configuration ---
// Using single quotes and concatenation to avoid backtick issues in the script itself
const SUPER_ADMIN_SQL = [
  '-- Super Admin Seed',
  '-- Creates/Updates Permissions, Role, and Admin User (password: password123)',
  '',
  '-- 1. Create Permissions',
  'INSERT INTO permissions (id, slug, description) VALUES',
  "(1, 'view_dashboard', 'Dapat melihat dashboard admin'),",
  "(2, 'manage_products', 'Dapat mengelola produk (CRUD)'),",
  "(3, 'manage_users', 'Dapat mengelola pengguna dan peran'),",
  "(4, 'manage_categories', 'Dapat mengelola kategori produk'),",
  "(5, 'manage_brands', 'Dapat mengelola brand produk'),",
  "(6, 'manage_portfolios', 'Dapat mengelola portofolio proyek'),",
  "(7, 'manage_media', 'Dapat mengelola galeri media universal'),",
  "(8, 'view_audit_logs', 'Dapat melihat catatan audit sistem')",
  'ON DUPLICATE KEY UPDATE slug=VALUES(slug);',
  '',
  '-- 2. Create Super Admin Role',
  'INSERT INTO roles (id, name, description) VALUES',
  "(1, 'super_admin', 'Akses Penuh Sistem')",
  'ON DUPLICATE KEY UPDATE name=VALUES(name);',
  '',
  '-- 3. Link Role to Permissions',
  'INSERT INTO roles_permissions (roles_id, permissions_id) VALUES',
  '(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8)',
  'ON DUPLICATE KEY UPDATE roles_id=VALUES(roles_id);',
  '',
  '-- 4. Create Admin User',
  '-- Password: password123 (bcrypt hash)',
  'INSERT INTO users (id, username, email, password_hash, is_active, last_login, created_at, updated_at) VALUES',
  "(1, 'admin', 'admin@padelix.co.id', '$2b$10$ge0lfiQ0J2320WKM/IFeW.F9cOioj2l3I6zgaKYReG1tQM/R28ihW', 1, NOW(), NOW(), NOW())",
  'ON DUPLICATE KEY UPDATE username=VALUES(username);',
  '',
  '-- 5. Link User to Role',
  'INSERT INTO users_roles (users_id, roles_id) VALUES',
  '(1, 1)',
  'ON DUPLICATE KEY UPDATE roles_id=VALUES(roles_id);'
].join('\n');

function runCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (error) {
    console.error('❌ Command failed: ' + command);
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

async function main() {
  console.log('🚀 Starting Release Preparation...');

  if (fs.existsSync(RELEASE_DIR)) {
    console.log('🧹 Cleaning previous release...');
    fs.rmSync(RELEASE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(RELEASE_DIR);

  console.log('🏗️  Building project (Lint + Build)...');
  runCommand('pnpm lint');
  runCommand('pnpm build');

  console.log('📂 Copying Standalone files...');
  copyRecursiveSync(STANDALONE_DIR, RELEASE_DIR);

  console.log('🎨 Copying Static assets...');
  const releaseNextStatic = path.join(RELEASE_DIR, '.next/static');
  copyRecursiveSync(STATIC_DIR, releaseNextStatic);

  console.log('🖼️  Copying Public folder...');
  const releasePublic = path.join(RELEASE_DIR, 'public');
  copyRecursiveSync(PUBLIC_DIR, releasePublic);

  console.log('🗄️  Preparing Database files...');
  const releaseDbDir = path.join(RELEASE_DIR, 'database');
  if (!fs.existsSync(releaseDbDir)) fs.mkdirSync(releaseDbDir);
  
  const srcDbDir = path.join(ROOT_DIR, 'database');
  if (fs.existsSync(srcDbDir)) {
      copyRecursiveSync(srcDbDir, releaseDbDir);
  }
  fs.writeFileSync(path.join(releaseDbDir, 'seed_super_admin.sql'), SUPER_ADMIN_SQL);

  // 7. Copy Lockfile & Generate package-lock.json for npm compatibility
  console.log('🔒 Handling lockfiles...');
  if (fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml'))) {
      fs.copyFileSync(path.join(ROOT_DIR, 'pnpm-lock.yaml'), path.join(RELEASE_DIR, 'pnpm-lock.yaml'));
      
      console.log('🔄 Generating package-lock.json for npm compatibility...');
      try {
        // We run this inside the release folder so it uses the release package.json
        execSync('npm install --package-lock-only', { cwd: RELEASE_DIR, stdio: 'ignore' });
        console.log('   ✅ package-lock.json generated.');
      } catch (e) {
        console.warn('   ⚠️ Failed to generate package-lock.json. Production install will rely on package.json semver.');
      }
  } else if (fs.existsSync(path.join(ROOT_DIR, 'package-lock.json'))) {
      fs.copyFileSync(path.join(ROOT_DIR, 'package-lock.json'), path.join(RELEASE_DIR, 'package-lock.json'));
  }

  console.log('🔑 Copying .env.prod as .env...');
  const envProdPath = path.join(ROOT_DIR, '.env.prod');
  if (fs.existsSync(envProdPath)) {
      fs.copyFileSync(envProdPath, path.join(RELEASE_DIR, '.env'));
  }

  const readmeContent = [
    '# Padelix Production Deployment',
    '',
    '## Installation',
    '1. Ensure Node.js v20+ is installed on the server.',
    '2. Run `npm install` in this directory.',
    '3. Environment variables are in `.env`.',
    '',
    '## Database Setup',
    '- Import database SQL files from the `database` folder.',
    '- Execute `database/seed_super_admin.sql` to ensure admin access.',
    '',
    '## Running the Server',
    '```bash',
    'node server.js',
    '```'
  ].join('\n');
  
  fs.writeFileSync(path.join(RELEASE_DIR, 'DEPLOY_README.md'), readmeContent);

  console.log('✅ Release prepared successfully at ./release');
}

main().catch(console.error);
