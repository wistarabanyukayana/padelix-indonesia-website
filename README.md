# Padelix Indonesia Website

A unified fullstack web application for Padelix Indonesia, built with Next.js 16, Drizzle ORM, and Neon PostgreSQL, deployed on Cloudflare Workers (via OpenNext). This version represents a complete architectural shift from the previous Next.js/Strapi decoupled setup to a more efficient, single-repo fullstack solution.

> **Note:** This project was commissioned by Padelix Indonesia and was fully designed, developed, and deployed by Wistara Banyu Kayana. It is featured in my professional portfolio.

---

## Production Status

- **Live:** [https://padelix.co.id](https://padelix.co.id)
- **Current Version:** 3.1.1 (Performance, authentication, and deployment optimizations)
- **Previous Version:** 3.1.0 (Cloudflare Workers migration and QoL)

---

## Table of Contents

- [Architecture Update (v2.0.0)](#architecture-update-v200)
- [Project Purpose](#project-purpose)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Media & Webhooks](#media--webhooks)
- [Deployment](#deployment)
- [Changelog](#changelog)

---

## Previous Architecture Update History (v2.0.0)

Version 2.0.0 marks a significant milestone in the project's evolution. We have migrated from a decoupled architecture (Next.js frontend + Strapi CMS) to a **unified fullstack Next.js application**.

**Why the change?**

- **Performance:** Reduced network overhead between frontend and backend.
- **Developer Experience:** Single codebase, shared types, and unified deployment.
- **Resource Efficiency:** Better suited for environments with process and memory limitations (like shared hosting).
- **Customization:** Full control over the Admin Dashboard and Backend logic using Drizzle ORM.

---

## Project Purpose

This project provides a comprehensive digital platform for Padelix Indonesia:

- **B2B (Business-to-Business):** Partner portals and business client information.
- **B2C (Business-to-Consumer):** Product catalog, portfolio showcase, and direct engagement.
- **Admin Dashboard:** A custom-built CMS for managing products, categories, brands, portfolios, and media.

---

## Tech Stack

- **Framework:** Next.js 16+ (App Router, Cache Components / PPR)
- **Database:** Neon PostgreSQL (serverless)
- **ORM:** Drizzle ORM
- **Authentication:** Custom JWT-based auth (`jose`) with PostgreSQL `pgcrypto` bcrypt
- **Styling:** Tailwind CSS 4+
- **Typography:** Anton (display) + Archivo (body) via `next/font`
- **Icons:** Lucide React, Simple Icons
- **Media:** Cloudinary (Images/Video/Documents)
- **Email:** Resend (Contact form)
- **Notifications:** Sonner (Toasts)
- **Hosting:** Cloudflare Workers (via OpenNext)

---

## Design System

The public site follows a **"court-side athletic editorial"** direction:

- Dark, green-cast court surfaces (`court-950/900/800` tokens) alternating with light catalog sections; lime (`brand-green`) as the sharp accent.
- Poster-style display typography (Anton, `.display-1/2/3`) paired with Archivo body text; editorial `.kicker` section labels.
- Padel-specific decor: court-line motifs (`CourtLines`), glass-wall mesh texture (`.bg-mesh`), and a lime marquee tape strip.
- Scroll reveals via the `Reveal` component (IntersectionObserver, respects `prefers-reduced-motion`).
- WhatsApp-first conversion: split hero CTAs (court construction vs. catalog), prefilled product inquiries, and a mobile sticky order bar on product pages.

All tokens live in `src/app/globals.css` under `@theme`.

---

## Prerequisites

- **Node.js v22+**
- **pnpm 11**
- **Neon PostgreSQL Database** (or any PostgreSQL connection string)

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

Create a `.env` file in the root directory (see `.env.example`):

```env
DATABASE_URL="postgresql://<user>:<password>@<endpoint_hostname>.neon.tech:<port>/<dbname>?sslmode=require&channel_binding=require"
SESSION_SECRET=your-long-random-session-secret

# Cloudinary Image + Video + Documents
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-public-name

# Resend Configuration (For Contact Form)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=website@padelix.co.id
BUSINESS_EMAIL=business@padelix.co.id

# Site Configuration
NEXT_DEV_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://padelix.co.id
NEXT_PUBLIC_META_PIXEL_ID=your-meta-pixel-id
```

### 4. Initialize Database

```bash
pnpm exec drizzle-kit migrate
pnpm db:seed # Seeds initial roles, admin user, and sample data
```

Use `pnpm db:reset` only when you intentionally want to drop and recreate all tables.

### 5. Run Development Server

```bash
pnpm dev
```

- **Frontend:** `http://localhost:3000`
- **Admin Login:** `http://localhost:3000/admin/login`

---

## Scripts

- `pnpm dev`: Start Next.js in development mode.
- `pnpm build`: Create a production build.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint checks.
- `pnpm check`: Run TypeScript checks.
- `pnpm preview`: Build and preview the Cloudflare Worker locally.
- `pnpm deploy`: Build and deploy the Cloudflare Worker.
- `pnpm exec drizzle-kit migrate`: Apply pending PostgreSQL migrations.
- `pnpm db:reset`: Clear and re-push the database schema.
- `pnpm db:seed`: Seed the database with initial data.

---

## Media

All media (images, video, documents) is stored and delivered via **Cloudinary**. Uploads from the admin dashboard go straight to Cloudinary; images are optimized (WebP) and served from `res.cloudinary.com`.

---

## Deployment

The site is deployed on **Cloudflare Workers** through GitHub Actions. A push to `main` runs CI, applies pending Neon PostgreSQL migrations, then deploys the OpenNext Worker. Migration failure stops deployment.

Follow [RELEASE.md](./RELEASE.md) for the required versioning, documentation, verification, tagging, smoke-test, and rollback process.

1. **Manual deployment:**
   ```bash
   pnpm exec drizzle-kit migrate
   pnpm deploy
   ```
2. **Local Preview:**
   To test the production-built bundle locally using Wrangler/Miniflare:
   ```bash
   pnpm preview
   ```
3. **Environment Variables:**
   For local development/preview, variables are read from `.dev.vars` (same keys as `.env.example`).
   For production deployment, upload variables/secrets using:
   ```bash
   pnpm exec wrangler secret put <SECRET_NAME>
   ```

> **Note:** See [docs/MIGRATION-RUNBOOK.md](./docs/MIGRATION-RUNBOOK.md) for the full infrastructure migration history (Rumahweb → Vercel/Neon/Cloudinary).

---

## Ops Notes

### CI Build Requirements

This project runs `lint`, `check`, and `build` in CI. The build step is **conditional** and will only run if `DATABASE_URL` is set in CI secrets. If you want CI to build, add these secrets:

- `DATABASE_URL` (staging or read-only DB)
- `NEXT_PUBLIC_SITE_URL`
- `SESSION_SECRET`

Without `DATABASE_URL`, CI will still run lint and type checks but skip the build step.

Additionally, the CI pipeline is reused by the automated release workflow (`release.yml`) which runs the same checks on version tags and auto-publishes the matching GitHub Release.

### Full-Reload Redirects After Server Actions (Legacy Workaround)

On the previous shared-hosting setup (cPanel + LiteSpeed) we observed intermittent client-side exceptions after auth or form submits caused by stale chunk IDs. The workaround is still in place:

- Server actions return `{ redirectTo: "/admin/..." }` instead of `redirect(...)`.
- Client forms detect `redirectTo` and call `window.location.assign(...)`.

It is harmless on Cloudflare Workers; remove it only after verifying every server-action redirect path.

---

## Audit Logging

Version 2.0.0 includes a comprehensive **Audit Logging** system. Every administrative action (login, content creation, updates, and deletions) is logged with:

- Timestamp
- Performing user (and a snapshot of their username)
- Action type
- Affected entity ID
- Metadata (IP Address, User Agent)
- Additional context/details

Admin users with the `view_audit_logs` permission can view these records in the **Audit** section of the dashboard.

---

## 🚀 Recent Updates

**Latest Version: [v3.1.1](https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v3.1.1)** (2026-07-24)

- **Database-backed bcrypt:** Login verification and password hashing now use PostgreSQL `pgcrypto`, with a guarded, self-testing migration.
- **Lower session overhead:** Request-scoped session reuse avoids repeated validation, and admin refreshes are throttled to once every 12 hours per tab.
- **Batched database access:** Admin lists and the public catalog replace N+1 and duplicate media queries with batched joins.
- **Faster product pages:** Product detail data is request-memoized and related records load concurrently.
- **Smaller client bundles:** Image compression loads on demand and Meta Pixel code is excluded from admin route entries.
- **Safer deployment:** GitHub Actions applies migrations before deploying the Cloudflare Worker.

**Previous Version: [v3.1.0](https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v3.1.0)** (2026-07-02)

- **Cloudflare Workers migration:** Moved hosting from Vercel to Cloudflare Workers using OpenNext.
- **Optimized caching and bindings:** Added R2-backed incremental cache, worker self-references, and Cloudflare Images bindings.
- **Cloudflare-compatible authentication routing:** Removed legacy middleware redirects and added safe runtime handling for `/admin/login`.
- **Automated sitemap:** Included `/privacy`, `/terms`, and active product routes.

> 📄 **View the full history in [CHANGELOG.md](./CHANGELOG.md)**
