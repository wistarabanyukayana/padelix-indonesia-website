-- Super Admin Seed
-- Creates/Updates Permissions, Role, and Admin User (password: password123)

-- 1. Create Permissions
INSERT INTO permissions (id, slug, description) VALUES
(1, 'view_dashboard', 'Dapat melihat dashboard admin'),
(2, 'manage_products', 'Dapat mengelola produk (CRUD)'),
(3, 'manage_users', 'Dapat mengelola pengguna dan peran'),
(4, 'manage_categories', 'Dapat mengelola kategori produk'),
(5, 'manage_brands', 'Dapat mengelola brand produk'),
(6, 'manage_portfolios', 'Dapat mengelola portofolio proyek'),
(7, 'manage_media', 'Dapat mengelola galeri media universal'),
(8, 'view_audit_logs', 'Dapat melihat catatan audit sistem')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- 2. Create Super Admin Role
INSERT INTO roles (id, name, description) VALUES
(1, 'super_admin', 'Akses Penuh Sistem')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Link Role to Permissions
INSERT INTO roles_permissions (roles_id, permissions_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8)
ON DUPLICATE KEY UPDATE roles_id=VALUES(roles_id);

-- 4. Create Admin User
-- Password: password123 (bcrypt hash)
INSERT INTO users (id, username, email, password_hash, is_active, last_login, created_at, updated_at) VALUES
(1, 'admin', 'admin@padelix.co.id', '$2b$10$ge0lfiQ0J2320WKM/IFeW.F9cOioj2l3I6zgaKYReG1tQM/R28ihW', 1, NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- 5. Link User to Role
INSERT INTO users_roles (users_id, roles_id) VALUES
(1, 1)
ON DUPLICATE KEY UPDATE roles_id=VALUES(roles_id);