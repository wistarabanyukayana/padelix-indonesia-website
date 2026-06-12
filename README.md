# Padelix Indonesia Website v2.2.3

A unified fullstack web application for Padelix Indonesia, built with Next.js 16, Drizzle ORM, and Neon PostgreSQL, deployed on Vercel. This version represents a complete architectural shift from the previous Next.js/Strapi decoupled setup to a more efficient, single-repo fullstack solution.

> **Note:** This project was commissioned by Padelix Indonesia and was fully designed, developed, and deployed by Wistara Banyu Kayana. It is featured in my professional portfolio.

---

## Production Status

- **Live:** [https://padelix.co.id](https://padelix.co.id)
- **Current Version:** 2.2.3 (Unified Fullstack)
- **Previous Version:** 1.2.0 (Next.js + Strapi)

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

## Architecture Update (v2.0.0)

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
- **Authentication:** Custom JWT-based Auth (jose, bcryptjs)
- **Styling:** Tailwind CSS 4+
- **Typography:** Anton (display) + Archivo (body) via `next/font`
- **Icons:** Lucide React, Simple Icons
- **Media:** Cloudinary (Images/Video/Documents)
- **Email:** Resend (Contact form)
- **Notifications:** Sonner (Toasts)
- **Hosting:** Vercel

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

- **Node.js v20+**
- **pnpm** (Recommended package manager)
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
pnpm db:reset # Warning: This drops all tables
pnpm db:seed  # Seeds initial roles, admin user, and sample data
```

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
- `pnpm db:reset`: Clear and re-push the database schema.
- `pnpm db:seed`: Seed the database with initial data.

---

## Media

All media (images, video, documents) is stored and delivered via **Cloudinary**. Uploads from the admin dashboard go straight to Cloudinary; images are optimized (WebP) and served from `res.cloudinary.com`.

---

## Deployment

The site is deployed on **Vercel** (with Neon PostgreSQL, Cloudinary, and Resend; DNS via Cloudflare):

1. Push to `main` — Vercel builds and deploys automatically.
2. Preview deployments are created for branches/PRs.
3. Environment variables are managed in the Vercel project settings (same keys as `.env.example`).

> **Note:** See [docs/MIGRATION-RUNBOOK.md](./docs/MIGRATION-RUNBOOK.md) for the full infrastructure migration history (Rumahweb → Vercel/Neon/Cloudinary).

---

## Ops Notes

### CI Build Requirements

This project runs `lint`, `check`, and `build` in CI. The build step is **conditional** and will only run if `DATABASE_URL` is set in CI secrets. If you want CI to build, add these secrets:

- `DATABASE_URL` (staging or read-only DB)
- `NEXT_PUBLIC_SITE_URL`

Without `DATABASE_URL`, CI will still run lint and type checks but skip the build step.

### Full-Reload Redirects After Server Actions (Legacy Workaround)

On the previous shared-hosting setup (cPanel + LiteSpeed) we observed intermittent client-side exceptions after auth or form submits caused by stale chunk IDs. The workaround is still in place:

- Server actions return `{ redirectTo: "/admin/..." }` instead of `redirect(...)`.
- Client forms detect `redirectTo` and call `window.location.assign(...)`.

It is harmless on Vercel; remove it only if you are confident no deployment target needs it.

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

**Latest Version: [v2.2.3]** (2026-01-26)

- WebP optimization for image uploads and sync backfill for legacy assets.
- CSP aligned with Mux playback/data requirements for reliable streaming.
- AppImage loading indicator + responsive `sizes` across public/admin UIs.
- Optimized header/404 wordmark with responsive sizing.

> 📄 **View the full history in [CHANGELOG.md](./CHANGELOG.md)**
