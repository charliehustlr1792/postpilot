import { Platform } from "../../types/enums";
import { OAuthProviderConfig } from "./types";

// Static, non-secret OAuth configuration per platform. Endpoints and scopes are
// public and stable; credentials and the redirect URI are layered on at runtime
// from env so the same code works across local/staging/prod.
type StaticProviderConfig = Pick<
    OAuthProviderConfig,
    "authorizationUrl" | "tokenUrl" | "scopes" | "usesPKCE" | "extraAuthParams"
>;

const STATIC_CONFIG: Record<Platform, StaticProviderConfig> = {
    [Platform.TWITTER]: {
        authorizationUrl: "https://twitter.com/i/oauth2/authorize",
        tokenUrl: "https://api.twitter.com/2/oauth2/token",
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        usesPKCE: true,
    },
    [Platform.LINKEDIN]: {
        authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
        scopes: ["openid", "profile", "w_member_social"],
        usesPKCE: false,
    },
    [Platform.FACEBOOK]: {
        authorizationUrl: "https://www.facebook.com/v21.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
        scopes: ["public_profile", "pages_show_list", "pages_manage_posts", "pages_read_engagement"],
        usesPKCE: false,
    },
    [Platform.INSTAGRAM]: {
        // Instagram publishing rides on the Facebook Login / Graph API.
        authorizationUrl: "https://www.facebook.com/v21.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
        scopes: ["public_profile", "pages_show_list", "instagram_basic", "instagram_content_publish"],
        usesPKCE: false,
    },
    [Platform.REDDIT]: {
        authorizationUrl: "https://www.reddit.com/api/v1/authorize",
        tokenUrl: "https://www.reddit.com/api/v1/access_token",
        // identity → /me, submit → post, read → post insights via /api/info.
        scopes: ["identity", "submit", "read"],
        usesPKCE: false,
        // `permanent` makes Reddit issue a refresh token (default is a 1h token).
        extraAuthParams: { duration: "permanent" },
    },
};

function env(name: string): string {
    return process.env[name] ?? "";
}

function buildRedirectUri(platform: Platform): string {
    // The callback is reached through the frontend's reverse proxy, so the
    // redirect URI lives under the public app origin (where the state cookie is
    // also first-party). Register this exact URL in each provider's portal.
    const base = process.env.FRONTEND_URL ?? "http://localhost:3000";
    return `${base}/api/accounts/${platform.toLowerCase()}/callback`;
}

// Resolves the full config (static + env credentials) for a platform.
export function getProviderConfig(platform: Platform): OAuthProviderConfig {
    return {
        platform,
        ...STATIC_CONFIG[platform],
        clientId: env(`${platform}_CLIENT_ID`),
        clientSecret: env(`${platform}_CLIENT_SECRET`),
        redirectUri: buildRedirectUri(platform),
    };
}

// Platforms whose integration code exists but that aren't open for public
// connection yet (e.g. Reddit — API app creation is gated behind Reddit's
// approval). They stay disabled regardless of whether env credentials are set.
const DISABLED_PLATFORMS = new Set<Platform>([Platform.REDDIT]);

/** True if the platform is intentionally turned off for connections. */
export function isPlatformDisabled(platform: Platform): boolean {
    return DISABLED_PLATFORMS.has(platform);
}

/** Platforms whose client id and secret are both set — the ones the UI can offer to connect. */
export function listConfiguredPlatforms(): Platform[] {
    return (Object.values(Platform) as Platform[]).filter((platform) => {
        if (isPlatformDisabled(platform)) return false;
        const config = getProviderConfig(platform);
        return Boolean(config.clientId && config.clientSecret);
    });
}
