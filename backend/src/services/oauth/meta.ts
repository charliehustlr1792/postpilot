import axios from "axios";
import { OAuthProvider, OAuthProviderConfig, OAuthProfile, OAuthTokens } from "./types";

// Facebook & Instagram OAuth via the Meta Graph API. Both use the same login and
// token flow; they differ only in how the connected account is resolved:
//   - Facebook publishes to a Page (uses the Page access token + Page id).
//   - Instagram publishes to the IG Business account linked to a Page (uses the
//     same Page access token + the IG account id).
// Meta's token endpoint is a GET, and short-lived tokens are swapped for
// long-lived ones (Meta has no refresh-token grant).

interface MetaTokenResponse {
    access_token: string;
    expires_in?: number;
}

interface MetaPicture {
    data?: { url?: string };
}

interface MetaPage {
    id: string;
    name: string;
    access_token: string;
    picture?: MetaPicture;
    instagram_business_account?: {
        id: string;
        username: string;
        profile_picture_url?: string;
    };
}

interface MetaAccountsResponse {
    data: MetaPage[];
}

// Code exchange (GET) followed by the long-lived token swap.
async function exchangeCode(
    code: string,
    config: OAuthProviderConfig
): Promise<OAuthTokens> {
    const { data: shortLived } = await axios.get<MetaTokenResponse>(config.tokenUrl, {
        params: {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirectUri,
            code,
        },
    });

    const { data: longLived } = await axios.get<MetaTokenResponse>(config.tokenUrl, {
        params: {
            grant_type: "fb_exchange_token",
            client_id: config.clientId,
            client_secret: config.clientSecret,
            fb_exchange_token: shortLived.access_token,
        },
    });

    return {
        accessToken: longLived.access_token,
        expiresIn: longLived.expires_in,
    };
}

// Fetches the Pages the user manages, including their Page tokens and any linked
// Instagram Business account.
async function fetchPages(userAccessToken: string): Promise<MetaPage[]> {
    const { data } = await axios.get<MetaAccountsResponse>(
        "https://graph.facebook.com/v21.0/me/accounts",
        {
            params: {
                fields: "id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}",
                access_token: userAccessToken,
            },
        }
    );
    return data.data ?? [];
}

async function getFacebookProfile(tokens: OAuthTokens): Promise<OAuthProfile> {
    const pages = await fetchPages(tokens.accessToken);
    const page = pages[0];
    if (!page) {
        throw new Error("No Facebook Page found for this account");
    }
    return {
        platformUserId: page.id,
        username: page.name,
        displayName: page.name,
        profileImage: page.picture?.data?.url,
        // Publishing to a Page uses the Page access token, not the user token.
        accessToken: page.access_token,
    };
}

async function getInstagramProfile(tokens: OAuthTokens): Promise<OAuthProfile> {
    const pages = await fetchPages(tokens.accessToken);
    const page = pages.find((p) => p.instagram_business_account);
    if (!page || !page.instagram_business_account) {
        throw new Error("No Instagram Business account linked to a Facebook Page");
    }
    const ig = page.instagram_business_account;
    return {
        platformUserId: ig.id,
        username: ig.username,
        displayName: ig.username,
        profileImage: ig.profile_picture_url,
        // IG publishing goes through the linked Page's access token.
        accessToken: page.access_token,
    };
}

export const facebookProvider: OAuthProvider = {
    exchangeCode,
    getProfile: getFacebookProfile,
};

export const instagramProvider: OAuthProvider = {
    exchangeCode,
    getProfile: getInstagramProfile,
};
