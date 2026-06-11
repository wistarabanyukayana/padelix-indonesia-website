# Live Data Migration Runbook

Rumahweb shared hosting (MySQL + local `public/uploads` + Mux video)
→ Vercel + Neon PostgreSQL + Cloudinary + Cloudflare + Resend.

Follow the phases **in order**. Each phase ends with a verification step —
do not continue until it passes. Total hands-on time: roughly half a day,
plus DNS propagation.

**Golden rule: the old site stays live and untouched until Phase G.**
Nothing in Phases A–F affects the running Rumahweb site.

---

## Phase A — Provision the new accounts (~30 min)

### A1. Neon (database)

1. Sign up at https://neon.tech (GitHub login). No credit card.
2. Create a project: name `padelix`, region **AWS ap-southeast-1
   (Singapore)** — closest to your visitors and to Vercel's `sin1`.
3. In the project dashboard → **Connection Details** → select
   **Pooled connection** → copy the connection string. It looks like:
   `postgresql://USER:PASS@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
4. Save it — this is your `DATABASE_URL`.

### A2. Cloudinary (media)

1. Sign up at https://cloudinary.com/users/register_free. No credit card.
2. Dashboard → note the three values: **Cloud name**, **API Key**,
   **API Secret**.
3. Settings → Upload → confirm upload preset signing mode stays
   **Signed** (default). The app only uses signed uploads.

### A3. Resend (contact form email)

1. Sign up at https://resend.com. No credit card.
2. **Domains → Add Domain** → `padelix.co.id`. Resend shows 3–4 DNS
   records (DKIM TXT, SPF TXT, optional MX for bounces). **Write them
   down** — you will add them in Cloudflare in Phase F. Until the domain
   verifies, you can already test with the `onboarding@resend.dev` sender.
3. **API Keys → Create API Key** (full access) → save as `RESEND_API_KEY`.

### A4. Vercel (hosting)

1. Sign up at https://vercel.com with the GitHub account that owns this
   repository.
2. Note: Hobby tier ToS technically prohibits commercial use. Decision on
   record: accept the risk for now; upgrade to Pro ($20/mo) if it is ever
   raised. Do not resell/white-label the deployment.

### A5. Cloudflare (DNS/CDN)

1. Sign up at https://cloudflare.com → **Add a site** → `padelix.co.id`
   → Free plan.
2. Cloudflare scans and imports existing DNS records. **Verify the
   imported list against the current records in Rumahweb's DNS panel**
   (especially MX records if the domain has mailboxes).
3. Cloudflare gives you two nameservers (e.g. `ana.ns.cloudflare.com`).
   **Do not change the nameservers yet** — that is the Phase F cutover.

---

## Phase B — Create the schema on Neon (~10 min)

On your machine, in the repo on branch `migrate/vercel-neon-cloudinary`:

1. Edit `.env` (or `.env.local`): replace the old MySQL `DATABASE_URL`
   with the Neon pooled connection string from A1. Fill in the three
   `CLOUDINARY_*` values and `RESEND_API_KEY` while you're here
   (see `.env.example` for the full list).
2. Apply the migrations (creates all 15 tables, the `media_type` enum,
   and the `updated_at` triggers):

   ```bash
   pnpm drizzle-kit migrate
   ```

3. Verify:

   ```bash
   pnpm tsx scripts/test-db.ts
   ```

   Expected: a list of 15 tables and `Products count: 0`.

---

## Phase C — Copy the database content (~1–2 h)

### C0. Content freeze

Tell everyone with admin access: **no more edits on the old site** from
this point until the new site is live. Any edit made after the export is
lost.

### C1. Export from Rumahweb

cPanel → **phpMyAdmin** → select the site database → **Export** →
Method: *Custom* → Format: **SQL** → check *complete inserts* →
uncheck *structure* (data only) → Export. Keep this file as the
authoritative backup (`backup-final-YYYY-MM-DD.sql`).

Additionally export **each table as CSV** (phpMyAdmin → table → Export →
CSV, with column names in the first row). CSV is what you'll import,
the SQL dump is the safety net.

### C2. Import into Neon — in this exact order

FK constraints dictate the order. Import parents before children:

| # | Table | Notes |
|---|---|---|
| 1 | `users` | |
| 2 | `roles` | |
| 3 | `permissions` | |
| 4 | `roles_permissions` | join table |
| 5 | `users_roles` | join table |
| 6 | `brands` | |
| 7 | `categories` | self-FK: import rows with `parent_id = NULL` first if it errors |
| 8 | `medias` | URLs fixed in Phase D |
| 9 | `products` | |
| 10 | `product_medias` | |
| 11 | `product_specifications` | |
| 12 | `product_variants` | |
| 13 | `portfolios` | |
| 14 | `portfolio_medias` | |
| 15 | `audit_logs` | optional — history only |

For each CSV, from a machine with `psql` installed
(`sudo dnf install postgresql` on Fedora):

```bash
psql "$DATABASE_URL" -c "\copy users (id,is_active,username,email,password_hash,last_login,created_at,updated_at,session_version) FROM 'users.csv' WITH (FORMAT csv, HEADER true)"
```

(Repeat per table; take the column list from the CSV header.)

**Data conversions to watch:**

- **Booleans**: MySQL exports `1`/`0`. Postgres `\copy` accepts them for
  boolean columns — no change needed.
- **Datetimes**: the old DB stored UTC (`timezone: "Z"` in the old pool
  config); Postgres `timestamp` accepts `YYYY-MM-DD HH:MM:SS` as-is.
- **`medias.metadata`**: MySQL exports JSON as a quoted string — valid
  input for `jsonb`, no change needed.
- **Passwords**: `password_hash` is bcrypt — copies over unchanged, all
  admin logins keep working.

### C3. Sync the serial sequences

The CSVs carry explicit ids, which bypass the serial sequences — without
this step the next insert from the admin panel fails with a duplicate-key
error. Run once in `psql`:

```sql
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','roles','permissions','brands','categories','medias','products','product_medias','product_specifications','product_variants','portfolios','portfolio_medias','audit_logs']
  LOOP
    EXECUTE format(
      'SELECT setval(pg_get_serial_sequence(%L, ''id''), (SELECT COALESCE(MAX(id),1) FROM %I))', t, t);
  END LOOP;
