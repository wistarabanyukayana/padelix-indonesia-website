# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

## [Unreleased]

## [3.1.1] - 2026-07-24

### Changed

- **Newest portfolio spotlight:** Homepage portfolios now sort by creation date, placing the newest project in the primary layout position.
- **Free-plan upload path:** Media actions reuse their already-verified session for permission checks and audit logs, and Media Library refreshes once after a batch instead of after every file.
- **Database-backed password hashing:** Login verification and cost-10 bcrypt generation now use PostgreSQL `pgcrypto`; the deployment migration validates existing hashes, converts compatible `$2b$` prefixes, and self-tests `crypt()` before deployment.
- **Request-scoped sessions:** Admin mutations reuse one validated session for permission checks and audit identity; admin navigation refreshes sessions at most once every 12 hours per tab.
- **Batched admin lists:** Product, portfolio, user, and role pages load related media, roles, and permission counts in one batched query instead of per-row queries.
- **Faster public product data:** Product detail requests are memoized, related data loads concurrently, descendant-category lookup is reused, and catalog media loads through one joined query.
- **Smaller client entries:** Image compression loads only when a compressible image is selected, while Meta Pixel code is limited to public routes.
- **Migration-gated deployment:** Production database migrations run after dependency installation and before Cloudflare Worker deployment.

### Fixed

- **Homepage cache invalidation:** Connected the existing Cloudflare KV tag cache so portfolio and featured-product changes invalidate the R2-cached homepage correctly.
- **Portfolio duplicate errors:** PostgreSQL `23505` title and slug conflicts now return safe, specific messages through direct and Drizzle-wrapped errors.

## [3.1.0] - 2026-07-02

### Changed (Infrastructure & Routing)

- **Hosting Target migrated to Cloudflare Workers:** Migrated hosting target from Vercel to Cloudflare Workers (using `@opennextjs/cloudflare` / OpenNext).
- **Cloudflare configuration:** Configured R2-backed incremental cache (`NEXT_INC_CACHE_R2_BUCKET`), worker self-references (`WORKER_SELF_REFERENCE`), and Cloudflare Images (`IMAGES`) bindings in `wrangler.jsonc` and `open-next.config.ts`.
- **Edge Routing / Auth Refactoring:** Removed Next.js middleware-based routing (`src/proxy.ts`) to avoid Edge runtime redirect loops on Cloudflare. Replaced it with a client-side pathname watcher (`AdminSessionRefresh` component) that calls a Server Action to throttle-refresh sessions, and a Server-side redirect inside a Suspense/Connection boundary on `/admin/login`.
- **Sitemap Automation:** Standardized `src/app/sitemap.ts` to dynamically render `/privacy` and `/terms` along with active products, providing zero-maintenance dynamic sitemaps.

### Fixed

- **Google Rich Results schema error:** Dynamically fallback from `Product` to `Service` schema when price display is disabled (e.g., for custom court installations). This resolves the Search Console error "Either 'offers', 'review' or 'aggregateRating' should be specified" by categorizing negotiable court builds as services rather than retail products.

## [3.0.1] - 2026-07-01

### Added

- **Route-level loading skeletons:** every admin dashboard route (dashboard, brands, categories, portfolios, products, roles, users, media, audit logs) and the public site now stream in over layout-matching skeletons (`DashboardSkeleton`, `FormSkeleton`, `ListSkeleton`, `MediaGridSkeleton`, `TreeSkeleton`) instead of a blank screen during navigation.
- **Navigation progress bar:** admin and public headers show an NProgress-style top progress bar while a route transition is in flight.
- **CI/CD pipeline:** `ci.yml` now installs with pnpm instead of a broken `npm ci`; a new `release.yml` runs the same checks on version tags and auto-publishes the matching GitHub Release from this changelog.

### Fixed

- **Unsaved edits wiped on media upload:** uploading media while editing a Product or Portfolio no longer discards unsaved form changes (removed an over-eager `revalidatePath` and fixed an effect dependency that was resyncing on every render instead of only on record change).
- **Duplicated upload/error handling:** Brand, Category, and Media Library upload flows now share the same `@/lib/upload` and `handleUploadError` helpers instead of separately duplicated raw XHR logic.
- **Audit log details popover:** no longer pushes page layout or gets clipped; renders as a properly positioned floating panel.
- **Public header scroll-to-top:** route changes now jump to the top instantly instead of an interrupted smooth-scroll that could leave the new page scrolled to the old page's position.

## [3.0.0] - 2026-06-12

### Infrastructure (Breaking)

