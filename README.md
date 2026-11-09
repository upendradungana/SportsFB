# SportsFB

Sports facility booking for players and facility owners (Bhutan). Next.js 15 (App Router), Neon Postgres + PostGIS (Drizzle), Auth.js v5 (Google only), Upstash Redis + QStash, deployed on Vercel.

Roles: **player** (find and book), **owner** (list facilities, approve requests, verify receipts, pay for a plan), **admin** (allowlisted email + authenticator code: verify owners, approve facilities and plan payments, handle feedback).

# SportsFB Directory Structure

```text
SportsFB/
├── .env
├── .eslintrc.json
├── .gitignore
├── drizzle.config.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── vercel.json
├── vitest.config.ts
├── .github/
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   ├── pull_request_template.md
│   ├── release.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   └── workflows/
│       ├── ci.yml
│       ├── codeql.yml
│       ├── dependency-review.yml
│       ├── preview.yml
│       ├── production.yml
│       ├── release.yml
│       └── rollback.yml
├── .vercel/
│   ├── .env.production.local
│   ├── project.json
│   ├── README.txt
│   └── repo.json
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── sw.js
├── sql/
│   ├── 001_extensions.sql
│   ├── 002_integrity.sql
│   ├── 003_cleanup_duplicates.sql
│   └── 004_backfill_trials.sql
└── src/
    ├── auth.ts
    ├── instrumentation-node.ts
    ├── instrumentation.ts
    ├── app/
    │   ├── globals.css
    │   ├── icon.png
    │   ├── layout.tsx
    │   ├── manifest.ts
    │   ├── page.tsx
    │   ├── (dash)/
    │   │   ├── layout.tsx
    │   │   ├── admin/
    │   │   │   ├── Client.tsx
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── 2fa/
    │   │   │       └── page.tsx
    │   │   ├── bookings/
    │   │   │   ├── layout.tsx
    │   │   │   └── page.tsx
    │   │   ├── feedback/
    │   │   │   └── page.tsx
    │   │   ├── notifications/
    │   │   │   └── page.tsx
    │   │   ├── overview/
    │   │   │   ├── layout.tsx
    │   │   │   └── page.tsx
    │   │   ├── owner/
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── facilities/
    │   │   │   │   └── page.tsx
    │   │   │   ├── plan/
    │   │   │   │   └── page.tsx
    │   │   │   └── requests/
    │   │   │       └── page.tsx
    │   │   ├── play/
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── page.tsx
    │   │   └── settings/
    │   │       └── page.tsx
    │   ├── api/
    │   │   ├── admin/
    │   │   │   ├── action/
    │   │   │   │   └── route.ts
    │   │   │   ├── data/
    │   │   │   │   └── route.ts
    │   │   │   ├── feedback/
    │   │   │   │   └── route.ts
    │   │   │   ├── manage/
    │   │   │   │   └── route.ts
    │   │   │   ├── reminders/
    │   │   │   │   └── route.ts
    │   │   │   ├── sub-payment/
    │   │   │   │   └── route.ts
    │   │   │   ├── sub-receipt/
    │   │   │   │   └── [id]/
    │   │   │   │       └── route.ts
    │   │   │   └── totp/
    │   │   │       └── route.ts
    │   │   ├── auth/
    │   │   │   └── [...nextauth]/
    │   │   │       └── route.ts
    │   │   ├── bookings/
    │   │   │   ├── approve/
    │   │   │   │   └── route.ts
    │   │   │   ├── mine/
    │   │   │   │   └── route.ts
    │   │   │   ├── reserve/
    │   │   │   │   └── route.ts
    │   │   │   ├── verify/
    │   │   │   │   └── route.ts
    │   │   │   └── [id]/
    │   │   │       └── bank-details/
    │   │   │           └── route.ts
    │   │   ├── cron/
    │   │   │   ├── reminders/
    │   │   │   │   └── route.ts
    │   │   │   └── sweep/
    │   │   │       └── route.ts
    │   │   ├── facilities/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/
    │   │   │       ├── route.ts
    │   │   │       └── availability/
    │   │   │           └── route.ts
    │   │   ├── feedback/
    │   │   │   └── route.ts
    │   │   ├── health/
    │   │   │   └── route.ts
    │   │   ├── me/
    │   │   │   ├── route.ts
    │   │   │   ├── deactivate/
    │   │   │   │   └── route.ts
    │   │   │   ├── export/
    │   │   │   │   └── route.ts
    │   │   │   ├── logins/
    │   │   │   │   └── route.ts
    │   │   │   └── sessions/
    │   │   │       └── route.ts
    │   │   ├── notifications/
    │   │   │   └── route.ts
    │   │   ├── onboarding/
    │   │   │   └── route.ts
    │   │   ├── owner/
    │   │   │   ├── blocks/
    │   │   │   │   └── route.ts
    │   │   │   ├── facilities/
    │   │   │   │   └── route.ts
    │   │   │   └── plan/
    │   │   │       └── route.ts
    │   │   ├── payments/
    │   │   │   └── upload-proof/
    │   │   │       └── route.ts
    │   │   ├── receipts/
    │   │   │   └── [bookingId]/
    │   │   │       └── route.ts
    │   │   └── webhooks/
    │   │       └── expire-booking/
    │   │           └── route.ts
    │   ├── legal/
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── offline/
    │   │   └── page.tsx
    │   ├── onboarding/
    │   │   └── page.tsx
    │   └── signout/
    │       └── page.tsx
    ├── components/
    │   ├── Bell.tsx
    │   ├── Footer.tsx
    │   ├── HideOnScroll.tsx
    │   ├── MapView.tsx
    │   ├── Nav.tsx
    │   ├── SignInButton.tsx
    │   ├── Sw.tsx
    │   ├── Tabs.tsx
    │   └── ui.tsx
    ├── db/
    │   ├── index.ts
    │   └── schema.ts
    └── lib/
        ├── booking.ts
        ├── client.ts
        ├── guard.ts
        ├── img.ts
        ├── notify.ts
        ├── pageGuard.ts
        ├── phone.test.ts
        ├── phone.ts
        ├── plans.ts
        ├── ratelimit.ts
        ├── roleLayout.tsx
        ├── subscriptions.ts
        ├── totp.test.ts
        └── totp.ts
```

