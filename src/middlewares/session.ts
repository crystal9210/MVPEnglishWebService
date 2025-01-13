import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Default maximum age for session cookies in seconds (1 hour)
const DEFAULT_MAX_AGE = 3600;

// Secret key for signing JWTs. Always use environment variables for sensitive data.
const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

// JWT expiration time in seconds (converted from "1h" to number for mathematical operations)
const JWT_EXPIRES_IN = 3600;

/**
 * Middleware: handles session management using JWT and session ID.
 *
 * Combines traditional session ID management with JWT-based token authentication.
 * Ensures session IDs are unique and manages JWT refresh when nearing expiration.
 *
 * @param {NextRequest} req - The incoming request object from Next.js.
 * @returns {NextResponse} - The modified response object with cookies or an error.
 */
export function sessionMiddleware(req: NextRequest): NextResponse {
    const secure = process.env.NODE_ENV !== "development"; // Secure cookies in production environments
    const response = NextResponse.next();

    // Retrieve existing cookies for session ID and JWT token
    const sessionId = req.cookies.get("sessionId")?.value;
    const jwtToken = req.cookies.get("jwt")?.value;

    // JWT-based session management
    if (jwtToken) {
        try {
            // Verify the JWT token
            const decoded = jwt.verify(jwtToken, JWT_SECRET) as jwt.JwtPayload;

            // Calculate time until the token expires
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const timeToExpire = decoded.exp ? decoded.exp - currentTime : 0;

            // Refresh the token if it's nearing expiration (less than 50% of total time remaining)
            if (timeToExpire < JWT_EXPIRES_IN / 2) {
                console.log("JWT is nearing expiration. Refreshing token...");

                // Sign a new JWT with the same payload
                const refreshedToken = jwt.sign(
                    { sub: decoded.sub, roles: decoded.roles },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRES_IN }
                );

                // Set the refreshed JWT token as a cookie
                response.cookies.set({
                    name: "jwt",
                    value: refreshedToken,
                    httpOnly: true, // Prevent access to the cookie via JavaScript
                    secure, // Only send the cookie over HTTPS in production
                    sameSite: "strict", // Prevent the cookie from being sent on cross-site requests
                    path: "/", // Cookie is valid for the entire domain
                });
            }
        } catch (error) {
            console.error("Invalid or expired JWT token:", error);

            // Delete the invalid JWT token from cookies
            response.cookies.delete("jwt");

            // Return a 401 Unauthorized response for invalid tokens
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
    } else {
        // If no JWT is present, remove any existing JWT cookie for cleanup
        response.cookies.delete("jwt");
    }

    // Traditional session ID management
    if (!sessionId) {
        // Generate a new session ID if it doesn't exist
        const newSessionId = generateSessionId();

        response.cookies.set({
            name: "sessionId",
            value: newSessionId,
            httpOnly: true, // Secure the cookie from JavaScript access
            secure, // Secure the cookie in production
            sameSite: "strict", // Prevent cross-site request leakage
            path: "/", // Cookie is valid for the entire site
            maxAge: DEFAULT_MAX_AGE, // Expiration time for the session cookie
        });
    }

    // Issue a new JWT if none exists
    if (!jwtToken) {
        const newJwtToken = jwt.sign({ sub: "defaultUser" }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN, // Expire in 1 hour
        });

        response.cookies.set({
            name: "jwt",
            value: newJwtToken,
            httpOnly: true, // Prevent access to the cookie via JavaScript
            secure, // Only send the cookie over HTTPS in production
            sameSite: "strict", // Prevent the cookie from being sent on cross-site requests
            path: "/", // Cookie is valid for the entire domain
        });
    }

    return response;
}

/**
 * Utility function to generate unique session IDs.
 *
 * Generates a secure, random session ID by converting 16 random bytes into a hexadecimal string.
 *
 * @returns {string} - The generated session ID.
 */
function generateSessionId(): string {
    return crypto.randomBytes(16).toString("hex");
}
