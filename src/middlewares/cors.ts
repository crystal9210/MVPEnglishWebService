import { NextRequest, NextResponse } from "next/server";
import { isDev, isHttpForDev, shouldEnforceHttps } from "@/config/envConfig";
import { logger } from "@/config/logger";

/**
 * Middleware to handle Cross-Origin Resource Sharing (CORS) settings.
 * Configures CORS policies based on the environment (development or production).
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse | undefined} - The response with appropriate CORS headers.
 */
export function corsMiddleware(req: NextRequest): NextResponse | undefined {
    const allowedOrigins = [
        "https://yourdomain.com",
        "https://www.yourdomain.com",
    ];

    const origin = req.headers.get("origin");

    // Determine if HTTPS should be enforced
    const enforceHttps = shouldEnforceHttps();

    if (enforceHttps && origin && !origin.startsWith("https://")) {
        logger.warn(
            `Rejected insecure request: ${req.method} ${req.url} Origin: ${origin}`
        );
        // Reject requests that do not use HTTPS in production
        return NextResponse.json(
            { error: "HTTPS is required." },
            { status: 403 }
        );
    }

    // Allow CORS for specified origins
    if (origin && allowedOrigins.includes(origin)) {
        logger.info(`CORS allowed for origin: ${origin}`);
        const response = NextResponse.next();
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        response.headers.set("Access-Control-Allow-Credentials", "true");
        return response;
    }

    // In development, allow all origins if using HTTP
    if (isDev() && isHttpForDev()) {
        logger.info(
            `CORS allowed for all origins in development: ${req.method} ${req.url}`
        );
        const response = NextResponse.next();
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        response.headers.set("Access-Control-Allow-Credentials", "true");
        return response;
    }

    logger.debug(`CORS headers not set for origin: ${origin}`);
    // For disallowed origins, proceed without setting CORS headers
    return NextResponse.next();
}
