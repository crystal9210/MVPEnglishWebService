import { NextRequest, NextResponse } from "next/server";
import {
    loggingMiddleware,
    securityHeadersMiddleware,
    bandwidthLimitMiddleware,
    contentTypeCheckMiddleware,
    rateLimitMiddleware,
    authenticateMiddleware,
    authorizeMiddleware,
    errorHandlerMiddleware,
    corsMiddleware,
    cachingMiddleware,
    tracingMiddleware,
    sessionMiddleware,
    timeoutMiddleware,
} from "./middlewares";

/**
 * Global middleware to apply a series of middleware functions to incoming requests.
 *
 * This middleware orchestrates the execution of individual middleware functions
 * in a specific order to handle logging, security, rate limiting, authentication,
 * authorization, CORS, caching, tracing, session management, and error handling.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The final response after processing all middleware.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
    try {
        // 1) Logging (highest priority)
        const logResponse = loggingMiddleware(req);
        if (logResponse) {
            return logResponse;
        }

        // 2) CORS Handling
        const corsResponse = corsMiddleware(req);
        if (corsResponse) {
            return corsResponse;
        }

        // 3) Security Headers
        const securityResponse = securityHeadersMiddleware(req);
        if (securityResponse) {
            // Continue processing with security headers applied
        }

        // 4) Tracing
        const tracingResponse = tracingMiddleware(req);
        if (tracingResponse) {
            // Continue processing with tracing headers applied
        }

        // 5) Bandwidth Limiting
        const bandwidthResponse = bandwidthLimitMiddleware(req);
        if (bandwidthResponse) return bandwidthResponse;

        // 6) Content-Type Checking
        const contentTypeResponse = contentTypeCheckMiddleware(req);
        if (contentTypeResponse) return contentTypeResponse;

        // 7) Caching Control
        const cachingResponse = cachingMiddleware(req);
        if (cachingResponse) {
            // Continue processing with caching headers applied
        }

        // 8) Rate Limiting
        const rateLimitResponse = rateLimitMiddleware(req);
        if (rateLimitResponse) return rateLimitResponse;

        // 9) Session Management
        const sessionResponse = sessionMiddleware(req);
        if (sessionResponse) {
            // Continue processing with session cookies set
        }

        // 10) Request Timeout
        const timeoutResponse = await timeoutMiddleware(req);
        if (timeoutResponse) return timeoutResponse;

        // 11) Authentication
        const authResponse = await authenticateMiddleware(req);
        if (authResponse) return authResponse;

        // 12) Authorization (only for /admin paths)
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const authorizeResponse = authorizeMiddleware(req, ["admin"]);
            if (authorizeResponse) return authorizeResponse;
        }

        // 13) Proceed to the next middleware or route handler
        return NextResponse.next();
    } catch (error) {
        // 14) Error Handling
        return errorHandlerMiddleware(error as Error);
    }
}

/**
 * Configuration for which paths the global middleware should apply to.
 */
export const config = {
    matcher: [
        "/api/:path*",
        "/dashboard/:path*",
        "/register/:path*",
        "/admin/:path*",
    ],
};