END $$;
```

### C4. Verify

```bash
pnpm tsx scripts/test-db.ts          # products count matches the old site
pnpm dev                             # homepage shows products (images broken — fixed in Phase D)
```

---

## Phase D — Migrate media to Cloudinary (~1–3 h, depends on volume)

### D1. Download the originals from Rumahweb

cPanel → **File Manager** → navigate to the site's `public/uploads`
folder → **Compress** → download the zip → extract locally so you have
`./uploads/...` mirroring the live folder structure.

### D2. Recover the videos from Mux

Mux does not store your original files in downloadable form by default:

1. Mux dashboard → **Assets** → for each video asset → enable
   **Static renditions** (or *Master access* if available on the plan)
   → wait for it to process → download the highest-quality MP4.
2. Name each file after the original video title and place it in the
   `./uploads/...` tree (e.g. `./uploads/videos/court-installation.mp4`).
3. If a rendition can't be enabled, play the asset's HLS URL
   (`https://stream.mux.com/PLAYBACK_ID.m3u8`) and save it with:
   `yt-dlp "https://stream.mux.com/PLAYBACK_ID.m3u8" -o name.mp4`

### D3. Bulk-upload to Cloudinary preserving paths

Install the Cloudinary CLI (Python): `pipx install cloudinary-cli`, then:

```bash
export CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
cld upload_dir ./uploads -f uploads -o use_filename true -o unique_filename false
```

This preserves the folder structure under the `uploads/` root folder and
keeps original filenames as public_ids — which is what makes the URL
remap in D4 deterministic. Spot-check in the Cloudinary Media Library
that `uploads/<subfolder>/<name>` matches the old
`/uploads/<subfolder>/<name>.<ext>` paths.

### D4. Remap `medias` rows to Cloudinary URLs

The imported `medias` rows still point at `/uploads/...` (images) and
`stream.mux.com` (videos). Because D3 preserved paths and filenames, the
mapping is mechanical. In `psql`, with your real cloud name substituted:

```sql
-- Images and other local files:
UPDATE medias SET
  provider = 'cloudinary',
  file_key = 'uploads/' || regexp_replace(
               substring(url from '^/uploads/(.+)$'), '\.[^./]+$', ''),
  url = 'https://res.cloudinary.com/CLOUD_NAME/image/upload/'
        || 'uploads/' || substring(url from '^/uploads/(.+)$')
WHERE provider = 'local' AND url LIKE '/uploads/%' AND type = 'image';

-- Repeat for non-image local files with resource type "raw":
UPDATE medias SET
  provider = 'cloudinary',
  file_key = 'uploads/' || regexp_replace(
               substring(url from '^/uploads/(.+)$'), '\.[^./]+$', ''),
  url = 'https://res.cloudinary.com/CLOUD_NAME/raw/upload/'
        || 'uploads/' || substring(url from '^/uploads/(.+)$')
WHERE provider = 'local' AND url LIKE '/uploads/%' AND type <> 'image';
```

Videos (one `UPDATE ... WHERE id = ...` per video — there are few):

```sql
UPDATE medias SET
  provider  = 'cloudinary',
  file_key  = 'uploads/videos/court-installation',
  mime_type = 'video/mp4',
  url = 'https://res.cloudinary.com/CLOUD_NAME/video/upload/uploads/videos/court-installation.mp4'
WHERE id = <the video's media id>;
```

