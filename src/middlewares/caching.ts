import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to control caching headers.
 * Disables caching for API routes and enables caching for static assets.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse | undefined} - The response with appropriate caching headers.
 */
export function cachingMiddleware(req: NextRequest): NextResponse | undefined {
    const response = NextResponse.next();

    // Disable caching for API routes to ensure fresh data
    if (req.nextUrl.pathname.startsWith("/api")) {
        response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
    } else {
        // Enable caching for static assets for 1 hour
        response.headers.set(
            "Cache-Control",
            "public, max-age=3600, immutable"
        );
    }

    return response;
}
