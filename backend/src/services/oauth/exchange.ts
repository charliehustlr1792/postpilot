import axios from "axios";
import { OAuthProviderConfig, OAuthTokens } from "./types";

// Standard OAuth 2.0 authorization-code token exchange (form-encoded POST with
// the client credentials in the body). Works for providers that follow the spec
// closely (e.g. LinkedIn). Providers that deviate (Twitter's Basic auth, Meta's
// GET + long-lived exchange) implement their own.
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
