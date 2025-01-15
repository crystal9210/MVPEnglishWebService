import { NextRequest, NextResponse } from "next/server";
import jwt, {
    TokenExpiredError,
    JsonWebTokenError,
    NotBeforeError,
} from "jsonwebtoken";
import { isDev, shouldEnforceHttps } from "@/config/envConfig";

const JWT_EXPIRES_IN = 3600; // 1 hour
const REFRESH_THRESHOLD = JWT_EXPIRES_IN / 2; // 30 min

// 環境変数からJWT_SECRETを取得
const JWT_SECRET = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error(
            "JWT_SECRET is not defined. Please set the JWT_SECRET environment variable."
        );
    }
    return secret;
})();

/**
 * Middleware: handles session management using JWT.
 * Compatible with NextAuth's "jwt" session strategy.
 *
 * @param {NextRequest} req - The incoming request object from Next.js.
 * @returns {NextResponse | undefined} - The modified response object or undefined if pass-through.
 */
export function sessionMiddleware(req: NextRequest): NextResponse | undefined {
    // Decide if we should use secure cookies
    // "shouldEnforceHttps()" → true なら secure=true, falseなら secure=false
    // さらに isDev() ならコンソールに詳細ログを出すイメージ
    const secure = shouldEnforceHttps();

    // Start with next() so we can mutate cookies if needed
    const response = NextResponse.next();

    try {
        // 1) Retrieve JWT token
        const jwtToken = req.cookies.get("jwt")?.value;
        if (!jwtToken) {
            if (isDev()) {
                console.warn(
                    "[SessionMiddleware] No JWT token found in cookies. Passing through..."
                );
            }
            return undefined; // pass through
        }

        // 2) Verify the JWT token
        const decoded = jwt.verify(jwtToken, JWT_SECRET) as jwt.JwtPayload;
        if (!decoded || typeof decoded !== "object") {
            if (isDev()) {
                console.error(
                    "[SessionMiddleware] Invalid JWT payload structure:",
                    decoded
                );
            }
            response.cookies.delete("jwt");
            return NextResponse.json(
                { error: "Unauthorized: Invalid JWT structure" },
                { status: 401 }
            );
        }

        // 3) Exp check
        const currentTime = Math.floor(Date.now() / 1000);
        const timeToExpire = (decoded.exp ?? 0) - currentTime;
        if (!decoded.exp || timeToExpire <= 0) {
            if (isDev()) {
                console.warn(
                    "[SessionMiddleware] JWT token is expired or missing 'exp' field."
                );
            }
            response.cookies.delete("jwt");
            return NextResponse.json(
                { error: "Unauthorized: JWT token has expired" },
                { status: 401 }
            );
        }

        // 4) If near expiry, refresh
        if (timeToExpire < REFRESH_THRESHOLD) {
            if (isDev()) {
                console.log(
                    "[SessionMiddleware] JWT is nearing expiration. Refreshing token..."
                );
            }
            const refreshedToken = jwt.sign(
                {
                    sub: decoded.sub || "anonymous",
                    roles: decoded.roles || ["user"],
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );
            response.cookies.set({
                name: "jwt",
                value: refreshedToken,
                httpOnly: true,
                secure, // depends on environment
                sameSite: "strict",
                path: "/",
                maxAge: JWT_EXPIRES_IN,
            });
        }

        // 5) All good → allow request to continue
        return response;
    } catch (error) {
        // 6) More detailed error handling
        if (isDev()) {
            console.error("[SessionMiddleware] JWT verification error:", error);
        }
        response.cookies.delete("jwt");

        if (error instanceof TokenExpiredError) {
            return NextResponse.json(
                { error: "Unauthorized: JWT token has expired" },
                { status: 401 }
            );
        } else if (error instanceof NotBeforeError) {
            return NextResponse.json(
                { error: "Unauthorized: JWT not active yet" },
                { status: 401 }
            );
        } else if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid JWT token" },
                { status: 401 }
            );
        } else {
            // Some unknown error
            if (isDev()) {
                console.error("[SessionMiddleware] Unexpected error:", error);
            }
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    }
}

process.env.JWT_SECRET = TEST_SECRET;
Object.defineProperty(process.env, "NODE_ENV", {
    value: "production",
    configurable: true,
}); // "production" or "development"でもOK
process.env.USE_HTTP_DEV = "true";

// --- sample code for Node.js env ---
// import { NextResponse, NextRequest } from "next/server";
// import crypto from "crypto";
// import jwt from "jsonwebtoken";

