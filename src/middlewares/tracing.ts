import { NextRequest, NextResponse } from "next/server";
import { isDev } from "@/config/envConfig";
import { logger } from "@/config/logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware to add tracing headers for monitoring purposes.
 * Generates a unique request ID in production to facilitate tracing.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse} - The response with tracing headers.
 */
export function tracingMiddleware(req: NextRequest): NextResponse {
    try {
        // Skip tracing in development for performance and simplicity
        if (isDev()) {
            logger.debug(
                `Tracing middleware skipped in development for ${req.method} ${req.url}`
            );
            return NextResponse.next();
        }

        // Retrieve the existing request ID or generate a new one
        const rawRequestId =
            req.headers.get("X-Request-ID") || req.headers.get("x-request-id");
        const requestId = isValidRequestId(rawRequestId)
            ? rawRequestId!
            : generateRequestId();

        logger.info(
            `Tracing request ID: ${requestId} for ${req.method} ${req.url}`
        );

        // Attach the request ID to the response headers
        const response = NextResponse.next();
        response.headers.set("X-Request-ID", requestId);

        return response;
    } catch (error) {
        // Log the error details for debugging and monitoring purposes
        logger.error(`Error in tracing middleware: ${error}`, {
            method: req.method,
            url: req.url,
            error,
        });

        // Gracefully proceed without breaking the request flow
        return NextResponse.next();
    }
}

/**
 * Validates the format of an incoming request ID.
 * - Must be alphanumeric, with optional dashes or underscores.
 * - Length must be between 8 and 36 characters.
 *
 * @param {string | null} id - The request ID to validate.
 * @returns {boolean} - True if the ID is valid, false otherwise.
 */
function isValidRequestId(id: string | null): boolean {
    if (!id) return false;
    const idPattern = /^[a-zA-Z0-9-_]{8,36}$/;
    return idPattern.test(id);
}

/**
 * Generates a secure and unique request ID.
 * Utilizes the uuid library for robust ID generation.
 *
 * @returns {string} - A unique identifier string.
 */
function generateRequestId(): string {
    return uuidv4();
}
