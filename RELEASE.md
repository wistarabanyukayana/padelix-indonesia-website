# Release Convention

This document is the source of truth for preparing, publishing, verifying, and rolling back Padelix Indonesia website releases.

## Versioning

Use [Semantic Versioning](https://semver.org/):

- **Patch (`x.y.Z`):** backward-compatible fixes, security hardening, performance improvements, dependency updates, and documentation corrections.
- **Minor (`x.Y.0`):** backward-compatible user-facing features or substantial new capabilities.
- **Major (`X.0.0`):** breaking behavior, incompatible configuration, or a migration requiring coordinated consumer changes.

Published tags are immutable. Never move or delete a published tag to add a missed change; ship the correction on `main` or issue a new patch release.

## Files to Review

Every release must review and update these files:

- `package.json`: set the release version.
- `CHANGELOG.md`: move all shipped entries from `Unreleased` into `## [x.y.z] - YYYY-MM-DD`; keep an empty `Unreleased` heading for future work.
- `README.md`: update Production Status, stack/dependency references, prerequisites, scripts, deployment instructions, and Recent Updates where affected.

Update these only when the release changes their subject:

- `pnpm-lock.yaml`: dependency changes only; the root package version is not stored here.
- `.env.example`: added, removed, or renamed environment variables.
- `drizzle/`: schema, extension, data, or compatibility migrations.
- `wrangler.jsonc` and `open-next.config.ts`: Cloudflare runtime, bindings, cache, or deployment changes.
- `docs/MIGRATION-RUNBOOK.md`: infrastructure or provider migrations.
- Privacy, terms, API, or operational documentation affected by behavior changes.

## Preparation Checklist

- [ ] Confirm `main` contains exactly the intended commits and no user-owned or generated files such as `.tokensave/`.
- [ ] Choose the next SemVer version and release date.
- [ ] Update `package.json`, `CHANGELOG.md`, and `README.md` together.
- [ ] Review conditional files listed above.
- [ ] Confirm database migrations are forward-safe, rollback-compatible where practical, and fail before Worker deployment.
- [ ] Verify release notes describe user-visible changes, operational changes, security changes, and migrations.

## Verification

Run the same gates used by CI:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm check
pnpm build
```

Also run:

```bash
pnpm format
git diff --check
```

For Cloudflare, bundle, or deployment changes, additionally run:

```bash
pnpm exec opennextjs-cloudflare build
pnpm exec wrangler deploy --dry-run
```

Do not apply production migrations manually just to test a release. The deployment workflow owns production migration ordering.

## Commit, Deploy, and Publish

1. Commit the metadata and documentation:

   ```bash
   git add package.json CHANGELOG.md README.md
   git commit -m "chore: release vX.Y.Z"
   ```

   Add conditional release files explicitly; never use a broad add that could include `.tokensave/` or secrets.

2. Push `main` and wait for the **Deploy** workflow to finish successfully:

   ```bash
   git push origin main
   ```

   The workflow runs CI, installs dependencies, applies Drizzle migrations, and only then deploys the Cloudflare Worker.

3. Create the lightweight tag at the verified release commit and push it:

   ```bash
   git tag vX.Y.Z <release-commit>
   git push origin vX.Y.Z
   ```

4. Monitor the **Release** workflow. It reruns CI, extracts the matching `CHANGELOG.md` section, and publishes a non-draft GitHub Release.

5. Confirm the release tag, title, notes, target commit, and GitHub “Latest” status.

## Production Smoke Test

After both workflows are green:

- [ ] Public home, catalog, product detail, privacy, and terms routes return successfully on mobile and desktop.
- [ ] Existing administrator login succeeds; incorrect passwords fail.
- [ ] User creation and password changes work; the previous password fails.
- [ ] Role, password, and active-state changes invalidate existing sessions as expected.
- [ ] Product, portfolio, user, role, category, and brand admin actions succeed and retain the correct audit identity.
- [ ] Image, video, audio, and PDF uploads succeed.
- [ ] Meta Pixel public page-view/contact tracking works and is absent from admin route entries.
- [ ] Cloudflare errors/CPU and Neon query counts show no regression.

## Rollback

- If CI or migration fails, do not tag the commit; the previous Worker remains live.
- If deployment fails after migration, verify migration compatibility before redeploying the previous application version.
- If a published release is defective, revert or fix on `main`, deploy it, and publish a new patch version. Do not rewrite the published release tag.
- Record any operational incident or manual recovery step in `CHANGELOG.md` and the relevant runbook.

## Release Is Complete When

- The Deploy and Release workflows are green.
- The GitHub Release is published from the intended commit.
- Production smoke tests pass.
- Required post-release metrics have been checked.
- `main` is clean except for explicitly preserved user-owned files.
