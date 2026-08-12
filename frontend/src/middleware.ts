import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/posts(.*)',
  '/analytics(.*)',
  '/calendar(.*)',
  '/settings(.*)',
  '/accounts(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Do NOT run Clerk on /api/* — those are proxied to the Express backend.
    // Running clerkMiddleware on API routes 302s to sign-in (handshake / protect),
    // and the browser then parses HTML instead of JSON.
    '/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