- **Hosting migrated to Vercel** (from Rumahweb shared hosting): automatic deployments from `main`, preview deployments per branch; the `pnpm package` release-artifact flow is no longer the deployment path.
- **Database migrated to Neon PostgreSQL** (from MariaDB/MySQL) via the `@neondatabase/serverless` driver.
- **Media migrated to Cloudinary** (from local `public/uploads` + Mux video): images, video, and documents are now stored and delivered through Cloudinary.
- **Transactional email migrated to Resend** (from SMTP) for the contact form.
- **Environment variables changed:** `DATABASE_URL` is now a PostgreSQL connection string; Cloudinary and Resend keys replace the Mux and SMTP configuration — see `.env.example`.
- Full migration procedure documented in [docs/MIGRATION-RUNBOOK.md](./docs/MIGRATION-RUNBOOK.md).

### Added

- **"Court-side athletic editorial" design language:** dark court-green surfaces (`court-950/900/800` tokens), lime accents, Anton display + Archivo body typography, padel court-line motifs (`CourtLines`), glass-mesh texture, and a lime marquee tape strip.
- **Hero revamp:** left-aligned editorial layout, split CTAs (court construction via WhatsApp vs. catalog), and a stats strip driven by real database counts (`getPublicStats`).
- **About process steps:** Perencanaan → Konstruksi → Instalasi cards.
- **Portfolio spotlight grid:** asymmetric editorial layout featuring the first project.
- **Faceted catalog filters:** per-category (rolled up the tree) and per-brand product counts that respect the active search/filters; zero-count entries dimmed; active filters shown as removable chips with a "Hapus Semua" reset.
- **Live product search:** debounced client-side navigation updates results as you type, preserving active filters; no full page reloads.
- **Mobile catalog UX:** search + filters pinned under the header, collapsible filter panel with active-filter badge, auto-close on scroll, swipe-through scrolling.
- **Product page conversion:** variant-aware mobile sticky WhatsApp order bar; global WhatsApp FAB hidden on product pages to avoid CTA overlap.
- **Skeleton loading states:** catalog and product detail stream in over layout-matching skeletons instead of a blank page.
- **Scroll reveals:** IntersectionObserver-based `Reveal` component (respects `prefers-reduced-motion`).

### Changed

- **Category filtering matches descendants:** selecting a parent category now includes products from its subcategories (was exact-match).
- **Typography:** Lato/Inter replaced by Anton (display) + Archivo (body).
- **Header:** active nav states, WhatsApp CTA, blur backdrop, legible logo sizing, aria labels on the menu toggle.
- **Footer:** three-column layout with social links, navigation, contact, and dynamic year.
- **Certifications:** light card grid with red accent (replaces the full-red section).
- **Contact:** dark section with WhatsApp-first info column and the form on a white card.
- **404 page:** restyled to the new dark court identity.
- **README:** stack documentation refreshed (Neon PostgreSQL, Cloudinary, Resend, Vercel) and the design system documented.

### Fixed

- Searching no longer clears active category/brand filters; "Semua Kategori" and filter-removal links remove only their own filter.
- Desktop filter sidebar no longer clips the search box edges (scroll-container padding).
- WhatsApp FAB no longer overlaps product page CTAs and reappears correctly after client-side navigation.

## [2.2.3] - 2026-01-26

### Added

- **WebP optimization:** image uploads now optimize to WebP (max 2400px, quality 80) and store only the optimized asset.
- **Sync optimization:** media sync now converts legacy raster uploads to WebP, updates DB references, and removes originals.
- **Mux CSP support:** CSP updated to allow Mux playback + data domains and worker usage.

### Changed

- **Image loading UX:** AppImage now shows a subtle blinking background while loading.
- **Responsive sizing:** added explicit `sizes` for all `fill` images across public + admin UIs.
- **Logo asset:** replaced header/404 logo with optimized wordmark and responsive sizing.
- **Hero LCP:** hero image now uses `preload` with explicit `sizes`.

## [2.2.2] - 2026-01-26

### Added

- **HEIC support:** uploads now convert HEIC/HEIF to JPEG on ingest, and media sync backfills existing HEIC files into JPEG while updating DB references.

## [2.2.1] - 2026-01-26

### Added

- **Error boundaries:** public/admin/global error UIs, plus admin login error boundary for safer auth failures.
- **Session hardening:** session version invalidation with rotation guard and optional revocation hooks.
- **Meta Pixel tracking:** PageView + ViewContent + Search + Lead/Contact instrumentation on public pages.
- **CI pipeline:** lint + tsc + build workflow with DB-gated build step and ops note.

