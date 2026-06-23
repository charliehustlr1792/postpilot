import axios from "axios";
import { Platform } from "../../types/enums";
import { OAuthProvider, OAuthProviderConfig, OAuthTokens } from "./types";

export { getProviderConfig } from "./providers";

// Standard OAuth 2.0 authorization-code token exchange (form-encoded POST).
// Works for the platforms we target; PKCE providers also send the verifier.
// Platform modules can override this if a provider deviates.
export async function exchangeAuthorizationCode(
    code: string,
    config: OAuthProviderConfig,
    codeVerifier?: string
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
    });
    if (codeVerifier) {
        body.set("code_verifier", codeVerifier);
    }

    const { data } = await axios.post<{
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    }>(config.tokenUrl, body.toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
    });

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}

// Per-platform profile fetching is implemented in the platform sprints (3.2–3.4):
// each provider's user/me endpoint and response shape differs. Until then the
// flow is wired end-to-end but stops here with a clear, recorded error.
function profilePending(platform: Platform): never {
    throw new Error(`getProfile for ${platform} is not implemented yet`);
}

const twitterProvider: OAuthProvider = {
    exchangeCode: exchangeAuthorizationCode,
    getProfile: async () => profilePending(Platform.TWITTER),
};

const linkedinProvider: OAuthProvider = {
    exchangeCode: exchangeAuthorizationCode,
    getProfile: async () => profilePending(Platform.LINKEDIN),
};

const facebookProvider: OAuthProvider = {
    exchangeCode: exchangeAuthorizationCode,
    getProfile: async () => profilePending(Platform.FACEBOOK),
};

const instagramProvider: OAuthProvider = {
    exchangeCode: exchangeAuthorizationCode,
    getProfile: async () => profilePending(Platform.INSTAGRAM),
};

const PROVIDERS: Record<Platform, OAuthProvider> = {
    [Platform.TWITTER]: twitterProvider,
    [Platform.LINKEDIN]: linkedinProvider,
    [Platform.FACEBOOK]: facebookProvider,
    [Platform.INSTAGRAM]: instagramProvider,
};

export function getOAuthProvider(platform: Platform): OAuthProvider {
    return PROVIDERS[platform];
}
