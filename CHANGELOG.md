# Changelog

All notable changes to the "Padelix Indonesia Website" project will be documented in this file.

## [3.0.0] - 2026-01-09

### 🚀 Major Architectural Changes
*   **Removed Strapi CMS:** Completely removed the `server/` directory and all Strapi dependencies. The project is no longer a monorepo.
*   **Migrated to Firebase:**
    *   **Database:** Switched to **Firestore** for dynamic content (Products).
    *   **Storage:** Configured **Firebase Storage** for dynamic media assets.
    *   **Admin SDK:** Implemented `firebase-admin` for secure server-side data fetching.
*   **Static Site Generation (SSG):**
    *   Converted the **Homepage** and **Global Layout** (Header/Footer) to "Code-First" static content.
    *   Eliminated database calls for static pages, significantly improving load performance.
    *   Created `src/data/static-content.ts` as the single source of truth for static text and assets.

### ✨ Features
*   **Graceful Empty States:** Added UI placeholders ("Coming Soon") for the Product Carousel and Product List when the database is empty.
*   **Enhanced Footer:** Redesigned the footer to be more compact, dark-themed, and responsive.
*   **Standardized Styling:**
    *   Introduced `rounded-brand` (30px) as a global Tailwind token.
    *   Standardized contact icon sizes and brand colors.
*   **Mobile Menu:** Fixed mobile navigation icon rendering.

### 🛠️ Refactoring
*   **Package Manager:** Migrated from `npm` to **`pnpm`** for faster and more efficient dependency management.
*   **Type Safety:** Refactored all components to use strict TypeScript interfaces, removing `any` casts and Strapi-specific DTOs.
*   **Directory Structure:**
    *   Moved `client/` contents to root.
    *   Organized components into clear `general`, `layout`, `sections` folders.
    *   Cleaned up unused utility files (`fetch-api.ts`, `get-strapi-url.ts`).

### 🐛 Fixes
*   Fixed broken contact form icons by enabling SVG support in Next.js config.
*   Fixed inconsistent border-radius across buttons and inputs.
*   Fixed build errors related to missing environment variables during static generation (mock mode added).

---

## [1.2.0] - 2026-01-07

### 🚀 Features & Fixes
*   **Docs:** Comprehensive update and refinement of all README.md files (root, client, server) with detailed project analysis, deployment strategies (including cPanel and recommended alternatives), and environment variable guidance.
*   **Feat:** Introduced a root `.gitignore` file for improved version control.
*   **Fix:** Updated `server/.gitignore` to explicitly ignore the `.tmp/` directory.
*   **Fix:** Addressed Largest Contentful Paint (LCP) warning by adding priority prop to the first image in `PortofolioContentCarousel`.
*   **Fix:** Updated Content Security Policy in `client/next.config.ts` to allow `*.mux.com` and `blob:` for Mux video streaming.
*   **Docs:** Added Mux Webhooks (Local Development) section to `server/README.md` for local Mux integration setup using SMEE.
*   **Refactor:** Streamlined Getting Started instructions across all README.md files to leverage npm workspaces.
*   **Config:** Updated `server/README.md` and `server/.env.example` to prefer MariaDB/MySQL for local development database setup, matching production.
*   **Fix:** Addressed critical to low-severity CVEs and improved crash handling.
*   **Feat:** Added support for video and audio in the portfolio section.
*   **Feat:** Added image zoom functionality to the portfolio and enhanced security measures.

---

## [1.1.0] - 2026-01-07

### ✨ Features
*   **WhatsApp Button:** Added a floating WhatsApp chat button.
*   **CMS Admin:** Modified Strapi Admin panel for production readiness.
*   **Role Permissions:** Fixed Public Role data fetching issues, enabling successful data reception for media objects.

### 🛠️ Chores
*   Updated `.vscode` configuration.
*   Updated `.gitignore` and uploaded initial images.
*   Refactored folder structure and adjusted file organization.

---

## [1.0.0] - 2025-08-08

### 🎉 Initial Release
*   **Initial Launch:** Fullstack application with Next.js Frontend and Strapi Backend.
*   **Features:** Basic B2B and B2C informational pages.
*   **Architecture:** Monorepo structure deployed on Shared Hosting (cPanel).
