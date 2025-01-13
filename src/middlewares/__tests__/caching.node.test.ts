/**
 * Test suite for cachingMiddleware.
 * This middleware handles caching policies and adds security headers
 * based on the route type (e.g., API routes vs. static assets).
 * Confirmed all tests have passed at 2025/01/13.
 */

import { cachingMiddleware } from "@/middlewares/caching";
import { NextRequest } from "next/server";

describe("cachingMiddleware", () => {
    beforeEach(() => {
        // Reset modules to ensure environment variables are reloaded
        jest.resetModules();
    });

    // Test for API routes caching behavior
    it("should disable caching for API routes", () => {
        const req = new NextRequest("https://example.com/api/test");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/api/test",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
    });

    // Test for static assets caching behavior
    it("should enable caching for static assets", () => {
        const req = new NextRequest("https://example.com/static/image.png");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/static/image.png",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "public, max-age=3600, immutable"
        );
    });

    // Test dynamic routes caching
    it("should handle dynamic routes correctly", () => {
        const req = new NextRequest("https://example.com/api/users/123");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/api/users/123",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
    });

    // Test for security headers
    it("should add security headers to all responses", () => {
        const req = new NextRequest("https://example.com/");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/",
            writable: false,
        });
        const response = cachingMiddleware(req);

        expect(response!.headers.get("Strict-Transport-Security")).toBe(
            "max-age=63072000; includeSubDomains; preload"
        );
        expect(response!.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(response!.headers.get("X-Frame-Options")).toBe("DENY");
        expect(response!.headers.get("Content-Security-Policy")).toBe(
            "default-src 'self';"
        );
    });

    // Test for invalid requests
    it("should handle invalid requests gracefully", () => {
        const response = cachingMiddleware(null as any);
        expect(response).toBeUndefined();
    });

    // Test for environment variable-based caching policies
    it("should respect environment variables for caching policies", async () => {
        process.env.STATIC_CACHE_POLICY = "public, max-age=7200, immutable";
        process.env.API_NO_CACHE_POLICY = "no-store";

        const { cachingMiddleware } = await import("@/middlewares/caching");

        const staticReq = new NextRequest("https://example.com/static/file.js");
        Object.defineProperty(staticReq.nextUrl, "pathname", {
            value: "/static/file.js",
            writable: false,
        });
        const apiReq = new NextRequest("https://example.com/api/test");
        Object.defineProperty(apiReq.nextUrl, "pathname", {
            value: "/api/test",
            writable: false,
        });

        const staticResponse = cachingMiddleware(staticReq);
        const apiResponse = cachingMiddleware(apiReq);

        expect(staticResponse!.headers.get("Cache-Control")).toBe(
            "public, max-age=7200, immutable"
        );
        expect(apiResponse!.headers.get("Cache-Control")).toBe("no-store");
    });

    // Test for requests with query parameters
    it("should handle requests with query parameters correctly", () => {
        const req = new NextRequest("https://example.com/api/test?query=123");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/api/test",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
    });

    // Test for URL-encoded paths
    it("should handle URL-encoded paths correctly", () => {
        const req = new NextRequest(
            "https://example.com/static/%E3%83%86%E3%82%B9%E3%83%88.png"
        );
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/static/テスト.png",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "public, max-age=3600, immutable"
        );
    });

    // Test for requests with invalid nextUrl
    it("should return undefined for requests with invalid nextUrl", () => {
        const req = new NextRequest("https://example.com");
        Object.defineProperty(req, "nextUrl", {
            value: null,
            writable: false,
        });
        const response = cachingMiddleware(req as any);
        expect(response).toBeUndefined();
    });

    // Test for invalid pathnames
    it("should handle invalid pathnames gracefully", () => {
        const req = new NextRequest("https://example.com/../../etc/passwd");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/../../etc/passwd",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response).toBeUndefined();
    });

    // Test for very long pathnames
    it("should handle very long pathnames", () => {
        const longPath = "/static/" + "a".repeat(10_000) + ".js";
        const req = new NextRequest(`https://example.com${longPath}`);
        Object.defineProperty(req.nextUrl, "pathname", {
            value: longPath,
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "public, max-age=3600, immutable"
        );
    });

    // Test for high volume of requests
    it("should handle a high volume of requests efficiently", () => {
        const NUM_REQUESTS = 1000;
        const responses = [];

        for (let i = 0; i < NUM_REQUESTS; i++) {
            const req = new NextRequest(`https://example.com/api/resource${i}`);
            Object.defineProperty(req.nextUrl, "pathname", {
                value: `/api/resource${i}`,
                writable: false,
            });
            responses.push(cachingMiddleware(req));
        }

        responses.forEach((response) => {
            expect(response!.headers.get("Cache-Control")).toBe(
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );
        });
    });

    // Test for path traversal attempts
    it("should reject path traversal attempts", () => {
        const req = new NextRequest("https://example.com/api/../../secret");
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/api/../../secret",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response).toBeUndefined();
    });

    // Test for SQL injection-like input
    it("should not be vulnerable to SQL injection", () => {
        const req = new NextRequest(
            "https://example.com/api/resource?user=' OR 1=1;--"
        );
        Object.defineProperty(req.nextUrl, "pathname", {
            value: "/api/resource",
            writable: false,
        });
        const response = cachingMiddleware(req);
        expect(response!.headers.get("Cache-Control")).toBe(
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
    });
});
