import 'dotenv/config';
import { db } from '../src/lib/db';
import {
  roles, 
  permissions, 
  rolesPermissions, 
  users, 
  usersRoles, 
  brands, 
  categories, 
  medias, 
  products, 
  productMedias, 
  productSpecifications,
  portfolios, 
  portfolioMedias 
} from '@/db/schema';import { sql } from 'drizzle-orm';
import { hash } from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Roles & Permissions
  console.log('...Creating Roles & Permissions');
  await db.insert(permissions).values([
    { id: 1, slug: 'view_dashboard', description: 'Dapat melihat dashboard admin' },
    { id: 2, slug: 'manage_products', description: 'Dapat mengelola produk (CRUD)' },
    { id: 3, slug: 'manage_users', description: 'Dapat mengelola pengguna dan peran' },
    { id: 4, slug: 'manage_categories', description: 'Dapat mengelola kategori produk' },
    { id: 5, slug: 'manage_brands', description: 'Dapat mengelola brand produk' },
    { id: 6, slug: 'manage_portfolios', description: 'Dapat mengelola portofolio proyek' },
    { id: 7, slug: 'manage_media', description: 'Dapat mengelola galeri media universal' },
    { id: 8, slug: 'view_audit_logs', description: 'Dapat melihat catatan audit sistem' },
  ]).onDuplicateKeyUpdate({ set: { slug: sql`values(slug)`, description: sql`values(description)` } });

  await db.insert(roles).values([
    { id: 1, name: 'super_admin', description: 'Akses Penuh Sistem' },
    { id: 2, name: 'editor', description: 'Hanya dapat mengelola konten (Produk, Portfolio, dll)' }
  ]).onDuplicateKeyUpdate({ set: { name: sql`values(name)`, description: sql`values(description)` } });

  await db.insert(rolesPermissions).values([
    { rolesId: 1, permissionsId: 1 }, { rolesId: 1, permissionsId: 2 }, { rolesId: 1, permissionsId: 3 },
    { rolesId: 1, permissionsId: 4 }, { rolesId: 1, permissionsId: 5 }, { rolesId: 1, permissionsId: 6 },
    { rolesId: 1, permissionsId: 7 }, { rolesId: 1, permissionsId: 8 },
  ]).onDuplicateKeyUpdate({ set: { rolesId: 1 } });

  await db.insert(rolesPermissions).values([
    { rolesId: 2, permissionsId: 1 }, { rolesId: 2, permissionsId: 2 }, { rolesId: 2, permissionsId: 4 },
    { rolesId: 2, permissionsId: 5 }, { rolesId: 2, permissionsId: 6 }, { rolesId: 2, permissionsId: 7 },
  ]).onDuplicateKeyUpdate({ set: { rolesId: 2 } });

  // 2. Admin User
  console.log('...Creating Admin User');
  const passwordHash = await hash('password123', 10);
  
  await db.insert(users).values({
    id: 1,
    username: 'admin',
    email: 'admin@padelix.co.id',
    passwordHash: passwordHash, 
    isActive: true,
    lastLogin: new Date(),
  }).onDuplicateKeyUpdate({ set: { username: 'admin', passwordHash: passwordHash } });

  await db.insert(usersRoles).values({ usersId: 1, rolesId: 1 }).onDuplicateKeyUpdate({ set: { rolesId: 1 } });

  // 3. Brands & Categories
  console.log('...Creating Brands & Categories');
  await db.insert(brands).values({ 
    id: 1, 
    name: 'Padelix Indonesia', 
    slug: 'padelix-indonesia', 
    website: 'https://padelix.co.id',
    logoUrl: '/uploads/brands/padelix/Padelix Word With Moto And Transparent Background.png'
  }).onDuplicateKeyUpdate({ set: { name: 'Padelix Indonesia' } });
  
  await db.insert(categories).values([
    { id: 1, name: 'Courts', slug: 'courts', description: 'Padel Courts', imageUrl: '/uploads/courts/padelix-panorama-standard/padelix-panorama-standard-04a-2.jpg' },
  ]).onDuplicateKeyUpdate({ set: { name: sql`values(name)`, description: sql`values(description)`, imageUrl: sql`values(image_url)` } });

  // 4. Medias (Centralized Assets)
  console.log('...Seeding Media Assets');
  await db.delete(productMedias);
  await db.delete(portfolioMedias);
  await db.delete(medias);

  const mediaAssets = [
    // --- Panorama Standard ---
    { id: 1, name: 'Panorama Standard Thumb', fileKey: 'p-std-thumb', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-panorama-standard/padelix-panorama-standard-04a-thumbnail.jpg', metadata: { folder: 'courts/padelix-panorama-standard' } },
    { id: 2, name: 'Panorama Standard 1', fileKey: 'p-std-1', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-panorama-standard/padelix-panorama-standard-04a-1.jpg', metadata: { folder: 'courts/padelix-panorama-standard' } },
    { id: 3, name: 'Panorama Standard 2', fileKey: 'p-std-2', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-panorama-standard/padelix-panorama-standard-04a-2.jpg', metadata: { folder: 'courts/padelix-panorama-standard' } },

    // --- Panorama Super ---
    { id: 4, name: 'Panorama Super Thumb', fileKey: 'p-super-thumb', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-panorama-super/padelix-panorama-super-06a-thumbnail.jpg', metadata: { folder: 'courts/padelix-panorama-super' } },
    { id: 5, name: 'Panorama Super 1', fileKey: 'p-super-1', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-panorama-super/padelix-panorama-super-06a-1.jpg', metadata: { folder: 'courts/padelix-panorama-super' } },
    { id: 6, name: 'Panorama Super 2', fileKey: 'p-super-2', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-panorama-super/padelix-panorama-super-06a-2.jpg', metadata: { folder: 'courts/padelix-panorama-super' } },

    // --- WPT Standard ---
    { id: 7, name: 'WPT Standard Thumb', fileKey: 'p-wpt-thumb', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-wpt-standard/padelix-wpt-standard-01p-thumbnail.jpeg', metadata: { folder: 'courts/padelix-wpt-standard' } },
    { id: 8, name: 'WPT Standard 1', fileKey: 'p-wpt-1', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/courts/padelix-wpt-standard/padelix-wpt-standard-01p-1.jpeg', metadata: { folder: 'courts/padelix-wpt-standard' } },
    { id: 9, name: 'WPT Standard 2', fileKey: 'p-wpt-2', type: 'image', provider: 'local', mimeType: 'image/png', fileSize: 1000, url: '/uploads/courts/padelix-wpt-standard/padelix-wpt-standard-01p-2.png', metadata: { folder: 'courts/padelix-wpt-standard' } },

    // --- Portfolios: Grogol ---
    { id: 10, name: 'Grogol 1', fileKey: 'grogol-1', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Grogol, Jakarta Barat/IMG-20250718-WA0089.jpg', metadata: { folder: 'portofolios/Grogol, Jakarta Barat' } },
    { id: 11, name: 'Grogol 2', fileKey: 'grogol-2', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Grogol, Jakarta Barat/IMG-20250718-WA0083.jpg', metadata: { folder: 'portofolios/Grogol, Jakarta Barat' } },
    { id: 12, name: 'Grogol 3', fileKey: 'grogol-3', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Grogol, Jakarta Barat/IMG-20250718-WA0085.jpg', metadata: { folder: 'portofolios/Grogol, Jakarta Barat' } },
    { id: 13, name: 'Grogol 4', fileKey: 'grogol-4', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Grogol, Jakarta Barat/IMG-20250718-WA0084.jpg', metadata: { folder: 'portofolios/Grogol, Jakarta Barat' } },

    // --- Portfolios: Untar ---
    { id: 14, name: 'Untar 1', fileKey: 'untar-1', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Universitas Tarua Negara/WhatsApp Image 2025-07-18 at 09.28.50_5c132785.jpg', metadata: { folder: 'portofolios/Universitas Tarua Negara' } },
    { id: 15, name: 'Untar 2', fileKey: 'untar-2', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Universitas Tarua Negara/WhatsApp Image 2025-07-18 at 09.26.41_b30fa40c.jpg', metadata: { folder: 'portofolios/Universitas Tarua Negara' } },
    { id: 16, name: 'Untar 3', fileKey: 'untar-3', type: 'image', provider: 'local', mimeType: 'image/jpeg', fileSize: 1000, url: '/uploads/portofolios/Universitas Tarua Negara/WhatsApp Image 2025-07-18 at 09.26.38_e842a8ee.jpg', metadata: { folder: 'portofolios/Universitas Tarua Negara' } },
  ];

  // @ts-expect-error - DB insert mapping issue
  await db.insert(medias).values(mediaAssets);

  // 5. Products
  console.log('...Creating Products');
  await db.delete(products);

  await db.insert(products).values([
    {
      id: 1,
      brandId: 1,
      categoryId: 1,
      createdBy: 1,
      name: 'Padelix Panorama Court',
      slug: 'padelix-panorama-court',
      description: 'The Padelix Panorama Court features a modern design with high visibility and durability, suitable for clubs and private residences.',
      basePrice: 220000000.00,
      showPrice: false,
      isActive: true,
      isFeatured: true,
    },
    {
      id: 2,
      brandId: 1,
      categoryId: 1,
      createdBy: 1,
      name: 'Padelix Super Panorama Court',
      slug: 'padelix-super-panorama-court',
      description: 'Our premium offering, the Super Panorama Court provides unobstructed views and top-tier materials for the ultimate playing experience.',
      basePrice: 250000000.00,
      showPrice: false,
      isActive: true,
      isFeatured: true,
    },
    {
        id: 3,
        brandId: 1,
        categoryId: 1,
        createdBy: 1,
        name: 'Padelix World Padel Tour (WPT) Court',
        slug: 'padelix-wpt-court',
        description: 'Official tournament grade specifications. Designed for world-class performance and competition.',
        basePrice: 280000000.00,
        showPrice: true,
        isActive: true,
        isFeatured: true,
    }
  ]);

  await db.insert(productMedias).values([
    // Panorama Standard
    { productId: 1, mediaId: 1, isPrimary: true, sortOrder: 1 },
    { productId: 1, mediaId: 2, isPrimary: false, sortOrder: 2 },
    { productId: 1, mediaId: 3, isPrimary: false, sortOrder: 3 },
    
    // Panorama Super
    { productId: 2, mediaId: 4, isPrimary: true, sortOrder: 1 },
    { productId: 2, mediaId: 5, isPrimary: false, sortOrder: 2 },
    { productId: 2, mediaId: 6, isPrimary: false, sortOrder: 3 },

    // WPT
    { productId: 3, mediaId: 7, isPrimary: true, sortOrder: 1 },
    { productId: 3, mediaId: 8, isPrimary: false, sortOrder: 2 },
    { productId: 3, mediaId: 9, isPrimary: false, sortOrder: 3 }
  ]);

  // Specifications
  await db.delete(productSpecifications);
  await db.insert(productSpecifications).values([
    { productId: 1, specKey: 'Construction', specValue: 'Standard Panorama' },
    { productId: 1, specKey: 'Glass', specValue: '12mm Tempered' },
    { productId: 2, specKey: 'Construction', specValue: 'Reinforced Super Panorama' },
    { productId: 2, specKey: 'Glass', specValue: '12mm Tempered Xtreme' },
    { productId: 3, specKey: 'Construction', specValue: 'WPT Official' },
    { productId: 3, specKey: 'Glass', specValue: '12mm Tournament Grade' },
  ]);
  
  // Create Portfolios
  console.log("...Creating Portfolios");
  await db.insert(portfolios).values([
    {
      id: 1,
      createdBy: 1,
      title: 'Grogol, Jakarta Barat',
      slug: 'grogol-jakarta-barat',
      location: 'Jakarta Barat',
      description: 'Successful installation of Padelix courts in the heart of West Jakarta.',
      isActive: true,
      isFeatured: true,
      completionDate: new Date('2025-07-01'),
    },
    {
      id: 2,
      createdBy: 1,
      title: 'Universitas Tarumanagara',
      slug: 'universitas-tarumanagara',
      location: 'Jakarta',
      description: 'Modern campus facility installation for students and staff.',
      isActive: true,
      isFeatured: true,
      completionDate: new Date('2025-06-15'),
    }
  ]);

  await db.insert(portfolioMedias).values([
    // Grogol
    { portfolioId: 1, mediaId: 10, isPrimary: true, sortOrder: 1 },
    { portfolioId: 1, mediaId: 11, isPrimary: false, sortOrder: 2 },
    { portfolioId: 1, mediaId: 12, isPrimary: false, sortOrder: 3 },
    { portfolioId: 1, mediaId: 13, isPrimary: false, sortOrder: 4 },
    // Untar
    { portfolioId: 2, mediaId: 14, isPrimary: true, sortOrder: 1 },
    { portfolioId: 2, mediaId: 15, isPrimary: false, sortOrder: 2 },
    { portfolioId: 2, mediaId: 16, isPrimary: false, sortOrder: 3 },
  ]);

  console.log('✅ Seeding Complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
