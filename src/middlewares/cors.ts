import { NextRequest, NextResponse } from "next/server";
import { isDev, isHttpForDev, shouldEnforceHttps } from "@/config/envConfig";
import { logger } from "@/config/logger";

/**
 * Middleware to handle Cross-Origin Resource Sharing (CORS) settings.
 * This middleware configures CORS policies dynamically based on the environment
 * (development or production) and enforces HTTPS for secure requests.
 *
 * @param {NextRequest} req - The incoming HTTP request object.
 * @returns {NextResponse | undefined} - The response with appropriate CORS headers.
 */
export function corsMiddleware(req: NextRequest): NextResponse | undefined {
    const allowedOrigins = [
        "https://yourdomain.com",
        "https://www.yourdomain.com",
    ]; // List of allowed origins for production

    const origin = req.headers.get("origin"); // Get the 'Origin' header from the incoming request
    const enforceHttps = shouldEnforceHttps(); // Determine if HTTPS should be enforced

    /**
     * Enforce HTTPS for secure communication
     * - If HTTPS is required and the request does not originate from a secure URL, reject it.
     * - Log the rejection for debugging and monitoring purposes.
     */
    if (enforceHttps) {
        if (!origin || !origin.startsWith("https://")) {
            logger.warn(
                `Rejected insecure request: ${req.method} ${req.url} Origin: ${origin}`
            );
            return NextResponse.json(
                { error: "HTTPS is required." },
                { status: 403 }
            );
        }
    }

    /**
     * Handle preflight (OPTIONS) requests
     * - These requests are used by browsers to check CORS policies before sending the actual request.
     * - Configure appropriate headers based on the origin and environment.
     */
    if (req.method === "OPTIONS") {
        const responseHeaders = new Headers();

        // If the request's origin is allowed, set CORS headers
        if (origin && allowedOrigins.includes(origin)) {
            logger.info(`CORS allowed for origin (preflight): ${origin}`);
            responseHeaders.set("Access-Control-Allow-Origin", origin);
        } else if (isDev() && isHttpForDev()) {
            // Allow all origins in development mode for easier testing
            logger.info(
                `CORS allowed for all origins in development (preflight): ${req.method} ${req.url}`
            );
            responseHeaders.set("Access-Control-Allow-Origin", "*");
        } else {
            // If the origin is not allowed, log it and respond with 204 (no CORS headers set)
            logger.debug(
                `CORS headers not set for origin (preflight): ${origin}`
            );
            return new NextResponse(null, {
                status: 204,
                headers: responseHeaders,
            });
        }

        // Set additional headers for preflight responses
        responseHeaders.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        responseHeaders.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        responseHeaders.set("Access-Control-Allow-Credentials", "true");

        return new NextResponse(null, {
            status: 204,
            headers: responseHeaders,
        });
    } else {
        /**
         * Step 3: Handle other requests (e.g., GET, POST, PUT, DELETE)
         * - If the origin is allowed, set the CORS headers accordingly.
         * - Otherwise, log and do not set CORS headers for disallowed origins.
         */
        const response = NextResponse.next(); // Proceed with the request pipeline

        if (origin && allowedOrigins.includes(origin)) {
            // For allowed origins, configure CORS headers
            logger.info(`CORS allowed for origin: ${origin}`);
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
        } else if (isDev() && isHttpForDev()) {
            // Allow all origins in development for testing
            logger.info(
                `CORS allowed for all origins in development: ${req.method} ${req.url}`
            );
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
        } else {
            // For disallowed origins, log the information
            logger.debug(`CORS headers not set for origin: ${origin}`);
        }

        return response;
    }
}
