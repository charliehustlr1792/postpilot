import { Platform } from "../../types/enums";
import { OAuthProviderConfig } from "./types";

// Static, non-secret OAuth configuration per platform. Endpoints and scopes are
// public and stable; credentials and the redirect URI are layered on at runtime
// from env so the same code works across local/staging/prod.
type StaticProviderConfig = Pick<
    OAuthProviderConfig,
    "authorizationUrl" | "tokenUrl" | "scopes" | "usesPKCE"
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
};

function env(name: string): string {
    return process.env[name] ?? "";
}

function buildRedirectUri(platform: Platform): string {
    const base =
        process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
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
