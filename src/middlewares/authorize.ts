import { NextRequest, NextResponse } from "next/server";

/**
 * Authorize middleware to ensure users have the necessary roles to access certain paths.
 *
 * This middleware checks the user's role against a list of required roles and
 * denies access if the user lacks the necessary permissions.
 *
 * @param {NextRequest} req - The incoming request object.
 * @param {string[]} requiredRoles - An array of roles required to access the path.
 * @returns {NextResponse | undefined} - Returns a 403 response if authorization fails, otherwise undefined.
 */
export const authorizeMiddleware = (
    req: NextRequest,
    requiredRoles: string[]
): NextResponse | undefined => {
    // Retrieve user ID and role from request headers
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    // Redirect to sign-in if user is not authenticated
    if (!userId || !userRole) {
        const signInUrl = new URL("/signIn", req.url);
        return NextResponse.redirect(signInUrl);
    }

    // Deny access if user role is not among the required roles
    if (!requiredRoles.includes(userRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return undefined; // Continue to the next middleware
};
