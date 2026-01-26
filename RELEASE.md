# Release 2.2.1 (2026-01-26)

## Summary
This release focuses on stability, security, and analytics. It adds robust error boundaries, session invalidation + rotation hardening, and Meta Pixel tracking on public pages, plus a CI pipeline for consistent checks.

## Major Changes
- **Error boundaries:** public/admin/global error UIs, and admin login error boundary for safer auth failures.
- **Session hardening:** session version invalidation with rotation guard and revocation hooks.
- **Meta Pixel:** PageView + ViewContent + Search + Lead/Contact tracking on public pages.
- **CI pipeline:** lint + tsc + build workflow with DB‑gated build step.
- **Security headers:** CSP/Permissions-Policy tuned to allow Meta Pixel while keeping strict defaults.
- **Image fallback:** AppImage now handles error fallback without breaking render.

*For full technical details, see the CHANGELOG.md.*
