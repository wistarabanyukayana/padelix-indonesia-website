# Padelix Indonesia Website v2.0.1

A unified fullstack web application for Padelix Indonesia, built with Next.js 15+, Drizzle ORM, and MySQL. This version represents a complete architectural shift from the previous Next.js/Strapi decoupled setup to a more efficient, single-repo fullstack solution.

> **Note:** This project was commissioned by Padelix Indonesia and was fully designed, developed, and deployed by Wistara Banyu Kayana. It is featured in my professional portfolio.

---

## Production Status

-   **Live:** [https://padelix.co.id](https://padelix.co.id)
-   **Current Version:** 2.0.1 (Unified Fullstack)
-   **Previous Version:** 1.2.0 (Next.js + Strapi)

---

## Table of Contents

-   [Architecture Update (v2.0.0)](#architecture-update-v200)
-   [Project Purpose](#project-purpose)
-   [Tech Stack](#tech-stack)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Scripts](#scripts)
-   [Media & Webhooks](#media--webhooks)
-   [Deployment](#deployment)
-   [Changelog](#changelog)

---

## Architecture Update (v2.0.0)

Version 2.0.0 marks a significant milestone in the project's evolution. We have migrated from a decoupled architecture (Next.js frontend + Strapi CMS) to a **unified fullstack Next.js application**.

**Why the change?**
-   **Performance:** Reduced network overhead between frontend and backend.
-   **Developer Experience:** Single codebase, shared types, and unified deployment.
-   **Resource Efficiency:** Better suited for environments with process and memory limitations (like shared hosting).
-   **Customization:** Full control over the Admin Dashboard and Backend logic using Drizzle ORM.

---

## Project Purpose

This project provides a comprehensive digital platform for Padelix Indonesia:
-   **B2B (Business-to-Business):** Partner portals and business client information.
-   **B2C (Business-to-Consumer):** Product catalog, portfolio showcase, and direct engagement.
-   **Admin Dashboard:** A custom-built CMS for managing products, categories, brands, portfolios, and media.

---

## Tech Stack

-   **Framework:** Next.js 16+ (App Router)
-   **Database:** MariaDB
-   **ORM:** Drizzle ORM
-   **Authentication:** Custom JWT-based Auth (jose, bcryptjs)
-   **Styling:** Tailwind CSS 4+
-   **Icons:** Lucide React, Simple Icons
-   **Media:** Mux (Video), Local File System (Images/Docs)
-   **Notifications:** Sonner (Toasts)

---

## Prerequisites

-   **Node.js v20+**
-   **pnpm** (Recommended package manager)
-   **MariaDB Database**

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/wistarabanyukayana/padelix-indonesia-website.git
cd padelix-indonesia-website
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL='mysql://user:password@localhost:3306/padelix_db'
SESSION_SECRET='your-long-random-session-secret'

# Mux Configuration
MUX_TOKEN_ID='your-mux-token-id'
MUX_TOKEN_SECRET='your-mux-token-secret'
MUX_WEBHOOK_SECRET='your-mux-webhook-secret'

# SMTP Configuration
SMTP_HOST='your-smtp-host'
SMTP_PORT='587'
SMTP_USER='your-smtp-username'
SMTP_PASS='your-smtp-password'
SMTP_FROM='website@padelix.co.id'
BUSINESS_EMAIL='business@padelix.co.id'

# Site Configuration
NEXT_PUBLIC_SITE_URL='http://localhost:3000'
```

### 4. Initialize Database

```bash
pnpm db:reset # Warning: This drops all tables
pnpm db:seed  # Seeds initial roles, admin user, and sample data
```

### 5. Run Development Server

```bash
pnpm dev
```

-   **Frontend:** `http://localhost:3000`
-   **Admin Login:** `http://localhost:3000/admin/login`

---

## Scripts

-   `pnpm dev`: Start Next.js in development mode.
-   `pnpm build`: Create a production build.
-   `pnpm start`: Start the production server.
-   `pnpm lint`: Run ESLint checks.
-   `pnpm db:reset`: Clear and re-push the database schema.
-   `pnpm db:seed`: Seed the database with initial data.

---

## Media & Webhooks

### Mux Integration
Videos are processed via Mux for optimal streaming performance.

### Local Webhook Testing (Smee.io)
To receive status updates from Mux (e.g., when a video is ready) during local development:

1.  **Install Smee Client:**
    ```bash
    pnpm install --global smee-client
    ```
2.  **Start Smee Tunnel:**
    ```bash
    smee --url https://smee.io/YOUR_CUSTOM_ID --target http://localhost:3000/api/webhooks/mux
    ```
    or
    ```bash
    smee --target http://localhost:3000/api/webhooks/mux
    ```
3.  **Configure Mux Dashboard:**
    Add your `https://smee.io/YOUR_CUSTOM_ID` URL as a webhook notification endpoint in the Mux Dashboard settings.

---

## Deployment (Simplified)

We have streamlined the deployment process into a single command that prepares a production-ready artifact.

### 1. Prepare Release (Local)

Run the following command in your local development environment:

```bash
pnpm package
```

This will:
1.  Run linting and build the Next.js application.
2.  Create a `./release` folder containing:
    -   The Standalone Server (`server.js`).
    -   All required assets (`public`, `.next/static`).
    -   A `package.json` optimized for production install.
    -   **Database Scripts:** `database/` containing schema dumps and `seed_super_admin.sql`.
    -   **Environment:** Automatically copies `.env.prod` to `.env` (if it exists).

### 2. Deploy to Server

1.  **Upload:** Transfer the entire `release` folder to your server (e.g., `public_html` or `/var/www/padelix`).
2.  **Install:** Run `npm install` inside the folder on the server (installs production dependencies only).
3.  **Start:** Run `node server.js` (or configure PM2/cPanel to point to `server.js`).

> **Note:** See the generated `DEPLOY_README.md` inside the `release` folder for specific details.

### Production Note (cPanel/LiteSpeed)

On the shared cPanel + LiteSpeed environment, we observed intermittent client-side exceptions after auth or form submits (e.g., login/logout/create). The browser requested stale chunk IDs that no longer existed, and a hard refresh fixed it. The current workaround is to force a full page reload after these server actions:

- Server actions return `{ redirectTo: "/admin/..." }` instead of `redirect(...)`.
- Client forms detect `redirectTo` and call `window.location.assign(...)`.

If you remove this behavior, the issue may return in that hosting setup.

### File Persistence
Ensure that `public/uploads` is **persisted** (not overwritten) during subsequent deployments, as it stores user-uploaded media.

---

## Audit Logging

Version 2.0.0 includes a comprehensive **Audit Logging** system. Every administrative action (login, content creation, updates, and deletions) is logged with:
-   Timestamp
-   Performing user (and a snapshot of their username)
-   Action type
-   Affected entity ID
-   Metadata (IP Address, User Agent)
-   Additional context/details

Admin users with the `view_audit_logs` permission can view these records in the **Audit** section of the dashboard.

---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

## [2.0.1] - 2026-01-13

### Added
- **Production safety note for shared hosting:** documented a cPanel + LiteSpeed-specific mitigation for intermittent “stale chunk” client-side exceptions after auth and create flows.

### Changed
- **Production workaround (cPanel + LiteSpeed):** server actions no longer call `redirect(...)` directly. Instead, they return a `{ redirectTo }` payload and the client performs a hard navigation via `window.location.assign(...)` after successful auth/create flows.
  - Rationale: when the hosting layer serves mismatched/static chunk references, a full navigation guarantees the browser reloads the correct asset graph.
- **Session/auth structure:** introduced a dedicated `src/lib/session.ts` (JWT cookie creation/decrypt/update/delete) and shifted login/logout server actions to use `createSession()` / `deleteSession()` for clearer separation of concerns.
- **Admin shell rendering:** moved auth+nav assembly into `src/app/admin/(dashboard)/template.tsx`, leaving `layout.tsx` minimal. This better matches Next.js App Router patterns for auth-gated UI composition.
- **Middleware routing:** rewired the proxy logic to use the new session decrypt function and a broader matcher that excludes static assets and common binary file types (to avoid unnecessary middleware execution).
- **Build tooling alignment:** removed the explicit `--webpack` build flag in favor of the default `next build` path.

### Fixed
- **Media URL helper hardening:** `getDisplayUrl` now tolerates `null/undefined` and missing URLs without throwing.
- **Modal hydration safety:** avoids relying on a client “mounted” flag and instead guards against `document` being undefined.
- **Cookie hardening:** session cookie flags now include `secure` (in production), `sameSite: "lax"`, and `path: "/"` for more predictable browser behavior.

### Removed
- **Redundant typings:** removed `@types/bcryptjs` (bcryptjs ships its own types).

## [2.0.0] - 2026-01-12

### Added
- **Unified full-stack architecture:** replaced the prior split setup (Next.js frontend + Strapi CMS backend) with a single Next.js App Router codebase serving both public site and admin surface.
- **Database layer:** introduced MariaDB as the primary datastore with Drizzle ORM for typed schema, queries, and migrations.
- **Admin dashboard (custom CMS):** implemented a first-party admin UI to manage:
  - Products, Categories, Brands, Portfolios
  - Users and Roles (permission-based access control)
- **Audit logging:** added a system-wide audit trail for administrative actions to support traceability and operational accountability.
- **Media library:** implemented a unified media system (including improved folder management and batch operations).
- **Mux integration:** added webhook-based automation for media/video status updates.
- **Deployment packaging:** added a `pnpm package` workflow to generate a production artifact (`/release`) suitable for shared hosting/VPS deployments.
- **Production output mode:** configured Next.js standalone output for more portable deployments.
- **UX improvements:** improved mobile usability across the site and admin, and integrated Sonner for non-intrusive notifications.

### Changed
- **Security model:** moved to custom session/auth handling with database-backed enforcement (e.g., immediate lockout when a user is deactivated).
- **Project structure:** consolidated configs and removed workspace-era assumptions to reflect a single-repo full-stack application.

### Removed
- **Strapi dependency surface:** removed legacy Strapi packages, conventions, and related workspace configuration as part of the migration.

## [1.2.0] - 2026-01-07
- **Legacy version (Next.js + Strapi):** See `OLD.md` for details.

[2.0.1]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.2.0
