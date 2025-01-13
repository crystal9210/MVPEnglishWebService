/**
 * Confirmed all tests have passed at 2025/01/13.
 */

/**
 * Test suite for corsMiddleware.
 *
 * This test suite validates the functionality of the corsMiddleware module,
 * ensuring it:
 *
 * 1. Correctly enforces HTTPS for secure communication when required.
 * 2. Allows requests from explicitly permitted origins.
 * 3. Handles CORS preflight (OPTIONS) requests appropriately.
 * 4. Dynamically adapts to development and production environments.
 * 5. Properly rejects requests from disallowed or malformed origins.
 * 6. Handles edge cases such as missing Origin headers and very long Origin values.
 * 7. Efficiently processes a high volume of preflight requests.
 * 8. Maintains the integrity of the Origin header from the original request.
 *
 * Each test case checks the middleware’s response headers, HTTP status codes,
 * and logs to verify expected behavior.
 *
 * Dependencies such as isDev, isHttpForDev, and shouldEnforceHttps are mocked
 * to simulate different environments and scenarios.
 */

import { corsMiddleware } from "@/middlewares/cors";
import { NextRequest, NextResponse } from "next/server";
import { isDev, isHttpForDev, shouldEnforceHttps } from "@/config/envConfig";
import { logger } from "@/config/logger";

jest.mock("@/config/envConfig", () => ({
    isDev: jest.fn(),
    isHttpForDev: jest.fn(),
    shouldEnforceHttps: jest.fn(),
}));

jest.mock("@/config/logger", () => ({
    logger: {
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    },
}));