## 1. Run it locally

```bash
node -v            # 20.9+ (22 recommended)
npm install
cp .env.example .env   # then fill it in (section 3)
```

Database (once, in the Neon **SQL editor**, in this order):

1. `sql/001_extensions.sql`
2. `npm run db:push` (answer **no** if it ever offers to drop `spatial_ref_sys`)
3. `sql/002_integrity.sql` then `sql/003_cleanup_duplicates.sql` (both are safe to re-run; **re-run them after any later `db:push`**)
4. optional: `sql/004_backfill_trials.sql`

```bash
npm run dev        # http://localhost:3000
npm run typecheck && npm test && npm run build
```

First admin: put your Google email in `ADMIN_EMAILS`, sign in, open `/admin/2fa`, scan the QR with an authenticator app, enter the code.

## 2. Accounts you need (all have free tiers)

| Service | What for | Setup notes |
|---|---|---|
| Google Cloud | Sign-in | section 4 |
| Neon | Database | Region **Singapore (aws-ap-southeast-1)**. Use the pooled connection string (`...-pooler...`) with `sslmode=require`. Make a branch `dev` for local work; production uses `main`. |
| Upstash | Redis (rate limits) + QStash (15-minute payment timers) | Create a Redis DB in a nearby region. In QStash copy the token and both signing keys. |
| Vercel | Hosting | section 5 |
| Resend (optional) | Plan-expiry emails | Verify a sending domain; without it the app still sends in-app notifications. |
| GitHub | Code, CI/CD | section 6 |

## 3. Environment variables

Set these in **Vercel > Project > Settings > Environment Variables** (Production and Preview) and in your local `.env`. Never commit `.env`.