### Changed

- **Proxy/session handling:** centralized session checks and refresh throttling to avoid redirect loops.
- **Image reliability:** AppImage now handles error fallback without breaking render.
- **Security headers:** CSP/Permissions-Policy updated to support Meta Pixel while retaining strict defaults.

### Fixed

- **Admin access denied UX:** redirects and error handling align with access control states.

## [2.2.0] - 2026-01-25

### Added

- **Mux asset scan on sync:** the existing “Sinkron Assets” action now scans Mux assets and inserts missing video entries into the media library.
- **SEO keyword expansion:** added brand + regional Indonesian keywords and enhanced structured data sanitization.

### Changed

- **Admin save UX:** “Batal/Kembali” and “Simpan/Buat Baru” labels now reflect dirty state consistently, with better dirty tracking performance.
- **Media ordering:** primary media now becomes order #1; public ordering respects primary first with ascending order.
- **Media selection:** multi‑select from Media Library is enabled in Product/Portfolio forms; upload flow supports multi‑file selection.
- **Access control UI:** admin pages render a friendly Access Denied view instead of throwing.
- **Caching + revalidation:** server actions align with updated Next.js cache APIs (updateTag/revalidatePath usage).

### Fixed

- **Blocking route warnings:** wrapped runtime data access in Suspense for admin and public pages.
- **Mobile admin styling:** removed dev-time CSP upgrade-insecure-requests that broke styles.
- **Upload errors:** improved Mux/local upload placeholders and media updates; adjusted Server Actions body size limit for large uploads.
- **Ordering mismatch:** fixed sort order and primary ordering mismatch between admin and public pages.

## [2.1.0] - 2026-01-14

### Added

- **Admin search + sorting:** added keyword search and sort controls for Products, Brands, Categories, Portfolios, Users, Roles, and Audit Logs; Media Library now includes client-side sorting.
- **User highlight:** the currently logged-in user is pinned to the top of the users list and visually labeled.
- **Admin UI helpers:** added a reusable body scroll lock component and new-item toast handling for create flows.

### Changed

- **Category images optional:** category images are no longer required in the admin form, with safe fallbacks for missing visuals.
- **Category descriptions optional:** descriptions now allow empty values to align with other optional text fields.
- **Migration:** added a SQL migration to allow `categories.image_url` and `categories.description` to be nullable.
- **Admin filters:** sticky search/sort bars now align with the admin header for consistent scrolling behavior.
- **Media library UX:** action card layout, breadcrumbs placement, and sticky behavior improved for deeper folder navigation.
- **Mobile admin header:** simplified navigation layout with dropdown controls tuned for touch devices.

## [2.0.2] - 2026-01-14

### Added

- **Uploads + Image optimizer alignment:** local uploads now resolve to the public site host in production for Next Image optimization, while remaining relative in development.

### Changed

- **Admin polish:** aligned mobile/desktop roles list styling and made category rows fully clickable while keeping controls accessible.
- **Dashboard summary:** added a non-audit summary block and permission badges for users without audit access.
- **Mux sync hardening:** upload ID handling is now type-safe during sync.

### Fixed

- **Next Image 400s:** corrected `/uploads` handling so optimizer fetches from the public domain in production.

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

### Added

- Portfolio support for **video and audio** content.
- Image zoom capability in portfolio.
- Root `.gitignore` for improved version control hygiene.
- Documentation updates across READMEs (project analysis, env vars, and deployment strategies including cPanel constraints).
- Local development guidance for Mux webhooks (SMEE).

### Changed

- Streamlined “Getting Started” to leverage npm workspaces.

### Fixed

- Security: addressed multiple CVEs (critical → low), and improved crash handling.
- LCP improvement by prioritizing the first carousel image.
- CSP updates to allow Mux streaming (`*.mux.com`, `blob:`).
- `server/.gitignore` updated to ignore `.tmp/`.

## [1.1.0] - 2026-01-07

### Added

- Floating WhatsApp button.

### Changed

- CMS admin adjustments for production readiness.
- Repo structure cleanup and folder renaming.

### Fixed

- Public Role data fetching reliability for media objects.

## [1.0.0] - Initial Release

### Added

- Initial full-stack deployment:
  - Next.js frontend
  - Strapi CMS backend
- Baseline support for B2B, B2C, and planned advertising features.

[3.1.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.2.3...v3.0.0
[2.2.3]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.2.0
[1.1.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.1.0
[1.0.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.0.0
