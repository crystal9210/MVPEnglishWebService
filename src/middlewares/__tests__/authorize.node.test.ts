/**
 * Confirmed all tests have passed at 2025/01/12.
 */

import { NextRequest, NextResponse } from "next/server";
import { authorizeMiddleware } from "../authorize";

describe("authorizeMiddleware", () => {
    /**
     * Helper function to create a mock NextRequest.
     */
    const createMockRequest = (
        url: string,
        headers: Record<string, string> = {}
    ): NextRequest => {
        const req = new NextRequest(url, { headers });
        // nextUrl は読み取り専用なので、definePropertyを使用して設定
        Object.defineProperty(req, "nextUrl", {
            writable: true,
            value: new URL(url),
        });
        return req;
    };

    test("should allow access if user has required role", () => {
        const req = createMockRequest("https://example.com/admin/dashboard", {
            "x-user-id": "user123",
            "x-user-role": "admin",
        });

        const res = authorizeMiddleware(req, ["admin", "superadmin"]);
        expect(res).toBeUndefined(); // Continue processing
    });

    test("should deny access with 403 if user does not have required role", async () => {
        const req = createMockRequest("https://example.com/admin/dashboard", {
            "x-user-id": "user123",
            "x-user-role": "user",
        });

        const res = authorizeMiddleware(req, ["admin", "superadmin"]);
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(403);
            // JSON レスポンスの内容を確認
            const json = await res.json();
            expect(json).toEqual({ error: "Forbidden" });
        }
    });

    test("should redirect to sign-in if user is not authenticated", () => {
        const req = createMockRequest("https://example.com/admin/dashboard", {
            // "x-user-id" と "x-user-role" がない
        });

        const res = authorizeMiddleware(req, ["admin"]);
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(307); // Redirect
            expect(res.headers.get("location")).toBe(
                "https://example.com/signIn"
            );
        }
    });

    test("should handle multiple required roles correctly", () => {
        const req = createMockRequest("https://example.com/admin/settings", {
            "x-user-id": "user456",
            "x-user-role": "superadmin",
        });

        const res = authorizeMiddleware(req, ["admin", "superadmin"]);
        expect(res).toBeUndefined(); // Continue processing
    });

    test("should deny access if user role is undefined", async () => {
        const req = createMockRequest("https://example.com/admin/settings", {
            "x-user-id": "user789",
            // "x-user-role" がない
        });

        const res = authorizeMiddleware(req, ["admin"]);
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(307); // Redirect to sign-in
            expect(res.headers.get("location")).toBe(
                "https://example.com/signIn"
            );
        }
    });
});
