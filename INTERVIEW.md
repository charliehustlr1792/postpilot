# PostPilot — Interview Prep (hostile deep-dive)

> Git-ignored. Not for the repo. This is a debrief, not a study guide. Read every
> section as "here is what an interviewer will hit you with, and here is the
> honest state of the code."

---

## 1. What this actually is

PostPilot is a single-workspace social-media scheduler: a signed-in user connects
social accounts (X, LinkedIn, Meta, Reddit), writes one post, fans it out to
multiple platforms, schedules it for a future time, and later sees engagement
metrics pulled back on a timer. It is a **solo-owner tool** — there is no real
multi-tenant team model (team members are email rows with no enforced
permissions, `backend/prisma/schema.prisma:36`). It does **not** do: real-time
publishing ("publish now" doesn't exist — every send must be scheduled in the
future, `backend/src/controllers/scheduleController.ts:21`), billing (deferred),
image publishing to X/LinkedIn (explicitly unsupported,
`backend/src/services/platforms/twitterService.ts:16`,
`backend/src/services/platforms/linkedinService.ts:18`), or any test coverage.
It's a competent portfolio build carrying clear deadline shortcuts.

---

## 2. Architecture walkthrough

Two services. Frontend (Next.js 15 App Router, React 19) and backend (Express 5).
The frontend proxies `/api/*` to the backend via rewrites
(`frontend/next.config.ts:20-27`) so the Clerk session cookie and the OAuth state
cookie stay first-party. `frontend/src/middleware.ts:16-23` runs `clerkMiddleware`
on app routes but explicitly **excludes** `/api` so proxied calls aren't 302'd to
sign-in.

### Flow A — scheduled publish (the core path)

1. **Auth on every request.** `backend/src/index.ts:31` mounts `clerkMiddleware()`
   globally. `backend/src/middleware/requireApiAuth.ts:10-16` reads `getAuth(req)`
   and throws `AppError(401)` if there's no `userId`. The 401 loop the candidate
   debugged in prod was a Clerk key mismatch (frontend prod instance vs backend
   dev key), not a code bug — know that story cold.

2. **Create post.** `createPost` (`backend/src/controllers/postController.ts:68-109`)
   resolves the local `User` from `clerkId`, verifies every `socialAccountId`
   belongs to that user (`:81-86`), then creates a `Post` with one nested
   `PostTarget` per account (`:96-104`). Status is `DRAFT` or `SCHEDULED` — it does
   **not** enqueue anything.

3. **Schedule.** `schedulePost` (`backend/src/controllers/scheduleController.ts:9-111`)
   loads the post scoped to the owner (`:25-28`), filters targets that aren't
   `PUBLISHED` (`:35-39`), computes `delay = scheduledDate - now` (`:45`), and for
   each target: removes any existing PENDING job (`:51-63`), adds a delayed BullMQ
   job with deterministic `jobId = target-<id>-<timestamp>` (`:65-76`), marks the
   target `SCHEDULED` (`:78-81`), and writes a `ScheduledJob` row (`:83-90`). None
   of this is in a DB transaction, and the queue write and the DB writes are
   separate — see §5.

4. **Publish.** `postPublishQueue` (`backend/src/lib/queue.ts:14-25`, `attempts:3`,
   exponential backoff) feeds `postPublishWorker` (`backend/src/workers/index.ts:6-11`,
   concurrency 5). `processPostPublish` (`backend/src/jobs/postPublishProcessor.ts:22`)
   loads the target with post + account (`:28-34`), short-circuits if already
   PUBLISHED (`:40-43`), proactively refreshes the token if near expiry (`:51-61`),
   decrypts tokens (`:64-76`), calls `publishPostToSocialMedia`
   (`backend/src/services/socialMediaService.ts:15-29`), and on an auth error does
   one reactive refresh + retry (`:83-89`). Success writes `PUBLISHED` + platform
   id (`:93-102`); failure writes `FAILED` + message (`:115-118`) and, for
   permanent errors, throws `UnrecoverableError` so BullMQ stops retrying (`:120-127`).

5. **Dispatch.** `publishPostToSocialMedia` switches on platform to `publishToTwitter`
   / `publishToLinkedIn` / `publishToInstagram` / `publishToFacebook` /
   `publishToReddit` (`backend/src/services/socialMediaService.ts:18-24`). Each
   service owns its HTTP call and error mapping.

### Flow B — OAuth connect

