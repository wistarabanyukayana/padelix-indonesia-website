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

### 🚀 Major Release
*   **Video & Audio Support:** Added support for video (Mux) and audio in the portfolio section.
*   **Image Zoom:** Added lightbox/zoom functionality to portfolio items.
*   **Security:** Updated Content Security Policy (CSP) to allow Mux video streaming.
*   **Performance:** Improved LCP by adding priority loading to the first image in the portfolio carousel.

### 📚 Documentation
*   Comprehensive update of README files with deployment strategies (cPanel vs alternatives).
*   Added local development guides for Mux Webhooks.

---

## [1.1.0] - 2026-01-07

### ✨ Features
*   **WhatsApp Button:** Added a floating WhatsApp chat button.
*   **CMS Admin:** Modified Strapi Admin panel for production readiness.
*   **Role Permissions:** Fixed Public Role data fetching issues for media objects.

### 🛠️ Chores
*   Updated `.vscode` configuration.
*   Refactored folder structure and adjusted file organization.

---

## [1.0.0] - 2025-08-08

### 🎉 Initial Release
*   **Initial Launch:** Fullstack application with Next.js Frontend and Strapi Backend.
*   **Features:** Basic B2B and B2C informational pages.
*   **Architecture:** Monorepo structure deployed on Shared Hosting (cPanel).