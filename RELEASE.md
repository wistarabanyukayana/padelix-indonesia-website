# Release 2.2.2 (2026-01-26)

## Summary

This patch adds HEIC support end‑to‑end: uploads convert HEIC/HEIF to JPEG automatically, and the media sync action backfills any existing HEIC files by converting and updating database references.

## Major Changes

- **HEIC uploads:** HEIC/HEIF images are converted to JPEG on upload.
- **HEIC backfill:** “Sinkron Assets” converts existing HEIC files, updates DB URLs, and removes the originals.

_For full technical details, see the CHANGELOG.md._
