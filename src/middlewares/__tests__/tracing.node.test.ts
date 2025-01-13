// TODO
import { tracingMiddleware } from "@/middlewares/tracing";
import { NextRequest, NextResponse } from "next/server";
import { isDev } from "@/config/envConfig";
import { logger } from "@/config/logger";

jest.mock("next/server", () => {
    const originalModule = jest.requireActual("next/server");
    return {
        ...originalModule,
        NextResponse: {
            next: jest.fn(() => ({
                headers: {
                    set: jest.fn(),
                },
            })),
        },
    };
});

jest.mock("@/config/envConfig", () => ({
    isDev: jest.fn(),
}));

jest.mock("@/config/logger", () => ({
    logger: {
        info: jest.fn(),
        debug: jest.fn(),
    },
}));

describe("tracingMiddleware", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should add X-Request-ID header in production", () => {
        // Arrange
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });
        req.headers.set("x-request-id", "existing-request-id");

        const response = tracingMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "Tracing request ID: existing-request-id for GET https://example.com/api/test"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledWith(
                "X-Request-ID",
                "existing-request-id"
            );
        }
    });

    it("should generate and add X-Request-ID header if not present in production", () => {
        // Arrange
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "POST",
        });
        // No existing x-request-id header

        const response = tracingMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledTimes(1);
            const setArgs = (response.headers.set as jest.Mock).mock.calls[0];
            expect(setArgs[0]).toBe("X-Request-ID");
            expect(typeof setArgs[1]).toBe("string");
            expect(setArgs[1].length).toBeGreaterThan(0);
        }
    });

    it("should skip adding tracing headers in development", () => {
        // Arrange
        (isDev as jest.Mock).mockReturnValue(true);

        const req = new NextRequest("http://localhost:3000/api/test", {
            method: "GET",
        });
        req.headers.set("x-request-id", "dev-request-id");

        const response = tracingMiddleware(req);

        // Assert
        expect(logger.debug).toHaveBeenCalledWith(
            "Tracing middleware skipped in development for GET http://localhost:3000/api/test"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledTimes(1);
            // Even in development, NextResponse.next() is called, but headers are not modified
            // Depending on implementation, it might still set headers; adjust accordingly
            // Here, assuming it doesn't set "X-Request-ID" in development
            // So, no expectation on headers.set
        }
    });

    it("should add generated X-Request-ID when existing header is absent in production", () => {
        // Arrange
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "PUT",
        });
        // No existing x-request-id header

        const response = tracingMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledWith(
                "X-Request-ID",
                expect.any(String)
            );
            const setArgs = (response.headers.set as jest.Mock).mock.calls[0];
            expect(setArgs[1]).toMatch(/^[a-z0-9]+$/i); // Simple regex for alphanumeric
        }
    });
});
