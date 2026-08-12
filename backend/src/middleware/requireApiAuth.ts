import { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { AppError } from '../lib/AppError';

/**
 * API-only auth gate. Clerk's requireAuth() redirects unauthenticated
 * requests (302 to the sign-in page). The SPA fetch() follows that redirect,
 * receives HTML, and blows up trying to read JSON. Always 401 JSON instead.
 */
export function requireApiAuth(req: Request, _res: Response, next: NextFunction) {
    const { userId } = getAuth(req);
    if (!userId) {
        return next(new AppError(401, 'User not authenticated'));
    }
    next();
}
