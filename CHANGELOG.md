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

## [2.0.2] - 2026-01-14

### Added
- **Uploads + Image optimizer alignment:** local uploads now resolve to the public site host in production for Next Image optimization, while remaining relative in development.

### Changed
- **Admin polish:** aligned mobile/desktop roles list styling and made category rows fully clickable while keeping controls accessible.
- **Dashboard summary:** added a non-audit summary block and permission badges for users without audit access.
- **Mux sync hardening:** upload ID handling is now type-safe during sync.

### Fixed
- **Next Image 400s:** corrected `/uploads` handling so optimizer fetches from the public domain in production.

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

[2.0.2]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.2.0
[1.1.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.1.0
[1.0.0]: https://github.com/wistarabanyukayana/padelix-indonesia-website/releases/tag/v1.0.0
