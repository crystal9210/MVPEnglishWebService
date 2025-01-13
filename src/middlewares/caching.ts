import { NextRequest, NextResponse } from "next/server";

// TODO Set up the values in the production env securely and correctly
const STATIC_CACHE_POLICY =
    process.env.STATIC_CACHE_POLICY || "public, max-age=3600, immutable";
const API_NO_CACHE_POLICY =
    process.env.API_NO_CACHE_POLICY ||
    "no-store, no-cache, must-revalidate, proxy-revalidate";

/**
 * Validate pathname to ensure it does not contain invalid or malicious patterns.
 * @param {string} pathname - The pathname to validate.
 * @returns {boolean} - True if the pathname is valid, otherwise false.
 */
function isValidPathname(pathname: string): boolean {
    // Path traversal or invalid patterns
    if (pathname.includes("../") || pathname.includes("..\\")) {
        return false;
    }
    return true;
}

/**
 * Determine the cache policy based on the request path.
 * @param {string} pathname - The pathname of the request.
 * @returns {string} - Cache-Control header value.
 */
function getCachePolicy(pathname: string): string {
    if (pathname.startsWith("/api")) {
        return API_NO_CACHE_POLICY;
    }
    return STATIC_CACHE_POLICY;
}

/**
 * Middleware to control caching headers and security headers.
 * @param {NextRequest | null} req - The incoming request object.
 * @returns {NextResponse | undefined} - The response with appropriate headers or undefined for invalid requests.
 */
export function cachingMiddleware(
    req: NextRequest | null
): NextResponse | undefined {
    // Handle invalid request
    if (!req || !req.nextUrl) {
        return undefined;
    }

    const pathname = req.nextUrl.pathname;

    // Validate pathname
    if (!isValidPathname(pathname)) {
        return undefined;
    }

    const response = NextResponse.next();

    // Set Cache-Control header based on route
    const cachePolicy = getCachePolicy(pathname);
    response.headers.set("Cache-Control", cachePolicy);

    // Add common security headers
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Content-Security-Policy", "default-src 'self';");

    return response;
}
