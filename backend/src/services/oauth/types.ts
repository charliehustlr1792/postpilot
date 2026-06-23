import { Platform } from "../../types/enums";

// Tokens returned by a provider's token endpoint, normalized across platforms.
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number; // seconds until the access token expires
}

// The connected account's identity, normalized across platforms.
export interface OAuthProfile {
    platformUserId: string;
    username: string;
    displayName?: string;
    profileImage?: string;
}

// Static + env-driven configuration for one platform's OAuth flow.
export interface OAuthProviderConfig {
    platform: Platform;
    authorizationUrl: string;
    tokenUrl: string;
    scopes: string[];
    usesPKCE: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

// Per-platform OAuth behaviour. The generic authorization-code exchange covers
// most providers; getProfile is platform-specific (different endpoints/shapes)
// and is implemented in the per-platform sprints (3.2–3.4).
export interface OAuthProvider {
    exchangeCode(
        code: string,
        config: OAuthProviderConfig,
        codeVerifier?: string
    ): Promise<OAuthTokens>;
    getProfile(tokens: OAuthTokens, config: OAuthProviderConfig): Promise<OAuthProfile>;
    refresh?(refreshToken: string, config: OAuthProviderConfig): Promise<OAuthTokens>;
}
