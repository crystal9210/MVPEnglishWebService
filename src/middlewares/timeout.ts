import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/config/logger";

/**
 * Middleware to enforce a maximum request processing time.
 * If the processing exceeds the specified timeout, respond with a 503 error.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - The response after enforcing the timeout.
 */
export async function timeoutMiddleware(
    req: NextRequest
): Promise<NextResponse> {
    const MAX_REQUEST_TIME_MS = 5000; // 5 seconds

    // Log the incoming request
    logger.info(`Processing request: ${req.method} ${req.url}`);

    // Create a promise that resolves with a timeout response after the specified duration
    const timeoutPromise = new Promise<NextResponse>((resolve) => {
        setTimeout(() => {
            logger.error(`Request timed out: ${req.method} ${req.url}`);
            resolve(
                NextResponse.json(
                    { error: "Request timed out" },
                    { status: 503 }
                )
            );
        }, MAX_REQUEST_TIME_MS);
    });

    // Create a promise that proceeds to the next middleware or route handler
    const nextMiddlewarePromise = Promise.resolve(NextResponse.next());

    // Race between the timeout and the actual request processing
    return Promise.race([timeoutPromise, nextMiddlewarePromise]);
}
