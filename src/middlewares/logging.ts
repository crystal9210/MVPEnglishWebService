import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "../utils/getClientIp";
import { logger } from "@/config/logger";

/**
 * Logging middleware.
 *
 * Logs request details and user information.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse} - The response to proceed to the next handler.
 */
export async function loggingMiddleware(
    req: NextRequest
): Promise<NextResponse> {
    const ip = getClientIp(req) || "unknown";
    logger.info("Request received", { method: req.method, url: req.url, ip });

    req.headers.forEach((value, key) => {
        logger.info("Request header", { header: key, value });
    });

    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    if (userId && userRole) {
        logger.info("User information", { userId, userRole });
    }

    return NextResponse.next();
}
