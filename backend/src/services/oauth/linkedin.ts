import axios from "axios";
import { OAuthProvider, OAuthProviderConfig, OAuthProfile, OAuthTokens } from "./types";
import { exchangeAuthorizationCode } from "./exchange";

// LinkedIn OAuth 2.0. The token exchange is standard (client credentials in the
// body), so it reuses the generic exchange. Profile comes from the OpenID
// Connect userinfo endpoint, available with the `openid profile` scopes.

interface LinkedInUserInfo {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}

async function getProfile(tokens: OAuthTokens): Promise<OAuthProfile> {
    const { data } = await axios.get<LinkedInUserInfo>(
        "https://api.linkedin.com/v2/userinfo",
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
    );

    // LinkedIn doesn't expose a public handle via these scopes, so the member's
    // name is the most meaningful identifier to show.
    const name = data.name ?? [data.given_name, data.family_name].filter(Boolean).join(" ");
    return {
        platformUserId: data.sub,
        username: name || data.sub,
        displayName: name || undefined,
        profileImage: data.picture,
    };
}

// Refresh tokens are issued only to approved LinkedIn apps; when available the
// exchange is the standard refresh_token grant.
async function refresh(
    refreshToken: string,
    config: OAuthProviderConfig
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
    });

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

export const linkedinProvider: OAuthProvider = {
    exchangeCode: exchangeAuthorizationCode,
    getProfile,
    refresh,
};