// // Default maximum age for session cookies in seconds (1 hour)
// const DEFAULT_MAX_AGE = 3600;

// // Secret key for signing JWTs. Always use environment variables for sensitive data.
// const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

// // JWT expiration time in seconds (converted from "1h" to number for mathematical operations)
// const JWT_EXPIRES_IN = 3600;

// /**
//  * Middleware: handles session management using JWT and session ID.
//  *
//  * Combines traditional session ID management with JWT-based token authentication.
//  * Ensures session IDs are unique and manages JWT refresh when nearing expiration.
//  *
//  * @param {NextRequest} req - The incoming request object from Next.js.
//  * @returns {NextResponse} - The modified response object with cookies or an error.
//  */
// export function sessionMiddleware(req: NextRequest): NextResponse {
//     const secure = process.env.NODE_ENV !== "development"; // Secure cookies in production environments
//     const response = NextResponse.next();

//     // Retrieve existing cookies for session ID and JWT token
//     const sessionId = req.cookies.get("sessionId")?.value;
//     const jwtToken = req.cookies.get("jwt")?.value;

//     // JWT-based session management
//     if (jwtToken) {
//         try {
//             // Verify the JWT token
//             const decoded = jwt.verify(jwtToken, JWT_SECRET) as jwt.JwtPayload;

//             // Calculate time until the token expires
//             const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
//             const timeToExpire = decoded.exp ? decoded.exp - currentTime : 0;

//             // Refresh the token if it's nearing expiration (less than 50% of total time remaining)
//             if (timeToExpire < JWT_EXPIRES_IN / 2) {
//                 console.log("JWT is nearing expiration. Refreshing token...");

//                 // Sign a new JWT with the same payload
//                 const refreshedToken = jwt.sign(
//                     { sub: decoded.sub, roles: decoded.roles },
//                     JWT_SECRET,
//                     { expiresIn: JWT_EXPIRES_IN }
//                 );

//                 // Set the refreshed JWT token as a cookie
//                 response.cookies.set({
//                     name: "jwt",
//                     value: refreshedToken,
//                     httpOnly: true, // Prevent access to the cookie via JavaScript
//                     secure, // Only send the cookie over HTTPS in production
//                     sameSite: "strict", // Prevent the cookie from being sent on cross-site requests
//                     path: "/", // Cookie is valid for the entire domain
//                 });
//             }
//         } catch (error) {
//             console.error("Invalid or expired JWT token:", error);

//             // Delete the invalid JWT token from cookies
//             response.cookies.delete("jwt");

//             // Return a 401 Unauthorized response for invalid tokens
//             return NextResponse.json(
//                 { error: "Unauthorized" },
//                 { status: 401 }
//             );
//         }
//     } else {
//         // If no JWT is present, remove any existing JWT cookie for cleanup
//         response.cookies.delete("jwt");
//     }

//     // Traditional session ID management
//     if (!sessionId) {
//         // Generate a new session ID if it doesn't exist
//         const newSessionId = generateSessionId();

//         response.cookies.set({
//             name: "sessionId",
//             value: newSessionId,
//             httpOnly: true, // Secure the cookie from JavaScript access
//             secure, // Secure the cookie in production
//             sameSite: "strict", // Prevent cross-site request leakage
//             path: "/", // Cookie is valid for the entire site
//             maxAge: DEFAULT_MAX_AGE, // Expiration time for the session cookie
//         });
//     }

//     // Issue a new JWT if none exists
//     if (!jwtToken) {
//         const newJwtToken = jwt.sign({ sub: "defaultUser" }, JWT_SECRET, {
//             expiresIn: JWT_EXPIRES_IN, // Expire in 1 hour
//         });

//         response.cookies.set({
//             name: "jwt",
//             value: newJwtToken,
//             httpOnly: true, // Prevent access to the cookie via JavaScript
//             secure, // Only send the cookie over HTTPS in production
//             sameSite: "strict", // Prevent the cookie from being sent on cross-site requests
//             path: "/", // Cookie is valid for the entire domain
//         });
//     }

//     return response;
// }

// /**
//  * Utility function to generate unique session IDs.
//  *
//  * Generates a secure, random session ID by converting 16 random bytes into a hexadecimal string.
//  *
//  * @returns {string} - The generated session ID.
//  */
// function generateSessionId(): string {
//     return crypto.randomBytes(16).toString("hex");
// }
