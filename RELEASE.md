# Release 2.2.3 (2026-01-26)

## Summary

This patch upgrades image handling across the stack: uploads and sync now optimize raster images to WebP, UI images gain explicit responsive sizing and loading indicators, and CSP is aligned with Mux playback/data requirements.

## Major Changes

- **WebP uploads:** raster images are optimized to WebP on upload (max 2400px, quality 80).
- **WebP sync:** media sync converts legacy raster uploads to WebP and updates DB references.
- **Image UX:** AppImage now shows a subtle loading indicator; responsive `sizes` added for all `fill` images.
- **CSP:** Mux playback/data domains and worker usage are allowed for reliable streaming.

_For full technical details, see the CHANGELOG.md._
