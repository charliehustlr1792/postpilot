import axios from "axios";
import { OAuthProvider, OAuthProfile, OAuthTokens } from "./types";
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

export const linkedinProvider: OAuthProvider = {
    exchangeCode: exchangeAuthorizationCode,
    getProfile,
};