describe("corsMiddleware", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        (isDev as jest.Mock).mockReturnValue(false);
        (isHttpForDev as jest.Mock).mockReturnValue(false);
        (shouldEnforceHttps as jest.Mock).mockReturnValue(false);
    });

    const createMockRequest = (
        url: string,
        method: string,
        origin: string | null = null
    ) => {
        const req = new NextRequest(url, { method });
        req.headers.get = jest.fn((headerName) => {
            if (headerName === "origin") {
                return origin;
            }
            return null;
        });

        return req;
    };

    it("should allow requests from allowed origins", () => {
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            "https://yourdomain.com"
        );

        const response = corsMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for origin: https://yourdomain.com"
        );
        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://yourdomain.com"
        );
        expect(response!.headers.get("Access-Control-Allow-Methods")).toBe(
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        expect(response!.headers.get("Access-Control-Allow-Headers")).toBe(
            "Content-Type, Authorization"
        );
        expect(response!.headers.get("Access-Control-Allow-Credentials")).toBe(
            "true"
        );
    });

    it("should reject insecure HTTP requests if HTTPS is enforced", () => {
        (shouldEnforceHttps as jest.Mock).mockReturnValue(true);
        const req = createMockRequest(
            "http://yourdomain.com/api/test",
            "GET",
            "http://yourdomain.com"
        );

        const response = corsMiddleware(req);

        expect(logger.warn).toHaveBeenCalledWith(
            "Rejected insecure request: GET http://yourdomain.com/api/test Origin: http://yourdomain.com"
        );

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
        expect(response?.json()).resolves.toEqual({
            error: "HTTPS is required.",
        });
    });

    it("should handle preflight OPTIONS requests correctly", () => {
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "OPTIONS",
            "https://yourdomain.com"
        );

        const response = corsMiddleware(req);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(204);
        expect(response?.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://yourdomain.com"
        );
        expect(response?.headers.get("Access-Control-Allow-Methods")).toBe(
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        expect(response?.headers.get("Access-Control-Allow-Headers")).toBe(
            "Content-Type, Authorization"
        );
        expect(response?.headers.get("Access-Control-Allow-Credentials")).toBe(
            "true"
        );
    });

    it("should allow all origins in development with HTTP", () => {
        (isDev as jest.Mock).mockReturnValue(true);
        (isHttpForDev as jest.Mock).mockReturnValue(true);
        const req = createMockRequest(
            "http://localhost:3000/api/test",
            "GET",
            "http://localhost:3000"
        );

        const response = corsMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for all origins in development: GET http://localhost:3000/api/test"
        );

        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.get("Access-Control-Allow-Origin")).toBe("*");
        expect(response!.headers.get("Access-Control-Allow-Methods")).toBe(
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        expect(response!.headers.get("Access-Control-Allow-Headers")).toBe(
            "Content-Type, Authorization"
        );
        expect(response!.headers.get("Access-Control-Allow-Credentials")).toBe(
            "true"
        );
    });

    it("should not set CORS headers for disallowed origins", () => {
        const req = createMockRequest(
            "https://disallowed.com/api/test",
            "GET",
            "https://disallowed.com"
        );

        const response = corsMiddleware(req);

        expect(logger.debug).toHaveBeenCalledWith(
            "CORS headers not set for origin: https://disallowed.com"
        );
        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.has("Access-Control-Allow-Origin")).toBe(
            false
        );
        expect(response!.headers.has("Access-Control-Allow-Methods")).toBe(
            false
        );
        expect(response!.headers.has("Access-Control-Allow-Headers")).toBe(
            false
        );
        expect(response!.headers.has("Access-Control-Allow-Credentials")).toBe(
            false
        );
    });

    it("should handle requests without Origin header gracefully", () => {
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            null
        );

        const response = corsMiddleware(req);

        expect(logger.debug).toHaveBeenCalledWith(
            "CORS headers not set for origin: null"
        );
        expect(response).toBeInstanceOf(NextResponse);

        expect(response!.headers.has("Access-Control-Allow-Origin")).toBe(
            false
        );
    });

    it("should allow CORS for allowed origins and handle non-OPTIONS methods", () => {
        const req = createMockRequest(
            "https://www.yourdomain.com/api/test",
            "POST",
            "https://www.yourdomain.com"
        );

        const response = corsMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for origin: https://www.yourdomain.com"
        );
        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://www.yourdomain.com"
        );
        expect(response!.headers.get("Access-Control-Allow-Methods")).toBe(
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        expect(response!.headers.get("Access-Control-Allow-Headers")).toBe(
            "Content-Type, Authorization"
        );
        expect(response!.headers.get("Access-Control-Allow-Credentials")).toBe(
            "true"
        );
    });

    it("should allow CORS for allowed origins and handle secure HTTPS enforcement correctly", () => {
        (shouldEnforceHttps as jest.Mock).mockReturnValue(true);
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            "https://yourdomain.com"
        );

        const response = corsMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for origin: https://yourdomain.com"
        );

        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://yourdomain.com"
        );
        expect(response!.headers.get("Access-Control-Allow-Methods")).toBe(
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        expect(response!.headers.get("Access-Control-Allow-Headers")).toBe(
            "Content-Type, Authorization"
        );
        expect(response!.headers.get("Access-Control-Allow-Credentials")).toBe(
            "true"
        );
    });

    it("should allow CORS for multiple allowed origins", () => {
        const req1 = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            "https://yourdomain.com"
        );
        const req2 = createMockRequest(
            "https://www.yourdomain.com/api/test",
            "GET",
            "https://www.yourdomain.com"
        );

        const response1 = corsMiddleware(req1);
        const response2 = corsMiddleware(req2);

        expect(response1!.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://yourdomain.com"
        );
        expect(response2!.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://www.yourdomain.com"
        );
    });

    it("should handle requests with invalid Origin header format", () => {
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            "invalid_origin_format"
        );

        const response = corsMiddleware(req);

        expect(logger.debug).toHaveBeenCalledWith(
            "CORS headers not set for origin: invalid_origin_format"
        );
        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.has("Access-Control-Allow-Origin")).toBe(
            false
        );
    });

    it("should reject requests without Origin header when HTTPS is enforced", () => {
        (shouldEnforceHttps as jest.Mock).mockReturnValue(true);

        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            null
        );

        const response = corsMiddleware(req);

        expect(logger.warn).toHaveBeenCalledWith(
            "Rejected insecure request: GET https://yourdomain.com/api/test Origin: null"
        );

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
        expect(response?.json()).resolves.toEqual({
            error: "HTTPS is required.",
        });
    });

    it("should handle requests with very long Origin headers", () => {
        const longOrigin = "https://" + "a".repeat(10_000) + ".com";
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            longOrigin
        );

        const response = corsMiddleware(req);

        expect(logger.debug).toHaveBeenCalledWith(
            `CORS headers not set for origin: ${longOrigin}`
        );
        expect(response).toBeInstanceOf(NextResponse);
        expect(response!.headers.has("Access-Control-Allow-Origin")).toBe(
            false
        );
    });

    it("should handle preflight requests from disallowed origins", () => {
        const req = createMockRequest(
            "https://disallowed.com/api/test",
            "OPTIONS",
            "https://disallowed.com"
        );

        const response = corsMiddleware(req);

        expect(logger.debug).toHaveBeenCalledWith(
            "CORS headers not set for origin (preflight): https://disallowed.com"
        );
        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(204); // Returns 204 without CORS headers
        expect(response!.headers.has("Access-Control-Allow-Origin")).toBe(
            false
        );
    });

    it("should handle a high volume of preflight requests efficiently", () => {
        const NUM_REQUESTS = 1000;
        const responses = [];

        for (let i = 0; i < NUM_REQUESTS; i++) {
            const req = createMockRequest(
                "https://yourdomain.com/api/resource",
                "OPTIONS",
                "https://yourdomain.com"
            );
            responses.push(corsMiddleware(req));
        }

        responses.forEach((response) => {
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(204);
            expect(response!.headers.get("Access-Control-Allow-Origin")).toBe(
                "https://yourdomain.com"
            );
            expect(response!.headers.get("Access-Control-Allow-Methods")).toBe(
                "GET, POST, PUT, DELETE, OPTIONS"
            );
        });
    });

    it("should not modify the Origin header from the request", () => {
        const req = createMockRequest(
            "https://yourdomain.com/api/test",
            "GET",
            "https://yourdomain.com"
        );

        const response = corsMiddleware(req);

        // Ensure the original request headers are untouched
        expect(req.headers.get("origin")).toBe("https://yourdomain.com");
        expect(response!.headers.get("Access-Control-Allow-Origin")).toBe(
            "https://yourdomain.com"
        );
    });
});
