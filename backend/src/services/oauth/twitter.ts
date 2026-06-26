import axios from "axios";
import { OAuthProvider, OAuthProviderConfig, OAuthProfile, OAuthTokens } from "./types";

// Twitter (X) OAuth 2.0 with PKCE. As a confidential client, Twitter expects the
// client credentials in an HTTP Basic auth header rather than the request body,
// so it overrides the generic authorization-code exchange.

interface TwitterTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
}

interface TwitterUserResponse {
    data: {
        id: string;
        name: string;
        username: string;
        profile_image_url?: string;
    };
}

function basicAuthHeader(config: OAuthProviderConfig): string {
    const credentials = Buffer.from(
        `${config.clientId}:${config.clientSecret}`
    ).toString("base64");
    return `Basic ${credentials}`;
}

async function exchangeCode(
    code: string,
    config: OAuthProviderConfig,
    codeVerifier?: string
): Promise<OAuthTokens> {
    if (!codeVerifier) {
        throw new Error("Twitter OAuth requires a PKCE code verifier");
    }
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: codeVerifier,
    });

    const { data } = await axios.post<TwitterTokenResponse>(
        config.tokenUrl,
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: basicAuthHeader(config),
            },
        }
    );

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}

async function getProfile(tokens: OAuthTokens): Promise<OAuthProfile> {
    const { data } = await axios.get<TwitterUserResponse>(
        "https://api.twitter.com/2/users/me",
        {
            params: { "user.fields": "profile_image_url" },
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
    );

    const user = data.data;
    return {
        platformUserId: user.id,
        username: user.username,
        displayName: user.name,
        profileImage: user.profile_image_url,
    };
}

async function refresh(
    refreshToken: string,
    config: OAuthProviderConfig
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.clientId,
    });

    const { data } = await axios.post<TwitterTokenResponse>(
        config.tokenUrl,
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: basicAuthHeader(config),
            },
        }
    );

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}

export const twitterProvider: OAuthProvider = { exchangeCode, getProfile, refresh };
