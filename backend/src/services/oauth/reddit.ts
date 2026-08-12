import axios from "axios";
import { OAuthProvider, OAuthProviderConfig, OAuthProfile, OAuthTokens } from "./types";

// Reddit OAuth 2.0. Reddit is a confidential client: the token exchange expects
// the client credentials in an HTTP Basic auth header (not the body), and every
// request MUST carry a descriptive User-Agent or Reddit rate-limits/blocks it.

// Reddit asks for a unique UA in the form `platform:appid:version (by /u/user)`.
export const REDDIT_USER_AGENT =
    process.env.REDDIT_USER_AGENT ?? "web:postpilot:v1.0.0 (by /u/postpilot)";

interface RedditTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
}

interface RedditMeResponse {
    id: string;
    name: string;
    icon_img?: string;
    snoovatar_img?: string;
}

function basicAuthHeader(config: OAuthProviderConfig): string {
    const credentials = Buffer.from(
        `${config.clientId}:${config.clientSecret}`
    ).toString("base64");
    return `Basic ${credentials}`;
}

async function exchangeCode(
    code: string,
    config: OAuthProviderConfig
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
    });

    const { data } = await axios.post<RedditTokenResponse>(
        config.tokenUrl,
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: basicAuthHeader(config),
                "User-Agent": REDDIT_USER_AGENT,
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
    const { data } = await axios.get<RedditMeResponse>(
        "https://oauth.reddit.com/api/v1/me",
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                "User-Agent": REDDIT_USER_AGENT,
            },
        }
    );

    // Reddit encodes `&` as `&amp;` in the signed icon URL; decode so it loads.
    const image = (data.icon_img ?? data.snoovatar_img)?.replace(/&amp;/g, "&");
    return {
        platformUserId: data.id,
        username: data.name,
        displayName: data.name,
        profileImage: image || undefined,
    };
}

async function refresh(
    refreshToken: string,
    config: OAuthProviderConfig
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    });

    const { data } = await axios.post<RedditTokenResponse>(
        config.tokenUrl,
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: basicAuthHeader(config),
                "User-Agent": REDDIT_USER_AGENT,
            },
        }
    );

    return {
        accessToken: data.access_token,
        // Reddit doesn't rotate the refresh token on refresh; keep the old one.
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}

export const redditProvider: OAuthProvider = { exchangeCode, getProfile, refresh };