Keeping the original row ids is what preserves every
`product_medias` / `portfolio_medias` link — do **not** delete and
re-insert media rows.

### D5. Verify

1. `pnpm dev` → homepage: every product/portfolio image loads from
   `res.cloudinary.com`. Product detail with video: plays in the plain
   `<video>` tag.
2. Log in to `/admin` → Media library → thumbnails render, folders match
   the old structure. Press **Sinkron Assets** — it should report **0
   new files** (everything already mapped). If it adds rows, some D4
   mapping didn't match: find the duplicates, fix the original row's
   `file_key`/`url`, delete the duplicate row.

---

## Phase E — Deploy to Vercel (~30 min)

1. Push the branch and merge it to `main` (Vercel deploys `main` to
   production):

   ```bash
   git push -u origin migrate/vercel-neon-cloudinary
   # open PR, review, merge
   ```

2. Vercel dashboard → **Add New → Project** → import the GitHub repo.
   Framework preset: Next.js (auto). Build command/output: defaults.
3. **Environment Variables** (Production + Preview):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string |
   | `SESSION_SECRET` | ≥32 random chars — generate fresh: `openssl rand -base64 48` |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from A2 |
   | `RESEND_API_KEY` | from A3 |
   | `EMAIL_FROM` | `website@padelix.co.id` |
   | `BUSINESS_EMAIL` | `business@padelix.co.id` |
   | `NEXT_PUBLIC_SITE_URL` | `https://padelix.co.id` |
   | `NEXT_PUBLIC_META_PIXEL_ID` | existing pixel id |

4. Deploy. On the `*.vercel.app` preview URL, test the full pass:
   - homepage sections render with live data
   - `/products` search + category filter
   - product detail incl. video playback
   - `/admin` login (old credentials work), media library, create +
     delete a test product, audit log records it
   - contact form (sender will be `onboarding@resend.dev` until DNS
     verifies in Phase F — that's expected)

---

## Phase F — DNS cutover to Cloudflare + Vercel (~20 min + propagation)

Do this at a low-traffic hour.

1. Vercel project → **Settings → Domains** → add `padelix.co.id` and
   `www.padelix.co.id` (redirect www → apex).
2. In Cloudflare DNS for the zone (records imported in A5):
   - `A` record, name `@`, value `76.76.21.21` (Vercel anycast) —
     or the exact value Vercel's domain screen shows.
   - `CNAME`, name `www`, value `cname.vercel-dns.com`.
   - Delete the old `A` records pointing at Rumahweb's server IP.
   - Add the Resend records from A3 (DKIM TXT, SPF TXT, bounce MX).
   - Keep any mailbox MX records that already existed, if the client
     uses `@padelix.co.id` email elsewhere.
3. Cloudflare → **SSL/TLS** → set mode **Full (strict)**. Never
   "Flexible" — it loops with Vercel.
4. At Rumahweb's **domain management panel** (the domain registration,
   not the hosting): replace the nameservers with the two Cloudflare
   nameservers from A5. Keep the domain registration itself at Rumahweb —
   only hosting is being left.
5. Wait for propagation (minutes to ~24 h; usually fast). Verify:

   ```bash
   dig +short padelix.co.id          # 76.76.21.21 (or Cloudflare proxy IPs)
   curl -sI https://padelix.co.id | grep -i "content-security-policy"
   ```

6. Resend dashboard → domain should flip to **Verified**. Send a test
   via the live contact form → arrives at `business@padelix.co.id` from
   `website@padelix.co.id`.
7. Browse the live site with DevTools open: no CSP violations, images
   from `res.cloudinary.com`, video plays.

---

## Phase G — Decommission (after 1–2 weeks of stability)

1. Re-export a final MySQL backup from Rumahweb and archive it.
2. Download a final copy of `public/uploads` and archive it (Cloudinary
   free tier has no backup guarantee).
3. Cancel the **Mux** subscription (assets were re-hosted in D2).
4. Let the Rumahweb **hosting** plan lapse at renewal. **Do not cancel
   the domain registration** — it stays at Rumahweb as registrar, with
   Cloudflare nameservers.
5. Recurring (monthly, 2 minutes): glance at the Cloudinary usage
   dashboard (25 credits = combined storage + bandwidth) and Neon usage
   (0.5GB storage / 190 compute-hours). Both suspend rather than charge
   when exceeded — suspension means broken media / DB until reset, so
   you want the early warning.

---

## Rollback plan

Until Phase G, rollback is one step: point the nameservers (or just the
`A`/`CNAME` records, if already on Cloudflare) back at Rumahweb's
values. The old hosting, database, files, and Mux assets are all still
in place and unchanged.