`startOAuth` (`backend/src/controllers/oauthController.ts:32-70`) builds the consent
URL, generates PKCE for providers that need it (`:57-66`), appends provider extras
like Reddit's `duration=permanent` (`:72-75` region), and stores `{state, platform,
clerkUserId, codeVerifier}` in a signed HttpOnly cookie
(`backend/src/lib/oauthState.ts:33-43`). The callback (`:74-147`) is **unauthenticated**
— identity comes only from that signed cookie (`:78`, `:98-100`). It verifies state
with `timingSafeEqual` (`backend/src/lib/oauthState.ts:54-60`), exchanges the code,
fetches the profile, and upserts the `SocialAccount` with tokens encrypted via
AES-256-GCM (`backend/src/controllers/oauthController.ts:114-137`,
`backend/src/lib/crypto.ts:23-36`).

---

## 3. Decisions & alternatives

**Express 5 REST + separate Next.js frontend (not Next API routes / not tRPC).**
Two deploys, two runtimes, CORS/proxy plumbing. The proxy (`next.config.ts:20-27`)
exists specifically to dodge third-party-cookie blocking on the OAuth state cookie.
Alternative: collapse into Next.js route handlers — one deploy, same-origin for
free, no proxy. Trade-off here: BullMQ workers need a long-lived Node process,
which Vercel's serverless model fights, so a standalone Express host is defensible.
**Q: You split frontend and backend but then proxy the API back under the frontend
origin — at that point what did the split actually buy you over Next route handlers
plus a separate worker process?**

**BullMQ + Redis for scheduling (not a DB-polled cron, not cloud scheduler).**
Delayed jobs give you per-target retry/backoff cheaply (`queue.ts:14-25`).
Trade-off: your scheduled posts now live in Redis, and Upstash free tier can evict
keys — see §5, this is the scariest decision in the repo. Alternative: store the
schedule in Postgres (you already do, `ScheduledJob`) and run a 1-minute sweeper
that enqueues due rows. **Q: If Upstash evicts your delayed jobs, what happens to a
post scheduled for next week, and how would you even detect it?**

**Prisma + PostgreSQL.** Fine default. Model B (Post → PostTarget) is the one genuinely
good design call: per-platform independent status/analytics
(`schema.prisma:92-116`). Trade-off: every list query fans into nested target
includes. **Q: Why one PostTarget per platform instead of a `platforms String[]`
column on Post — and what does that buy you at read time vs write time?**

**Clerk for auth (not self-rolled JWT/sessions).** Offloads sessions, webhooks,
password reset. Trade-off: two Clerk instances (dev/prod) with keys that must match
across frontend/backend — the exact thing that broke in prod. **Q: Clerk issues the
token on the frontend and your Express backend verifies it — walk me through what
actually gets verified, and why a `pk_live`/`sk_test` mismatch produces a silent
401.**

**Tokens encrypted at rest with app-level AES-256-GCM (`crypto.ts`).** Good instinct.
Trade-off: single `TOKEN_ENCRYPTION_KEY`, no key versioning (`crypto.ts:10-20`) —
rotating it bricks every stored token. **Q: How do you rotate `TOKEN_ENCRYPTION_KEY`
without a flag day where every connected account breaks?**

**Folder structure: controllers / services / jobs / lib.** Conventional and mostly
clean. But `services/oauth` (connect) and `services/platforms` (publish) are two
parallel per-platform registries you must keep in lockstep when adding a platform —
you touched ~10 files to add Reddit. **Q: Adding one platform touches the enum, two
registries, validators, and the frontend constants — how would you make a new
platform a single-file change?**

---

## 4. Data & schema interrogation

Schema: `backend/prisma/schema.prisma`.

- **Normalization is reasonable.** `User 1—* SocialAccount 1—* PostTarget *—1 Post`,
  `PostTarget 1—* Analytics`. `PostTarget` correctly carries per-platform state
  (`:95-116`).
- **Indexes: essentially none beyond unique constraints.** This is the single
  biggest schema gap.
  - `Analytics` is queried by `userId + recordedAt >= start`
    (`analyticsController.ts:41-59`, `:93-106`, `:238-243`) and by `postTarget.postId`
    (`:19-22`) — **no index** on `userId`, `recordedAt`, or `postTargetId`
    (`schema.prisma:118-139`). Every dashboard load is a scan.
  - `PostTarget` is queried by `status + publishedAt + account.isActive` in the
    analytics sync (`analyticsSyncProcessor.ts:17-28`) — **no index** on `status` or
    `publishedAt` (`schema.prisma:95-116`).
  - `ScheduledJob` is queried by `postTargetId + status` (`scheduleController.ts:51-53`,
    `:132-134`) — **no index** (`schema.prisma:141-155`).
- **Unbounded growth.** `processAnalyticsSync` inserts a **new** `Analytics` row for
  every published target every 6 hours (`analyticsSyncProcessor.ts:53-67`,
  `workers/index.ts:24`). That's ~4 rows/target/day forever, no dedup, no retention.
  It compounds the missing indexes — the table this hammers is the one with no index.
- **Concurrent writes.** `SocialAccount` has `@@unique([userId, platform])`
  (`:74`) and `PostTarget` has `@@unique([postId, accountId])` (`:115`), so double
  connects/targets are DB-guarded. But scheduling is **not** transactional (§5).
- **Referential-integrity bug.** `PostTarget.account` has **no `onDelete`**
  (`schema.prisma:109-110`) and `accountId` is required, so Prisma defaults to
  Restrict. `deleteAccount` does a bare `socialAccount.delete`
  (`socialAccountsController.ts:79-84`); if any target references that account the
  delete throws a FK error (P2003) that the central handler does **not** map
  (`errorHandler` only handles P2002/P2025) → 500. Disconnecting an account that has
  posts breaks.
- **Bad actor.** Nothing lets a user reach another user's rows (all queries scope by
  `clerkId`). But `recordAnalytics` (`analyticsController.ts:180-218`) lets a user
  POST arbitrary metric numbers for their own targets — they can fabricate their own
  analytics. And `connectAccount` (`socialAccountsController.ts:34-71`) lets a user
  store arbitrary access/refresh tokens by hand.

**Q: Point at the query behind the analytics dashboard and tell me its complexity as
`Analytics` grows to 10M rows. Where's the index?**

---

## 5. Scalability & failure modes

**1. Scheduled jobs live only in Redis — SPOF with no reconciliation.**
Delays are BullMQ delayed jobs (`scheduleController.ts:65-76`). The `ScheduledJob`
DB row is written but **nothing reads it back to re-enqueue**. If Upstash evicts or
flushes, every future post silently never fires and the DB still says `SCHEDULED`.
*Falls over the first time Redis loses a key.* Fix: a periodic sweeper that finds
`ScheduledJob` PENDING with `scheduledFor <= now + window` and no live queue job,
and re-enqueues. Cost: idempotency work + one more repeatable job.

**2. Schedule op is not atomic.** `queue.add` then two separate Prisma writes, no
transaction (`scheduleController.ts:65-90`). Crash between them → orphan queue job
with no DB row, or a `SCHEDULED` target with no job. *Falls over under a crash or a
concurrent second schedule call for the same post* — the "remove existing PENDING"
read-then-add (`:51-63`) is a check-then-act race; two requests can both add.
Fix: wrap DB writes in `$transaction`, and make the queue the source of truth or use
a transactional outbox.

**3. Analytics sync is one sequential job doing all the work.** `processAnalyticsSync`
loops every published target in the 90-day window and awaits one HTTP call each,
concurrency-1 worker (`analyticsSyncProcessor.ts:33-76`, `workers/index.ts:13-19`).
*Falls over as published-post count grows* — one slow provider stalls the whole run,
and per-tweet insight calls will hit X rate limits fast. Fix: fan out per-target
jobs with concurrency + backoff, batch where the API allows.

**4. Unbounded reads.** `getAnalyticsTrends` pulls **every** analytics row in the
window and groups in JS with `any` (`analyticsController.ts:238-292`). `getAllPosts`
has pagination but **no max `limit`** — `limitNum = max(1, Number(limit))`
(`postController.ts:46-47`), so `?limit=1000000` pulls the table. Neither GET is
rate-limited (`writeLimiter` is writes-only, `analyticsRoutes.ts:20-21`).
*A single user can hammer the most expensive query with no cap.* Fix: DB-side
aggregation (`groupBy`/raw SQL with date_trunc), cap `limit`, rate-limit reads.

**5. "Top posts" is wrong at any scale.** `getAnalyticsOverview` fetches 20 posts
with **no `orderBy`** (`analyticsController.ts:63-77`) then picks top 5 by engagement
in JS (`:79-88`). It's top-5-of-an-arbitrary-20, not top posts. Correctness bug, not
just perf.

**6. No dead-letter handling / no alerting.** Failed jobs sit in the failed set
(`removeOnFail:100`, `queue.ts:18`). Nobody's paged. When Redis is down, workers
can't process and there's no fallback.

**Q for each:** "This falls over at X — fix it and tell me what the fix costs." Have
the sweeper answer and the transactional-outbox answer ready; those are the two they
will push hardest on.

---

## 6. Security review

**Solid:**
- Clerk webhook verifies the svix signature over the **raw** body, mounted before
  the JSON parser (`webhookController.ts:36-45`, `webhookRoutes.ts:8-12`), and is
  idempotent via upsert (`:66-70`).
- OAuth state cookie is signed (HMAC-SHA256), HttpOnly, SameSite=Lax, 10-min TTL,
  path-scoped, and compared with `timingSafeEqual` (`oauthState.ts:29-60`).
- Tokens encrypted at rest with AES-256-GCM (`crypto.ts`). Helmet + CORS with a
  single allowed origin (`index.ts:29-30`). Zod validation on write routes.
- No hardcoded secrets found; all config is env-driven (`.env.example`).

**Real gaps:**
- **Debug routes in production.** `GET /api/test-db` is **unauthenticated** and
  returns `user.count()` (`index.ts:80-87`) — info leak + an unbounded count on every
  hit. `GET /protected` returns the full Clerk user object (`:57-69`). Both are dead
  debug code shipped live. **Fix before interview** (or be ready to own it).
- **Manual token-injection endpoint.** `POST /api/accounts/connect` accepts
  `accessToken`/`refreshToken` in the request body and stores them
  (`socialAccountsController.ts:34-71`). It's auth'd + rate-limited, but it's a
  raw-secret-in-body path parallel to OAuth that shouldn't exist in prod. Looks like
  a pre-OAuth dev shortcut left in. [INFERRED — verify with candidate.]
- **No rate limiting on reads.** Expensive analytics GETs are uncapped (§5.4).
- **`limit` is uncapped** (§5.4) — a cheap DoS / memory-pressure vector.
- **Single encryption key, no versioning** (`crypto.ts:10-20`) — rotation is a flag
  day; a leaked key decrypts every token with no forward path.
- **Token refresh gaps.** Meta has no refresh grant (`meta.ts` has no `refresh`),
  so when a ~60-day long-lived token dies, publish fails permanently with no
  self-heal. Provider revocation mid-schedule surfaces only as a failed job, no user
  notification.
- **Error `message` from providers is stored and shown verbatim** on the post card
  (`postPublishProcessor.ts:112-118`, frontend `PostCard`). Low risk, but it's
  unsanitized third-party text rendered to the user.

**Q: `/api/accounts/connect` lets me store any bearer token I want against my
account. Why does that endpoint exist next to your OAuth flow, and what stops it
being abused?**

---

## 7. Testing & code quality critique

- **Zero automated tests.** The only `*.test.*` files are inside `node_modules`
  (glob confirmed). Neither `package.json` has a `test` script
  (`backend/package.json:5-10` — `dev`/`start`/`build` only; frontend has `lint`).
  Crypto, OAuth state signing, the publish retry/permanent-error logic, and the
  scheduling race are **all** untested. This is the first thing a serious reviewer
  will hit.
- **No CI.** `.github/` doesn't exist. Type-check/lint/build run only by hand.
- **Dead / parallel paths.** `PostsList.tsx` and `PostsGrid.tsx` are literal stubs
  returning `<div>PostsList</div>` (`frontend/src/components/posts/PostsList.tsx:3-7`,
  `PostsGrid.tsx:3-7`). `recordAnalytics` and `connectAccount` are endpoints the app
  doesn't use. Debug routes (§6).
- **Loose typing where it matters least defensible.** `getAnalyticsTrends` uses
  `acc: any` / `day: any` for the exact aggregation logic that should be typed
  (`analyticsController.ts:257`, `:288`).
- **Inconsistent conventions.** Controllers are 4-space, semicolon'd, commented;
  `queue.ts`/`workers/index.ts`/`scheduleRoutes.ts` are terse, no-space
  (`const router=Router()`), inline-commented. Comment typos: "proces"
  (`workers/index.ts:9`), "soical" (`socialAccountsController.ts:8`), "account
  account" (`:86`). Reads as written in bursts under time pressure.
- **Swallowed errors.** Proactive token refresh failure is logged and ignored
  (`postPublishProcessor.ts:56-60`) — intentional and commented, defensible. The
  webhook missing-email path returns 400 (`webhookController.ts:57-59`) which makes
  Clerk **retry forever** on a user with no email. [INFERRED — verify.]

---

## 8. "Why did you..." rapid fire (grounded in this repo)

1. Why is the OAuth **callback** route unauthenticated while `/auth` requires Clerk
   (`socialAccountsRoutes.ts:15-16`)? What carries identity into the callback?
2. Why `SameSite=Lax` and `path=/api/accounts` on `pp_oauth_state`
   (`oauthState.ts:11-12`, `:39-40`) — why not `Strict`, why the path scope?
3. Why store `codeVerifier` in the state cookie instead of server-side session
   (`oauthState.ts:18`)?
4. Why `timingSafeEqual` for the state signature (`oauthState.ts:57`) — what attack
   does a plain `===` open?
5. Why AES-256-**GCM** and not CBC for token storage (`crypto.ts:8`)? What does the
   auth tag give you?
6. Why one BullMQ job **per target** instead of one job per post
   (`scheduleController.ts:65-76`)?
7. Why is `jobId` deterministic as `target-<id>-<timestamp>` (`:74`)? What does that
   dedupe and what does it miss?
8. Why concurrency **5** for publish but **1** for analytics
   (`workers/index.ts:9`, `:18`)?
9. Why re-add the repeatable analytics job on every boot (`workers/index.ts:25-31`)
   — why doesn't that create duplicates?
10. Why does `schedulePost` reject a non-future time
    (`scheduleController.ts:21`) — so how does a user publish *now*?
11. Why does Meta `getProfile` just take `pages[0]` (`meta.ts:83`, `:98-100`)? What
    if I manage five Pages?
12. Why does Meta have no `refresh` function (`meta.ts:114-122`) when the others do?
13. Why key the rate limiter by Clerk `userId` and not IP (`rateLimit.ts:9-12`)?
    What forced that — and what breaks if `getAuth` is empty?
14. Why is the LinkedIn API version an env var with an in-code default
    (`linkedinService.ts:5-8`)? What incident caused that?
15. Why mark 4xx as `isPermanent` but 429/5xx as retryable
    (`twitterService.ts:85-101`, `postPublishProcessor.ts:120-127`)?
16. Why does `getAllPosts` filter at the **target** level with `targets: { some }`
    (`postController.ts:33-44`) — what does that do to counts?
17. Why is `createPost` not wrapped in a transaction when it creates a post plus N
    targets (`postController.ts:91-106`)? (Nested create is one statement — do you
    know that?)
18. Why does `updatePost` use `$transaction` (`postController.ts:172-194`) but
    `schedulePost` does not (`scheduleController.ts:47-92`)?
19. Why proxy `/api/*` through Next instead of calling the backend origin directly
    (`next.config.ts:20-27`)?
20. Why is Reddit shipped but disabled via `DISABLED_PLATFORMS`
    (`providers.ts`) instead of just not merged?

---

## 9. Tiered mock interview

### Tier 1 — campus / service-based
- Explain PostPilot in 2 minutes: one post → many `PostTarget`s → scheduled BullMQ
  jobs → per-platform publish → analytics sync.
- "What does `postRollupStatus` do?" (frontend `types/post.ts` — collapses many
  target statuses to one badge, priority FAILED > SCHEDULED > PUBLISHED > DRAFT.)
- "Walk me through `encrypt` line by line" (`crypto.ts:23-36`) — IV, cipher, auth
  tag, `iv:tag:ciphertext`.
- OOP/DSA tie-in that's actually here: the `OAuthProvider` interface with per-platform
  implementations (`services/oauth/types.ts:37-45`) is the Strategy pattern; the
  `breakdownMap` in analytics (`analyticsController.ts:108-151`) is a hash-map
  group-by — state its complexity.

### Tier 2 — product company / startup bar
- **API critique:** `POST /api/accounts/connect` taking raw tokens
  (`socialAccountsController.ts:39`) — redesign it away. Uncapped `limit`
  (`postController.ts:47`) — fix it.
- **DB defense:** justify Model B vs a `String[]` of platforms; then defend the
  total absence of secondary indexes (§4). You will lose the second half honestly —
  own it.
- **Concurrency:** two schedule requests for the same post at once
  (`scheduleController.ts:51-63`) — walk the race, then fix with a transaction +
  unique constraint.
- **System-design extension:** "Add 'publish now.'" There's no immediate path today
  (`scheduleController.ts:21`); design it (enqueue with delay 0 vs a synchronous
  publish endpoint, and why you'd still go through the queue).

### Tier 3 — FAANG-tier
- **Capacity:** 100k users, avg 5 connected accounts, 3 posts/day → ~1.5M
  `PostTarget` publishes/day (~17/s avg, higher at top-of-hour spikes). Analytics
  sync every 6h over the 90-day window = tens of millions of insight calls/run
  through a **concurrency-1** worker (`workers/index.ts:13-19`,
  `analyticsSyncProcessor.ts:13-28`). Do the math out loud and show where it dies.
- **10×/100× the analytics table:** one row per target per 6h forever
  (`analyticsSyncProcessor.ts:53`). At 100× it's a scan-only table with no index
  (§4). Redesign: pre-aggregated rollups, retention, index/partition by
  `(userId, recordedAt)`.
- **Consistency/availability:** the queue (Redis) and the truth (Postgres) can
  diverge — `SCHEDULED` in DB, job gone from Redis (§5.1). Design reconciliation and
  argue the CAP trade-off you're accepting.
- **Redesign the scheduler for 1M concurrent scheduled posts:** move off "everything
  is a Redis delayed job" to a Postgres-backed schedule + minute-bucketed sweeper +
  idempotent enqueue; discuss thundering-herd at the top of the hour.
- **Live bug hunt (have this ready):** `backend/src/controllers/scheduleController.ts:51-90`
  — "There's a race and a durability hole here. Find both." (Non-transactional
  queue-add + DB-write; check-then-act on existing PENDING jobs.) And
  `backend/src/controllers/analyticsController.ts:63-88` — "This 'top posts' result
  is wrong. Why?" (no `orderBy` before `take: 20`).

---

## 10. Weaknesses & landmines — ranked (most dangerous first)

1. **Scheduled posts live only in Redis, no DB reconciliation**
   (`scheduleController.ts:65-76`; nothing reads `ScheduledJob` back). Silent data
   loss on eviction. **Own it** with the sweeper fix ready — too big to fix cleanly
   before the interview, but you must name it first, before they do.
2. **Zero tests, zero CI** (`package.json`, no `.github`). **Own it**; optionally
   land 2–3 unit tests on `crypto.ts` and the Twitter error mapper to show you can.
3. **No secondary indexes; unbounded analytics growth** (§4). **Fix before interview**
   — adding `@@index` lines + a migration is cheap and turns a landmine into a
   talking point.
4. **Unauthenticated debug routes in prod** (`index.ts:57-69`, `:80-87`). **Fix
   before interview** — delete them; there's no defense for `/api/test-db`.
5. **Non-atomic, racy scheduling** (`scheduleController.ts:47-92`). **Own it** with
   the `$transaction` fix; mention it proactively.
6. **Raw-token injection endpoint** (`socialAccountsController.ts:34-71`). **Fix or
   remove before interview** if it's truly unused, else be ready to justify it.
7. **Uncapped `limit` + unthrottled expensive reads** (`postController.ts:47`,
   `analyticsController.ts:238-292`). **Fix before interview** — one-line cap.
8. **"Top posts" correctness bug** (`analyticsController.ts:63-88`). **Fix before
   interview** — add `orderBy`; it's embarrassing if they find it first.
9. **`SocialAccount` delete blows up when targets exist** (missing `onDelete`,
   `schema.prisma:109-110`; `socialAccountsController.ts:79`). **Fix** — decide
   SetNull vs Cascade and handle P2003.
10. **Meta picks `pages[0]`, no multi-page/multi-account selection** (`meta.ts:83`).
    **Own it** — known limitation, easy to explain.
11. **Single encryption key, no rotation path** (`crypto.ts:10-20`). **Own it** —
    describe key-versioning as the fix.
12. **Dead stub components + inconsistent style + typo'd comments**
    (`PostsList.tsx`, `PostsGrid.tsx`, `workers/index.ts:9`). **Fix before
    interview** — cosmetic, cheap, removes "unreviewed" smell.

---

### Before you walk in
The two things that will sink you if you *don't* raise them first: (1) scheduled
posts are only durable in Redis, and (2) there are no tests. Lead with both,
framed as "here's what I'd harden next and why," before the interviewer turns them
into a gotcha.
