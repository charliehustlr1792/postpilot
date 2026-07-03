import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma";
import { AppError } from "../lib/AppError";

// 404 for unmatched routes.
export function notFound(req: Request, res: Response) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler: maps known error types to a uniform { error } shape and
// logs unexpected failures. Registered last, after all routes. Express 5 forwards
// errors thrown/rejected in async handlers here automatically.
export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    // Expected, operational errors carry their own status.
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Known Prisma errors we can translate meaningfully.
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "A record with these details already exists" });
        }
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Record not found" });
        }
    }

    // Anything else is unexpected: log the detail, return a generic message.
    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Something went wrong" });
}
