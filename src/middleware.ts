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
} from "./middlewares";

/**
 * Global middleware to apply a series of middleware functions to incoming requests.
 *
 * This middleware orchestrates the execution of individual middleware functions
 * in a specific order to handle logging, security, rate limiting, authentication,
 * authorization, and error handling.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The final response after processing all middleware.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
    try {
        // 1) Logging (highest priority)
        const logResponse = loggingMiddleware(req);
        if (logResponse) {
            // If logging middleware returns a response, terminate further processing
            return logResponse;
        }

        // 2) Security Headers
        const securityResponse = securityHeadersMiddleware(req);
        if (securityResponse) {
            // Continue processing with security headers applied
            // Typically, securityHeadersMiddleware returns NextResponse.next()
            // So, no need to terminate processing
        }

        // 3) Bandwidth Limiting
        const bandwidthResponse = bandwidthLimitMiddleware(req);
        if (bandwidthResponse) return bandwidthResponse;

        // 4) Content-Type Checking
        const contentTypeResponse = contentTypeCheckMiddleware(req);
        if (contentTypeResponse) return contentTypeResponse;

        // 5) Rate Limiting
        const rateLimitResponse = rateLimitMiddleware(req);
        if (rateLimitResponse) return rateLimitResponse;

        // 6) Authentication
        const authResponse = await authenticateMiddleware(req);
        if (authResponse) return authResponse;

        // 7) Authorization (only for /admin paths)
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const authorizeResponse = authorizeMiddleware(req, ["admin"]);
            if (authorizeResponse) return authorizeResponse;
        }

        // 8) Proceed to the next middleware or route handler
        return NextResponse.next();
    } catch (error) {
        // 9) Error Handling
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
