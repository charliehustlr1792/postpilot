# OAuth Integration

How PostPilot connects social accounts and the developer-portal setup each
platform needs.

## Flow

Two routes per platform, both under `/api/accounts`:

1. `GET /api/accounts/:platform/auth` (authenticated)
   - Builds the provider consent URL with `client_id`, `redirect_uri`, `scope`,
     and a random `state`.
   - For PKCE providers (Twitter) it also generates a `code_verifier` and sends
     the derived `code_challenge`.
   - Stashes `{ state, platform, clerkUserId, codeVerifier? }` in a short-lived,
     signed, HttpOnly cookie (`pp_oauth_state`), then returns `{ url }` as JSON.
   - The SPA fetches this with the Clerk bearer token and `credentials: 'include'`
     (a top-level browser redirect to the backend can't carry the bearer token),
     then navigates the browser to `url`.

2. `GET /api/accounts/:platform/callback` (unauthenticated)
   - The provider redirects the browser here. This request does **not** carry the
     Clerk session, so identity and CSRF protection come from the signed state
     cookie set in step 1.
   - Verifies `state` matches, exchanges `code` for tokens, fetches the account
     profile, then upserts a `SocialAccount` row.
   - Access/refresh tokens are encrypted at rest (AES-256-GCM, see
     `src/lib/crypto.ts`) before being stored.
   - Redirects back to `FRONTEND_URL/accounts?connected=success|error`.

Design notes:
- State storage: signed HttpOnly cookie (no DB writes, auto-expires in 10 min).
- Token encryption: `TOKEN_ENCRYPTION_KEY`; state signing: `OAUTH_STATE_SECRET`.
- Shared config and the authorization-code token exchange live in
  `src/services/oauth/`. Per-platform profile fetching is added in the
  platform-specific sprints.

## Required environment variables

See `.env.example`. Per platform: `<PLATFORM>_CLIENT_ID` and
`<PLATFORM>_CLIENT_SECRET`. Also `BACKEND_URL` (for redirect URIs),
`TOKEN_ENCRYPTION_KEY`, and `OAUTH_STATE_SECRET`.

Each platform's redirect/callback URL is:
`<BACKEND_URL>/api/accounts/<platform>/callback` — register this exact URL in
the provider's developer portal.

## Developer-portal apps

### X (Twitter) — https://developer.twitter.com
- Create a project + app; enable OAuth 2.0 with PKCE.
- App type: Web App / Confidential client.
- Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`.
- Callback URL: `<BACKEND_URL>/api/accounts/twitter/callback`.
- Copy the OAuth 2.0 Client ID/Secret into `TWITTER_CLIENT_ID/SECRET`.

### LinkedIn — https://www.linkedin.com/developers
- Create an app linked to a Company Page.
- Products: request "Share on LinkedIn" / "Sign In with LinkedIn using OpenID
  Connect" for scopes `openid`, `profile`, `w_member_social`.
- Redirect URL: `<BACKEND_URL>/api/accounts/linkedin/callback`.
- Copy Client ID/Secret into `LINKEDIN_CLIENT_ID/SECRET`.

### Facebook & Instagram — https://developers.facebook.com
- One Meta app covers both (Instagram publishing uses the Facebook Graph API).
- Add "Facebook Login" product; configure Valid OAuth Redirect URIs:
  `<BACKEND_URL>/api/accounts/facebook/callback` and
  `<BACKEND_URL>/api/accounts/instagram/callback`.
- Facebook scopes: `pages_show_list`, `pages_manage_posts`,
  `pages_read_engagement`.
- Instagram scopes: `instagram_basic`, `instagram_content_publish` (plus the
  page scopes; an Instagram Business account linked to a Facebook Page is
  required).
- Production scopes require App Review.
- Copy the App ID/Secret into `FACEBOOK_CLIENT_ID/SECRET` and
  `INSTAGRAM_CLIENT_ID/SECRET` (same Meta app credentials).

## Local testing

Providers can't redirect to `localhost` for some flows. Use a tunnel
(`ngrok http 5000`) and set `BACKEND_URL` to the tunnel URL, then register that
URL's `/callback` paths in each portal.