| Name | Value / how to get it |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `APP_URL` | Production: `https://your-domain` (must be public, QStash calls it). Local: `http://localhost:3000` |
| `AUTH_SECRET` | `openssl rand -base64 32` (changing it signs everyone out) |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth client (section 4) |
| `ADMIN_EMAILS` | Comma-separated admin Google emails. Only these can be admins. |
| `TOTP_ENC_KEY` | `openssl rand -hex 32`. Do not change after admins enrol 2FA (they would have to re-enrol). |
| `CRON_SECRET` | `openssl rand -hex 24`. Vercel sends it automatically to the cron routes. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST |
| `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | Upstash QStash |
| `PLATFORM_BANK_DETAILS` | The account owners pay their plan fee to |
| `PLAN_PLUS_NU`, `PLAN_PRO_NU` | Plan prices in Nu (defaults 500 and 1500) |
| `RESEND_API_KEY`, `MAIL_FROM` | Optional, for emails |

## 4. Google Cloud Console (this fixes the sign-in 403 on Vercel)

1. <https://console.cloud.google.com> > create or pick a project.
2. **APIs & Services > OAuth consent screen**: user type **External**; fill app name, support email, developer email; add your production domain under *Authorized domains* (e.g. `vercel.app` or your custom domain). Scopes: only `openid`, `email`, `profile` (no verification needed).
3. **Publishing status**: while it says *Testing*, only emails listed under **Test users** can sign in (everyone else gets a 403). Add your four teammates and testers, or press **Publish app** to allow any Google account.
4. **Credentials > Create credentials > OAuth client ID > Web application**:
   - Authorized JavaScript origins: `http://localhost:3000` and `https://YOUR-PRODUCTION-DOMAIN`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://YOUR-PRODUCTION-DOMAIN/api/auth/callback/google`
   - No trailing slash, exact `https`. Changes can take a few minutes to apply.
5. Copy the client ID and secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` on Vercel, then **redeploy** (env changes only apply to new deployments).

Google does not allow wildcard redirect URIs, so random Vercel preview URLs cannot sign in. Test sign-in on production, or give a branch a fixed alias and register that alias too.

**If you still get an error**, click *error details* on Google's page; the code tells you which row applies:

| You see | Cause | Fix |
|---|---|---|
| `Error 400: redirect_uri_mismatch` | URI not registered exactly | step 4 |
| `403: access_denied` / "app not verified" | Consent screen in *Testing* and you are not a test user | step 3 |
| `403: invalid_request` / "Access blocked" | Consent screen incomplete (support email, app name, domain) or user type *Internal* | step 2 |
| Vercel logs: `UntrustedHost` / `MissingSecret` | `AUTH_TRUST_HOST` / `AUTH_SECRET` missing | section 3, redeploy |
| Back on `/?error=AccessDenied` | Database error or locked account | Vercel logs; check section 1 SQL was run on the **production** Neon branch |
| 403 JSON from `/api/...` | Role mismatch (e.g. admin using an owner API) | use the matching account |

## 5. Deploy to Vercel

1. Vercel > **Add New Project** > import the GitHub repo (framework is detected as Next.js). `vercel.json` already sets region `sin1` (match your Neon region) and the two daily cron jobs.
2. Add every variable from section 3, then deploy once.
3. Settings > Domains: add your domain; update `APP_URL`, the Google origins/redirect URIs, then redeploy.
4. In Neon, run the SQL from section 1 on the branch the production `DATABASE_URL` points to.
5. Enable **Analytics** and **Speed Insights** in the Vercel project (the code is already wired).
6. Visit `https://YOUR-DOMAIN/api/health`, it must return `{"ok":true,...}`.

**Why deploys run from GitHub Actions:** `vercel.json` turns off Vercel's own Git auto-deploys (`git.deploymentEnabled: false`). On the Hobby plan, deployments triggered by other GitHub accounts can be blocked; deploying with one CLI token from Actions avoids that and lets CI gate every release. To use Vercel's built-in Git deploys instead, delete that line and the `preview.yml`/`production.yml` workflows.

