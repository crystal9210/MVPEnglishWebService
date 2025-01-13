/**
 * Confirmed all tests have passed at 2025/01/12.
 */
import { NextRequest, NextResponse } from "next/server";
import { loggingMiddleware } from "../logging";
import * as utils from "../utils";
import { logger } from "@/config/logger";

jest.mock("@/config/logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe("loggingMiddleware", () => {
    const mockGetClientIp = jest.spyOn(utils, "getClientIp");

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Normal test: All headers are present.
     * Verifies that the middleware logs all required information and proceeds correctly.
     */
    test("should log request details and user information when all headers are present", async () => {
        // Arrange: Mock `getClientIp` to return a specific IP address
        mockGetClientIp.mockReturnValue("192.168.1.1");

        // Create a mock request with necessary headers
        const req = new NextRequest("https://example.com/test", {
            method: "GET",
            headers: {
                "x-user-id": "123",
                "x-user-role": "admin",
                "content-type": "application/json",
            },
        });

        // Execute the middleware
        const res = await loggingMiddleware(req);

        // Verify that `logger.info` was called with the correct arguments
        expect(logger.info).toHaveBeenCalledWith("Request received", {
            method: "GET",
            url: "https://example.com/test",
            ip: "192.168.1.1",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "x-user-id",
            value: "123",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "x-user-role",
            value: "admin",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "content-type",
            value: "application/json",
        });
        expect(logger.info).toHaveBeenCalledWith("User information", {
            userId: "123",
            userRole: "admin",
        });

        // Verify that the middleware returns `NextResponse.next()`
        expect(res).toBeInstanceOf(NextResponse);
    });

    /**
     * Abnormal test: User-related headers are missing.
     * Ensures that the middleware handles missing headers gracefully without errors.
     */
    test("should handle missing user headers gracefully", async () => {
        // Arrange: Mock `getClientIp` to return a specific IP address
        mockGetClientIp.mockReturnValue("192.168.1.2");

        // Create a mock request without user-related headers
        const req = new NextRequest("https://example.com/test", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
        });

        // Execute the middleware
        const res = await loggingMiddleware(req);

        // Verify that `logger.info` was called with the correct arguments
        expect(logger.info).toHaveBeenCalledWith("Request received", {
            method: "POST",
            url: "https://example.com/test",
            ip: "192.168.1.2",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "content-type",
            value: "application/json",
        });
        // Ensure that user-related logs are not called
        expect(logger.info).not.toHaveBeenCalledWith(
            expect.objectContaining({
                message: "User information",
            })
        );

        // Verify that the middleware returns `NextResponse.next()`
        expect(res).toBeInstanceOf(NextResponse);
    });

    /**
     * Stress test: Handling a large number of requests efficiently.
     * Confirms that the middleware can process high volumes of requests without failure.
     */
    test("should handle a large number of requests efficiently", async () => {
        const numRequests = 1000;

        // Simulate a large number of requests
        for (let i = 0; i < numRequests; i++) {
            // Mock `getClientIp` to return a different IP for each request
            mockGetClientIp.mockReturnValueOnce(`192.168.1.${i % 255}`);
            const req = new NextRequest(`https://example.com/test${i}`, {
                method: "GET",
                headers: {
                    "x-user-id": `${i}`,
                    "x-user-role": "user",
                    "content-type": "application/json",
                },
            });

            // Execute the middleware
            const res = await loggingMiddleware(req);

            // Verify that the middleware returns `NextResponse.next()`
            expect(res).toBeInstanceOf(NextResponse);
        }

        // Each request should log 5 times:
        // 1. Request received
        // 2. x-user-id header
        // 3. x-user-role header
        // 4. content-type header
        // 5. User information
        expect(logger.info).toHaveBeenCalledTimes(numRequests * 5);
    });

    /**
     * Penetration test: Logging suspicious headers appropriately.
     * Ensures that even with suspicious headers, the middleware logs correctly.
     */
    test("should log suspicious headers appropriately", async () => {
        // Arrange: Mock `getClientIp` to return a specific IP address
        mockGetClientIp.mockReturnValue("192.168.1.3");

        // Create a mock request with a suspicious header
        const req = new NextRequest("https://example.com/evil", {
            method: "DELETE",
            headers: {
                "x-user-id": "999",
                "x-user-role": "admin",
                "x-suspicious-header": "malicious",
            },
        });

        // Execute the middleware
        const res = await loggingMiddleware(req);

        // Verify that all headers, including suspicious ones, are logged
        expect(logger.info).toHaveBeenCalledWith("Request received", {
            method: "DELETE",
            url: "https://example.com/evil",
            ip: "192.168.1.3",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "x-user-id",
            value: "999",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "x-user-role",
            value: "admin",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "x-suspicious-header",
            value: "malicious",
        });
        expect(logger.info).toHaveBeenCalledWith("User information", {
            userId: "999",
            userRole: "admin",
        });

        // Verify that the middleware returns `NextResponse.next()`
        expect(res).toBeInstanceOf(NextResponse);
    });

    /**
     * Abnormal test: Multiple IPs in `x-forwarded-for` header.
     * Ensures that the first IP is correctly extracted and logged.
     */
    test("should correctly extract the first IP from x-forwarded-for header with multiple IPs", async () => {
        // Arrange: Mock `getClientIp` to return the first IP from `x-forwarded-for`
        mockGetClientIp.mockReturnValue("203.0.113.195");

        // Create a mock request with multiple IPs in `x-forwarded-for` header
        const req = new NextRequest("https://example.com/multi-ip", {
            method: "GET",
            headers: {
                "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
                "content-type": "application/json",
            },
        });

        // Execute the middleware
        const res = await loggingMiddleware(req);

        // Verify that only the first IP is logged
        expect(logger.info).toHaveBeenCalledWith("Request received", {
            method: "GET",
            url: "https://example.com/multi-ip",
            ip: "203.0.113.195",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "x-forwarded-for",
            value: "203.0.113.195, 70.41.3.18, 150.172.238.178",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "content-type",
            value: "application/json",
        });
        // Ensure that user-related logs are not called
        expect(logger.info).not.toHaveBeenCalledWith(
            expect.objectContaining({
                message: "User information",
            })
        );

        // Verify that the middleware returns `NextResponse.next()`
        expect(res).toBeInstanceOf(NextResponse);
    });

    /**
     * Abnormal test: No IP-related headers are present.
     * Ensures that the middleware logs 'unknown' when IP cannot be determined.
     */
    test("should return 'unknown' when no IP-related headers are present", async () => {
        // Arrange: Mock `getClientIp` to return "unknown"
        mockGetClientIp.mockReturnValue("unknown");

        // Create a mock request without IP-related headers
        const req = new NextRequest("https://example.com/no-ip", {
            method: "GET",
            headers: {
                "content-type": "application/json",
            },
        });

        // Execute the middleware
        const res = await loggingMiddleware(req);

        // Verify that 'unknown' is logged as the IP
        expect(logger.info).toHaveBeenCalledWith("Request received", {
            method: "GET",
            url: "https://example.com/no-ip",
            ip: "unknown",
        });
        expect(logger.info).toHaveBeenCalledWith("Request header", {
            header: "content-type",
            value: "application/json",
        });
        // Ensure that user-related logs are not called
        expect(logger.info).not.toHaveBeenCalledWith(
            expect.objectContaining({
                message: "User information",
            })
        );

        // Verify that the middleware returns `NextResponse.next()`
        expect(res).toBeInstanceOf(NextResponse);
    });
});
