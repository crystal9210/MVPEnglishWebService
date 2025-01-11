import { NextRequest } from "next/server";

/**
 * Utility function to get client IP from request headers.
 *
 * This function extracts the client's IP address by first checking the "x-forwarded-for"
 * header, which may contain a list of IPs if the request has passed through proxies.
 * If "x-forwarded-for" is not present, it falls back to the "x-real-ip" header.
 * If neither header is available, it returns "unknown".
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {string} - The client's IP address, or "unknown" if not found.
 */
export const getClientIp = (req: NextRequest): string => {
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");

    if (xForwardedFor) {
        const ips = xForwardedFor.split(",");
        return ips[0].trim();
    } else if (xRealIp) {
        return xRealIp.trim();
    }

    return "unknown";
};