Wire the Actions deploy once:
1. Locally: `npm i -g vercel && vercel login && vercel link` (creates `.vercel/project.json` with `orgId` and `projectId`).
2. Vercel > Account Settings > Tokens > create a token.
3. GitHub > Settings > Secrets and variables > Actions: secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; variable `PRODUCTION_URL` (e.g. `https://sportsfb.example.com`).
4. GitHub > Settings > Environments: create `production` (add 1+ required reviewers for a manual approval gate) and `preview`.

## 6. How the team works (four people)

| Person | Owns (see `.github/CODEOWNERS`) |
|---|---|
| Lead / DevOps | `.github`, `vercel.json`, releases, Vercel/GitHub admin |
| Security + backend | `src/auth.ts`, `src/lib`, `src/app/api` |
| Database | `src/db`, `sql/`, Neon |
| Frontend | `src/app/(dash)`, `src/components`, CSS |

Replace the placeholder handles in `CODEOWNERS` with real usernames first.

**Flow (trunk-based):** branch from `main` (`feat/...`, `fix/...`) > small PR > CI + review > squash merge > auto-deploys to production after the approval gate.
- Commits use Conventional Commits (`feat:`, `fix:`, `chore:`).
- **Branch protection for `main`** (GitHub > Settings > Branches): require a pull request; require 1 approval (2 for `src/auth.ts`, `src/app/api`, `sql`); require review from Code Owners; dismiss stale approvals; require status check **`verify`** and up-to-date branch; require conversation resolution; linear history; block force pushes and deletions; apply to admins too.
- **Pipeline** (`.github/workflows`): `ci.yml` (typecheck, tests, lint report, build, `npm audit`), `codeql.yml` and `dependency-review.yml` (need a public repo or Advanced Security, delete them otherwise), `preview.yml` (PR preview URL commented on the PR), `production.yml` (CI again, approval gate, deploy, `/api/health` smoke test), `rollback.yml` (manual), `release.yml` (tag `vX.Y.Z` makes a GitHub Release with notes). Dependabot opens weekly dependency PRs.
- **Database changes:** the PR changes `src/db/schema.ts` and adds/updates a file in `sql/`, and states the apply order. Make additive changes first, apply to Neon production **before** merging, test on the Neon `dev` branch with `npm run db:push`. Never drop columns in the same release that stops using them.
- **Secrets:** only in Vercel/GitHub secrets. Rotate `AUTH_SECRET`, Google secret, QStash keys and the Vercel token if anyone leaves. Everyone turns on 2FA for GitHub, Vercel, Neon, Google and Upstash.

## 7. Operations

- **Monitoring:** point an uptime monitor (UptimeRobot / Better Stack, free) at `/api/health` every 5 minutes, alerting a shared team email. Also watch Vercel runtime logs and Analytics, Neon monitoring, Upstash QStash logs (failed expiry webhooks), and the admin **Audit log**. Sentry is a good optional addition; it is not installed.
- **Scheduled jobs:** `/api/cron/reminders` (plan expiry, plan limits, reminders) and `/api/cron/sweep` (backstop for missed QStash timers) run daily via Vercel Cron.
- **Rollback:** GitHub Actions > *Rollback production*, or Vercel > Deployments > Instant Rollback. Data: restore a Neon point-in-time branch.
- **Go-live checklist:** Google consent screen published; redirect URIs match the live domain; `ADMIN_EMAILS` correct and 2FA enrolled; `CRON_SECRET` set; branch protection on; `/api/health` green; one full test booking (request, approve, pay, verify) and one plan payment.

## 8. Known limits

No phone-number OTP (needs a paid SMS provider); receipt images are stored in Postgres (move to R2/S3 if volume grows); notifications are in-app (refreshed every 60 s) plus optional plan emails; Google Maps links open the Google Maps app/site, map tiles come from OpenStreetMap.
