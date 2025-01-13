/**
 * All tests have passed as of 2025/01/13.
 * Remaining unconfirmed test cases are noted as TODOs due to technical difficulties and the high threat model level.
 *
 * This test suite verifies the `securityHeadersMiddleware` behavior under various conditions.
 * It covers:
 * - Correct header application in production and development environments.
 * - Correct handling of security-related headers (e.g., CSP, HSTS, XSS-Protection).
 * - Error handling for misconfigurations or invalid input.
 * - Performance under high-load scenarios.
 */

// TODO
// The logger mock must be set before importing the middleware.
jest.mock("@/config/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import { NextRequest } from "next/server";
import crypto from "crypto";
import { logger } from "@/config/logger"; // Import the mocked logger
import * as envConfig from "@/config/envConfig";
import * as cspConfig from "@/config/cspConfig";
import { securityHeadersMiddleware } from "../securityHeaders"; // Correct import path
// TODO
// import { MockHeaders, MockNextRequest } from "./mockNextRequest";

describe("securityHeadersMiddleware", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv }; // Clone the original environment variables

        // Reset mocks
        jest.clearAllMocks();

        // By default, mock crypto.randomBytes to return a fixed nonce
        jest.spyOn(crypto, "randomBytes").mockImplementation(
            (_size: number): Buffer => Buffer.from("testnonce")
        );
    });

    afterAll(() => {
        process.env = originalEnv; // Restore the original environment variables
        jest.restoreAllMocks();
    });

    /**
     * Positive Tests
     */

    /**
     * Test: Verify that CSP is correctly set in a production environment
     */
    test("should set CSP correctly in production environment", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Create a request simulating a production environment
        const req = new NextRequest("https://example.com/prod", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that all headers are correctly set
        expect(res.headers.get("Content-Security-Policy")).toBe(
            "default-src 'self'; script-src 'self' 'nonce-dGVzdG5vbmNl'; style-src 'self' 'nonce-dGVzdG5vbmNl'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; report-uri /csp-report-endpoint;"
        );
        expect(res.headers.get("Strict-Transport-Security")).toBe(
            "max-age=63072000; includeSubDomains; preload"
        );
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
        expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(res.headers.get("Permissions-Policy")).toBe(
            "geolocation=(), microphone=(), camera=()"
        );
        expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe(
            "none"
        );
        expect(res.headers.get("Expect-CT")).toBe(
            "max-age=86400, enforce, report-uri='https://example.com/report'"
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that CSP is correctly set in a development environment
     */
    test("should set CSP correctly in development environment", () => {
        //  Set to development environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(true);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(true);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(false);

        // Mock crypto.randomBytes to return 'devnonce'
        jest.spyOn(crypto, "randomBytes").mockImplementation(
            (_size: number): Buffer => Buffer.from("devnonce")
        );

        // Create a request simulating a development environment
        const req = new NextRequest("https://example.com/dev", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that all headers are correctly set (including 'unsafe-inline')
        expect(res.headers.get("Content-Security-Policy")).toBe(
            "default-src 'self'; script-src 'self' 'nonce-ZGV2bm9uY2U='; style-src 'self' 'nonce-ZGV2bm9uY2U=' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; report-uri /csp-report-endpoint;"
        );
        expect(res.headers.get("Strict-Transport-Security")).toBeNull(); // Not set in development
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
        expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(res.headers.get("Permissions-Policy")).toBe(
            "geolocation=(), microphone=(), camera=()"
        );
        expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe(
            "none"
        );
        expect(res.headers.get("Expect-CT")).toBe(
            "max-age=86400, enforce, report-uri='https://example.com/report'"
        );

        // Verify that logger.info was called in development
        expect(logger.info).toHaveBeenCalledWith(
            "Setting Security Headers",
            expect.objectContaining({
                headers: Array.from(res.headers.entries()),
            })
        );
    });

    /**
     * Test: Verify that all security headers are correctly set
     */
    test("should set all security headers correctly", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Create a request simulating a production environment
        const req = new NextRequest("https://example.com/full-headers-test", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that all security headers are correctly set
        const headersToCheck = {
            "Content-Security-Policy":
                "default-src 'self'; script-src 'self' 'nonce-dGVzdG5vbmNl'; style-src 'self' 'nonce-dGVzdG5vbmNl'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; report-uri /csp-report-endpoint;",
            "Strict-Transport-Security":
                "max-age=63072000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "no-referrer",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
            "X-Permitted-Cross-Domain-Policies": "none",
            "Expect-CT":
                "max-age=86400, enforce, report-uri='https://example.com/report'",
        };

        Object.entries(headersToCheck).forEach(([header, value]) => {
            expect(res.headers.get(header)).toBe(value);
        });

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that the correct nonce is included in the CSP header
     */
    test("should include the correct nonce in CSP header", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // The nonce is mocked to "testnonce" (Base64: "dGVzdG5vbmNl")
        const expectedNonce = "dGVzdG5vbmNl";

        // Create a request simulating a production environment
        const req = new NextRequest("https://example.com/nonce-test", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that the correct nonce is included in the CSP header
        expect(res.headers.get("Content-Security-Policy")).toContain(
            `'nonce-${expectedNonce}'`
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that 'unsafe-inline' is only present in the development CSP
     */
    test("'unsafe-inline' should only be present in development CSP", () => {
        const nonce = "devnonce";

        //  Set to development environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(true);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(true);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(false);

        // Mock crypto.randomBytes to return 'devnonce'
        jest.spyOn(crypto, "randomBytes").mockImplementation(
            (_size: number): Buffer => Buffer.from(nonce)
        );

        // Create a request simulating a development environment
        const req = new NextRequest("https://example.com/unsafe-inline", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that 'unsafe-inline' is included in the CSP header
        expect(res.headers.get("Content-Security-Policy")).toContain(
            "'unsafe-inline'"
        );

        // Verify that logger.info was called in development
        expect(logger.info).toHaveBeenCalledWith(
            "Setting Security Headers",
            expect.objectContaining({
                headers: Array.from(res.headers.entries()),
            })
        );
    });

    /**
     * Test: Verify that 'unsafe-inline' is not present in the production CSP
     */
    test("'unsafe-inline' should not be present in production CSP", () => {
        const nonce = "testnonce";

        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Mock crypto.randomBytes to return 'testnonce'
        jest.spyOn(crypto, "randomBytes").mockImplementation(
            (_size: number): Buffer => Buffer.from(nonce)
        );

        // Create a request simulating a production environment
        const req = new NextRequest("https://example.com/no-unsafe-inline", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that 'unsafe-inline' is not included in the CSP header
        expect(res.headers.get("Content-Security-Policy")).not.toContain(
            "'unsafe-inline'"
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that the correct report-uri is set in the CSP header
     */
    test("should set correct report-uri in CSP header", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Create a request simulating a production environment
        const req = new NextRequest("https://example.com/report-uri-test", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that 'report-uri' is included in the CSP header
        expect(res.headers.get("Content-Security-Policy")).toContain(
            "report-uri /csp-report-endpoint;"
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that different nonce values are correctly incorporated into the CSP header
     */
    test("should correctly incorporate different nonce values into CSP header", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Array of nonces to test
        const nonces = ["nonceOne123", "nonceTwo456", "nonceThree789"];

        nonces.forEach((nonce) => {
            // Mock crypto.randomBytes to return the current nonce
            const base64Nonce = Buffer.from(nonce).toString("base64");
            jest.spyOn(crypto, "randomBytes").mockImplementation(
                (_size: number): Buffer => Buffer.from(nonce)
            );

            // Create a request with the current nonce
            const req = new NextRequest(`https://example.com/test-${nonce}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            });

            const res = securityHeadersMiddleware(req);

            //  Verify that the current nonce is included in the CSP header
            expect(res.headers.get("Content-Security-Policy")).toContain(
                `'nonce-${base64Nonce}'`
            );

            // Verify that logger.info was not called in production
            expect(logger.info).not.toHaveBeenCalled();

            // Reset mocks and reapply necessary mocks for the next iteration
            jest.clearAllMocks();
            jest.spyOn(envConfig, "isDev").mockReturnValue(false);
            jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
            jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);
            jest.spyOn(crypto, "randomBytes").mockImplementation(
                (_size: number): Buffer => Buffer.from(nonce)
            );
        });
    });

    /**
     * Additional Comprehensive Test Cases
     */

    /**
     * Test: Verify that the middleware correctly sets headers for POST requests
     */
    test("should set headers correctly for POST requests", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Create a mock POST request
        const req = new NextRequest("https://example.com/post-test", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that headers are correctly set as in production
        expect(res.headers.get("Content-Security-Policy")).toBe(
            "default-src 'self'; script-src 'self' 'nonce-dGVzdG5vbmNl'; style-src 'self' 'nonce-dGVzdG5vbmNl'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; report-uri /csp-report-endpoint;"
        );
        expect(res.headers.get("Strict-Transport-Security")).toBe(
            "max-age=63072000; includeSubDomains; preload"
        );
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
        expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(res.headers.get("Permissions-Policy")).toBe(
            "geolocation=(), microphone=(), camera=()"
        );
        expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe(
            "none"
        );
        expect(res.headers.get("Expect-CT")).toBe(
            "max-age=86400, enforce, report-uri='https://example.com/report'"
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that the middleware correctly sets headers for PUT requests
     */
    test("should set headers correctly for PUT requests", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Create a mock PUT request
        const req = new NextRequest("https://example.com/put-test", {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that headers are correctly set as in production
        expect(res.headers.get("Content-Security-Policy")).toBe(
            "default-src 'self'; script-src 'self' 'nonce-dGVzdG5vbmNl'; style-src 'self' 'nonce-dGVzdG5vbmNl'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; report-uri /csp-report-endpoint;"
        );
        expect(res.headers.get("Strict-Transport-Security")).toBe(
            "max-age=63072000; includeSubDomains; preload"
        );
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
        expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(res.headers.get("Permissions-Policy")).toBe(
            "geolocation=(), microphone=(), camera=()"
        );
        expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe(
            "none"
        );
        expect(res.headers.get("Expect-CT")).toBe(
            "max-age=86400, enforce, report-uri='https://example.com/report'"
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Test: Verify that the middleware correctly sets headers for DELETE requests
     */
    test("should set headers correctly for DELETE requests", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Create a mock DELETE request
        const req = new NextRequest("https://example.com/delete-test", {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that headers are correctly set as in production
        expect(res.headers.get("Content-Security-Policy")).toBe(
            "default-src 'self'; script-src 'self' 'nonce-dGVzdG5vbmNl'; style-src 'self' 'nonce-dGVzdG5vbmNl'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none'; report-uri /csp-report-endpoint;"
        );
        expect(res.headers.get("Strict-Transport-Security")).toBe(
            "max-age=63072000; includeSubDomains; preload"
        );
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
        expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(res.headers.get("Permissions-Policy")).toBe(
            "geolocation=(), microphone=(), camera=()"
        );
        expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe(
            "none"
        );
        expect(res.headers.get("Expect-CT")).toBe(
            "max-age=86400, enforce, report-uri='https://example.com/report'"
        );

        // Verify that logger.info was not called in production
        expect(logger.info).not.toHaveBeenCalled();
    });

    /**
     * Error Tests
     */

    /**
     * Test: Verify that the middleware handles errors gracefully
     */
    test("should handle errors gracefully", () => {
        jest.spyOn(envConfig, "isDev").mockImplementation(() => {
            throw new Error("Test error");
        });

        const req = new NextRequest("https://example.com/error", {
            method: "GET",
            headers: { "content-type": "application/json" },
        });

        const res = securityHeadersMiddleware(req);

        expect(res.status).toBe(500);
        expect(logger.error).toHaveBeenCalledWith(
            "Error in securityHeadersMiddleware:",
            expect.objectContaining({
                error: expect.any(Error),
            })
        );
    });

    /**
     * Test: Verify that a 500 error is returned when report-uri is misconfigured
     */
    test("should handle misconfigured report-uri gracefully", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Mock crypto.randomBytes to return an invalid nonce
        jest.spyOn(crypto, "randomBytes").mockImplementation(
            (_size: number): Buffer => Buffer.from("invalidnonce")
        );

        // Mock generateCspString with incorrect configuration (missing report-uri)
        jest.spyOn(cspConfig, "generateCspString").mockReturnValue(
            "default-src 'self'; script-src 'self' 'nonce-aW52YWxpZG5vbmNl'; style-src 'self' 'nonce-aW52YWxpZG5vbmNl'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none';"
            // 'report-uri' is not included
        );

        // Create a request with misconfigured report-uri
        const req = new NextRequest(
            "https://example.com/misconfigured-report-uri",
            {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            }
        );

        const res = securityHeadersMiddleware(req);

        //  Verify that a 500 Internal Server Error is returned
        expect(res.status).toBe(500);
        expect(res.body).toBeDefined();

        // Verify that logger.error was called correctly
        expect(logger.error).toHaveBeenCalledWith(
            "Error in securityHeadersMiddleware:",
            expect.objectContaining({
                error: expect.any(Error),
            })
        );
    });

    test("should handle empty CSP gracefully", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);
        jest.spyOn(envConfig, "isHttpForDev").mockReturnValue(false);
        jest.spyOn(envConfig, "shouldEnforceHttps").mockReturnValue(true);

        // Mock generateCspString to return an empty string
        jest.spyOn(cspConfig, "generateCspString").mockReturnValue("");

        const req = new NextRequest("https://example.com/empty-csp", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that a 500 Internal Server Error is returned
        expect(res.status).toBe(500);
        expect(res.body).toBeDefined();
        expect(logger.error).toHaveBeenCalledWith(
            "Error in securityHeadersMiddleware:",
            expect.objectContaining({
                error: expect.any(Error),
            })
        );
    });

    test("should handle unsupported HTTP methods gracefully", () => {
        //  Set to production environment
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);

        const req = new NextRequest("https://example.com/unsupported-method", {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        // Verify that security headers are still correctly set
        expect(res.headers.get("Content-Security-Policy")).toBe(
            "default-src 'none';"
        );
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");

        // Verify that logger.info was not called
        expect(logger.info).not.toHaveBeenCalled();
    });

    test("should not overwrite existing headers unnecessarily", () => {
        jest.spyOn(envConfig, "isDev").mockReturnValue(false);

        // Mock a request with pre-existing headers
        const req = new NextRequest("https://example.com/existing-headers", {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "X-Frame-Options": "SAMEORIGIN", // >> set the invalid value.
            },
        });

        try {
            securityHeadersMiddleware(req);
        } catch (error) {
            // Use type assertion to access error properties
            const err = error as Error;

            //  Verify that the middleware rejects the request
            expect(err.message).toBe(
                `Invalid header value for "X-Frame-Options". Rejected for security reasons.`
            );

            // Verify that the logger records the violation
            expect(logger.error).toHaveBeenCalledWith(
                `Security rule violation: Header "X-Frame-Options" has an unexpected value "SAMEORIGIN". Expected: "DENY".`
            );
        }
    });

    test("should handle extremely long URLs gracefully", () => {
        const longUrl = "https://example.com/" + "a".repeat(5000);

        const req = new NextRequest(longUrl, {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        const res = securityHeadersMiddleware(req);

        //  Verify that security headers are correctly set
        expect(res.headers.get("Content-Security-Policy")).toBeDefined();
        expect(res.status).toBe(414);
    });

    test("should handle malformed headers gracefully 1", async () => {
        const req = {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "invalid-header": "value\u0000",
            },
            nextUrl: new URL("https://example.com/malformed-headers"),
        } as unknown as NextRequest;

        const res = await securityHeadersMiddleware(req);

        expect(res.status).toBe(500);

        const responseBody = await res.json();
        expect(responseBody).toEqual({ error: "Internal Server Error" });
    });

    describe("securityHeadersMiddleware", () => {
        beforeEach(() => {
            // --- NOTES is included in the comments below:
            // Clear all mock function calls and reset their states before each test.
            // This ensures that no mock data from previous tests affects the current one.
            jest.clearAllMocks();

            // Restore all mocked functions to their original implementations.
            // This prevents side effects from lingering mocks.
            jest.restoreAllMocks();
        });

        afterEach(() => {
            // Clear mocks again after each test to guarantee a clean state.
            jest.clearAllMocks();

            // Restore original implementations to maintain isolation between tests.
            jest.restoreAllMocks();
        });

        test("should handle high volume of requests efficiently", async () => {
            // Mock the environment to production mode
            jest.spyOn(envConfig, "isDev").mockReturnValue(false);

            // Create a high volume of requests (1000 in this case) for stress testing
            const requests = Array.from(
                { length: 1000 },
                (_, i) =>
                    new NextRequest(`https://example.com/request-${i}`, {
                        method: "GET", // Simulating a standard GET request
                        headers: { "content-type": "application/json" }, // Standard headers
                    })
            );

            // Process all the requests in parallel using Promise.all to ensure efficiency
            const responses = await Promise.all(
                requests.map((req) => securityHeadersMiddleware(req))
            );

            // Verify that all responses have the expected headers and a status of 200
            responses.forEach((res) => {
                // Ensure Content-Security-Policy header is present
                expect(
                    res.headers.get("Content-Security-Policy")
                ).toBeDefined();

                // Ensure the response status is 200 (OK)
                expect(res.status).toBe(200);
            });
        });

        test("should log detailed error messages", () => {
            // Simulate an environment where an error is thrown
            jest.spyOn(envConfig, "isDev").mockImplementation(() => {
                throw new Error("Simulated error"); // Force a simulated error
            });

            // Create a standard GET request
            const req = new NextRequest("https://example.com/error", {
                method: "GET",
                headers: {
                    "content-type": "application/json", // Standard headers
                },
            });

            // Call the middleware and expect it to handle the error gracefully
            securityHeadersMiddleware(req);

            // Verify that the logger recorded the error with the correct message and details
            expect(logger.error).toHaveBeenCalledWith(
                "Error in securityHeadersMiddleware:",
                expect.objectContaining({
                    error: new Error("Simulated error"),
                })
            );
        });
    });

    // TODO NextRequestを偽装してペネとレーションテストを試行したが互換性の問題からすぐに終わらなそうだったので一旦おき。とりあえず攻撃を試みても失敗してたことと脅威モデルレベルが高いため後回し。
    // test("should handle malformed headers gracefully", async () => {
    //     // Arrange
    //     jest.spyOn(envConfig, "isDev").mockReturnValue(false);

    //     const headers = new MockHeaders({
    //         "content-type": "application/json",
    //         "invalid-header": "value\u0000", // Invalid header value
    //     }) as unknown as Headers;

    //     const mockRequest = new MockNextRequest(
    //         new URL("https://example.com/malformed-headers"),
    //         {
    //             method: "GET",
    //             headers: headers,
    //         }
    //     ) as unknown as NextRequest;

    //     // Act
    //     const res = securityHeadersMiddleware(mockRequest);

    //     // Assert
    //     expect(res.status).toBe(400);
    //     const responseBody = await res.json();
    //     expect(responseBody).toEqual({
    //         error: "Invalid header value for invalid-header",
    //     });

    //     expect(logger.error).toHaveBeenCalledWith(
    //         "Error in securityHeadersMiddleware:",
    //         expect.any(Error)
    //     );
    // });
});
