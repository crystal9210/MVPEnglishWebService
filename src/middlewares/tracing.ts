import { NextRequest, NextResponse } from "next/server";
import { isDev } from "@/config/envConfig";
import { logger } from "@/config/logger";

/**
 * Middleware to add tracing headers for monitoring purposes.
 * In production, a unique request ID is generated for each request to facilitate tracing.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse | undefined} - The response with tracing headers.
 */
export function tracingMiddleware(req: NextRequest): NextResponse | undefined {
    // Only add tracing headers in production to reduce overhead in development
    if (!isDev()) {
        const requestId =
            req.headers.get("x-request-id") || generateRequestId();
        logger.info(
            `Tracing request ID: ${requestId} for ${req.method} ${req.url}`
        );
        const response = NextResponse.next();
        response.headers.set("X-Request-ID", requestId);
        // Integrate with a tracing service by sending the requestId if needed
        return response;
    }

    logger.debug(
        `Tracing middleware skipped in development for ${req.method} ${req.url}`
    );
    // In development, proceed without adding tracing headers
    return NextResponse.next();
}

/**
 * Utility function to generate a unique request ID.
 *
 * @returns {string} - A unique identifier string.
 */
function generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
}
