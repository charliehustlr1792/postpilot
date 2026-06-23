import crypto from "crypto";
import { Request, Response } from "express";

// CSRF/state for the OAuth redirect round-trip is carried in a short-lived,
// signed, HttpOnly cookie. The callback arrives as a top-level browser redirect
// that does NOT carry the Clerk session, so this cookie is also where we stash
// the initiating user's clerkId (and the PKCE verifier for providers that need
// it). Signing prevents tampering; HttpOnly keeps it away from page scripts.

const COOKIE_NAME = "pp_oauth_state";
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const COOKIE_PATH = "/api/accounts";

export interface OAuthStatePayload {
    state: string;
    platform: string;
    clerkUserId: string;
    codeVerifier?: string;
}

function getSecret(): string {
    const secret = process.env.OAUTH_STATE_SECRET;
    if (!secret) {
        throw new Error("OAUTH_STATE_SECRET is not set");
    }
    return secret;
}

function sign(value: string): string {
    return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function setOAuthStateCookie(res: Response, payload: OAuthStatePayload): void {
    const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signed = `${value}.${sign(value)}`;
    res.cookie(COOKIE_NAME, signed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE_MS,
        path: COOKIE_PATH,
    });
}

export function readOAuthStateCookie(req: Request): OAuthStatePayload | null {
    const raw = parseCookie(req.headers.cookie, COOKIE_NAME);
    if (!raw) return null;

    const dot = raw.lastIndexOf(".");
    if (dot < 0) return null;
    const value = raw.slice(0, dot);
    const signature = raw.slice(dot + 1);

    const expected = sign(value);
    if (
        signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
        return null;
    }

    try {
        return JSON.parse(
            Buffer.from(value, "base64url").toString("utf8")
        ) as OAuthStatePayload;
    } catch {
        return null;
    }
}

export function clearOAuthStateCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, { path: COOKIE_PATH });
}

function parseCookie(header: string | undefined, name: string): string | null {
    if (!header) return null;
    for (const part of header.split(";")) {
        const eq = part.indexOf("=");
        if (eq < 0) continue;
        const key = part.slice(0, eq).trim();
        if (key === name) {
            return decodeURIComponent(part.slice(eq + 1).trim());
        }
    }
    return null;
}
