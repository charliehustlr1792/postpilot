import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { getAuth } from "@clerk/express";
import { Request, Response } from "express";

// Behind the frontend reverse proxy every request shares the proxy's IP, so we
// key by the authenticated Clerk user (these routes all run after requireAuth).
// Falls back to IP only for the rare unauthenticated case (ipKeyGenerator
// normalizes IPv6 addresses).
function userOrIpKey(req: Request): string {
    const { userId } = getAuth(req);
    return userId ?? ipKeyGenerator(req.ip ?? "unknown");
}

function tooMany(_req: Request, res: Response) {
    res.status(429).json({
        error: "Too many requests — please slow down and try again shortly.",
    });
}

// Limits write-heavy / sensitive actions (post creation, scheduling, account
// connection, uploads) per user.
export const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: tooMany,
});
