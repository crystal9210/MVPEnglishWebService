import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDev } from "../config/envConfig";
import { getClientIp } from "../utils/getClientIp";

/**
 * Authenticate middleware to verify JWT tokens issued by NextAuth.js.
 *
 * This middleware checks for valid authentication tokens and attaches the user ID
 * to the request headers for downstream middleware and handlers.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse | undefined>} - Returns a redirect response if authentication fails, otherwise undefined.
 */
export const authenticateMiddleware = async (
    req: NextRequest
): Promise<NextResponse | undefined> => {
    try {
        // Log client IP in development mode
        if (isDev()) {
            console.log(
                "[authenticateMiddleware] client IP =",
                getClientIp(req)
            );
        }

        // Retrieve the token using NextAuth.js's getToken method
        const token = await getToken({ req, secret: process.env.AUTH_SECRET });

        // Define public paths that do not require authentication
        const publicPaths = ["/api/auth", "/register", "/signIn"];

        // Skip authentication for public paths
        if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
            return NextResponse.next();
        }

        // Redirect to sign-in if token is missing or invalid
        if (!token || !token.sub) {
            return NextResponse.redirect(new URL("/signIn", req.url));
        }

        // Attach user role to request headers for authorization middleware
        // Assumes that the token contains a 'role' property. Ensure that NextAuth.js is configured to include user roles in the JWT.
        if (token.role && typeof token.role === "string") {
            req.headers.set("x-user-role", token.role);
        } else {
            // If the role is not present, default to 'user' or handle accordingly
            req.headers.set("x-user-role", "user");
        }

        // Attach user ID to request headers for downstream middleware
        req.headers.set("x-user-id", token.sub);

        // Optionally log token details in development mode
        if (isDev()) {
            console.log("[authenticateMiddleware] token:", token);
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/signIn", req.url));
    }
};
