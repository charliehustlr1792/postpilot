import crypto from "crypto";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import prisma from "../lib/db";
import { encrypt } from "../lib/crypto";
import {
    clearOAuthStateCookie,
    readOAuthStateCookie,
    setOAuthStateCookie,
} from "../lib/oauthState";
import { Platform } from "../types/enums";
import { getOAuthProvider, getProviderConfig } from "../services/oauth";
import { AppError } from "../lib/AppError";

// Maps the lowercase URL segment (e.g. "twitter") to a Platform enum value.
function parsePlatform(value: string): Platform | null {
    const upper = value.toUpperCase();
    return upper in Platform ? (upper as Platform) : null;
}

function frontendRedirect(res: Response, params: Record<string, string>) {
    const base = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const query = new URLSearchParams(params).toString();
    return res.redirect(`${base}/accounts?${query}`);
}

// GET /api/accounts/:platform/auth  (authenticated)
// Builds the provider consent URL, stashes CSRF state + the initiating user in a
// signed cookie, and returns the URL as JSON. The SPA then navigates the browser
// to it (a top-level redirect can't carry the Clerk bearer token, so the client
// fetches this with credentials and redirects itself).
export const startOAuth = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, "User not authenticated");
    }

    const platform = parsePlatform(req.params.platform);
    if (!platform) {
        throw new AppError(400, "Unsupported platform");
    }

    const config = getProviderConfig(platform);
    if (!config.clientId || !config.clientSecret) {
        throw new AppError(503, `${platform} OAuth is not configured`);
    }

    const state = crypto.randomBytes(16).toString("hex");
    const authParams = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scopes.join(" "),
        state,
    });

    let codeVerifier: string | undefined;
    if (config.usesPKCE) {
        codeVerifier = crypto.randomBytes(32).toString("base64url");
        const challenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");
        authParams.set("code_challenge", challenge);
        authParams.set("code_challenge_method", "S256");
    }

    setOAuthStateCookie(res, { state, platform, clerkUserId: userId, codeVerifier });
    return res.json({ url: `${config.authorizationUrl}?${authParams.toString()}` });
};

// GET /api/accounts/:platform/callback  (unauthenticated; identity comes from
// the signed state cookie set in startOAuth)
export const oauthCallback = async (req: Request, res: Response) => {
    const platform = parsePlatform(req.params.platform);
    const { code, state, error } = req.query;

    const stored = readOAuthStateCookie(req);
    clearOAuthStateCookie(res);

    if (error) {
        return frontendRedirect(res, { connected: "error", reason: String(error) });
    }
    if (!platform || !stored || stored.platform !== platform) {
        return frontendRedirect(res, { connected: "error", reason: "invalid_state" });
    }
    if (typeof code !== "string" || typeof state !== "string" || state !== stored.state) {
        return frontendRedirect(res, { connected: "error", reason: "invalid_state" });
    }

    try {
        const provider = getOAuthProvider(platform);
        const config = getProviderConfig(platform);

        const tokens = await provider.exchangeCode(code, config, stored.codeVerifier);
        const profile = await provider.getProfile(tokens, config);

        const user = await prisma.user.findUnique({
            where: { clerkId: stored.clerkUserId },
        });
        if (!user) {
            return frontendRedirect(res, { connected: "error", reason: "user_not_found" });
        }

        // A provider may publish with a different token than the exchange's
        // (e.g. a Meta Page token), which carries no separate expiry.
        const accessToken = profile.accessToken ?? tokens.accessToken;
        const tokenExpiry =
            !profile.accessToken && tokens.expiresIn
                ? new Date(Date.now() + tokens.expiresIn * 1000)
                : null;
        const refreshToken = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;

        await prisma.socialAccount.upsert({
            where: { userId_platform: { userId: user.id, platform } },
            create: {
                userId: user.id,
                platform,
                username: profile.username,
                displayName: profile.displayName,
                profileImage: profile.profileImage,
                platformAccountId: profile.platformUserId,
                accessToken: encrypt(accessToken),
                refreshToken,
                tokenExpiry,
            },
            update: {
                username: profile.username,
                displayName: profile.displayName,
                profileImage: profile.profileImage,
                platformAccountId: profile.platformUserId,
                accessToken: encrypt(accessToken),
                refreshToken,
                tokenExpiry,
                isActive: true,
            },
        });

        return frontendRedirect(res, {
            connected: "success",
            platform: platform.toLowerCase(),
        });
    } catch (err) {
        console.error(`OAuth callback error for ${platform}:`, err);
        return frontendRedirect(res, { connected: "error", reason: "exchange_failed" });
    }
};
