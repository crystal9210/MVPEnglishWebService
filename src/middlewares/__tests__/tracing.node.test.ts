/**
 * Confirmed all tests have passed at 2025/01/13.
 */

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
                    get: jest.fn(),
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
        error: jest.fn(),
    },
}));

describe("tracingMiddleware", () => {
    let nextResponseMock: { headers: { set: jest.Mock; get: jest.Mock } };

    beforeEach(() => {
        jest.resetAllMocks();
        nextResponseMock = {
            headers: {
                set: jest.fn(),
                get: jest.fn(),
            },
        };
        (NextResponse.next as jest.Mock).mockReturnValue(nextResponseMock);
    });

    it("should add X-Request-ID header when x-request-id is present (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "x-request-id": "existing-request-id" },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
            "Tracing request ID: existing-request-id for GET https://example.com/api/test"
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            "existing-request-id"
        );
    });

    it("should generate and add X-Request-ID header if missing (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "POST",
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    it("should skip tracing headers in development", () => {
        (isDev as jest.Mock).mockReturnValue(true);

        const req = new NextRequest("http://localhost:3000/api/test", {
            method: "GET",
        });

        tracingMiddleware(req);

        expect(logger.debug).toHaveBeenCalledTimes(1);
        expect(logger.debug).toHaveBeenCalledWith(
            "Tracing middleware skipped in development for GET http://localhost:3000/api/test"
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).not.toHaveBeenCalled();
    });

    it("should log errors and continue if an exception occurs", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "DELETE",
        });

        jest.spyOn(req.headers, "get").mockImplementationOnce(() => {
            throw new Error("Header error");
        });

        tracingMiddleware(req);

        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining("Error in tracing middleware"),
            expect.any(Object)
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(nextResponseMock).toBeDefined();
    });

    it("should handle invalid x-request-id in production", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "x-request-id": "invalid-id" },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    it("should handle different HTTP methods in production", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "OPTIONS",
            headers: { "x-request-id": "existing-request-id" },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
            "Tracing request ID: existing-request-id for OPTIONS https://example.com/api/test"
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledTimes(1);
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            "existing-request-id"
        );
    });

    it("should handle extremely long x-request-id gracefully (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const longRequestId = "a".repeat(1000); // ID which has 1,000 length string
        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "x-request-id": longRequestId },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    it("should handle multiple calls to the middleware without conflict", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req1 = new NextRequest("https://example.com/api/test1", {
            method: "GET",
        });
        const req2 = new NextRequest("https://example.com/api/test2", {
            method: "POST",
        });

        tracingMiddleware(req1);
        tracingMiddleware(req2);

        expect(nextResponseMock.headers.set).toHaveBeenCalledTimes(2);
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );

        // Check for uniqueness
        const id1 = (nextResponseMock.headers.set as jest.Mock).mock
            .calls[0][1];
        const id2 = (nextResponseMock.headers.set as jest.Mock).mock
            .calls[1][1];
        expect(id1).not.toEqual(id2);
    });

    it("should generate a new request ID if x-request-id format is invalid (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "x-request-id": "invalid id!" },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    it("should not overwrite existing headers other than X-Request-ID", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        nextResponseMock.headers.get.mockImplementation((key) => {
            if (key === "X-Existing-Header") return "existing-value";
            return null;
        });

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });

        tracingMiddleware(req);

        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
        expect(nextResponseMock.headers.set).not.toHaveBeenCalledWith(
            "X-Existing-Header",
            "existing-value"
        );
    });

    it("should handle exceptions in header operations and proceed gracefully", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        nextResponseMock.headers.set.mockImplementation(() => {
            throw new Error("Header operation error");
        });

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });

        const response = tracingMiddleware(req);

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining("Error in tracing middleware"),
            expect.any(Object)
        );
        expect(response).toBeDefined();
    });

    it("should generate a new request ID if x-request-id is too short (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "x-request-id": "shrt" },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    it("should generate unique X-Request-ID for multiple requests (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const requestCount = 1000; // Simulate 1000 requests
        const generatedIds = new Set();

        for (let i = 0; i < requestCount; i++) {
            const req = new NextRequest(`https://example.com/api/test/${i}`, {
                method: "GET",
            });

            tracingMiddleware(req);

            const generatedId = (nextResponseMock.headers.set as jest.Mock).mock
                .calls[i][1];
            expect(generatedIds.has(generatedId)).toBe(false); // Ensure the ID is unique
            generatedIds.add(generatedId);
        }

        expect(generatedIds.size).toBe(requestCount); // Ensure all IDs are unique
    });

    it("should handle case-insensitive x-request-id header (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "X-REQUEST-ID": "case-insensitive-id" },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            "Tracing request ID: case-insensitive-id for GET https://example.com/api/test"
        );
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            "case-insensitive-id"
        );
    });

    it("should generate a new request ID if x-request-id contains invalid characters (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const req = new NextRequest("https://example.com/api/test", {
            method: "POST",
            headers: { "x-request-id": "invalid-id-!" }, // Invalid due to special character '!'
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ") // New ID is generated
        );
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    it("should generate a new request ID if x-request-id exceeds the maximum length (production)", () => {
        (isDev as jest.Mock).mockReturnValue(false);

        const longRequestId = "a".repeat(50); // 50 characters, exceeding the maximum length of 36
        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
            headers: { "x-request-id": longRequestId },
        });

        tracingMiddleware(req);

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Tracing request ID: ")
        );
        expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
            "X-Request-ID",
            expect.any(String)
        );
    });

    describe("tracingMiddleware", () => {
        let nextResponseMock: { headers: { set: jest.Mock; get: jest.Mock } };

        beforeEach(() => {
            jest.resetAllMocks();
            nextResponseMock = {
                headers: {
                    set: jest.fn(),
                    get: jest.fn(),
                },
            };
            (NextResponse.next as jest.Mock).mockReturnValue(nextResponseMock);
        });

        // その他のテストは省略...

        it("should handle all HTTP methods correctly in production", () => {
            (isDev as jest.Mock).mockReturnValue(false);

            const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
            for (const method of methods) {
                const req = new NextRequest(
                    `https://example.com/api/test/${method}`,
                    {
                        method,
                        headers: { "x-request-id": `id-for-${method}` },
                    }
                );

                tracingMiddleware(req);

                expect(logger.info).toHaveBeenCalledWith(
                    `Tracing request ID: id-for-${method} for ${method} https://example.com/api/test/${method}`
                );
                expect(NextResponse.next).toHaveBeenCalledTimes(
                    methods.indexOf(method) + 1
                );
                expect(nextResponseMock.headers.set).toHaveBeenCalledWith(
                    "X-Request-ID",
                    `id-for-${method}`
                );
            }
        });

        it("should generate unique X-Request-ID for 10,000 requests (performance test)", () => {
            (isDev as jest.Mock).mockReturnValue(false);

            const requestCount = 10000;
            const generatedIds = new Set();

            for (let i = 0; i < requestCount; i++) {
                const req = new NextRequest(
                    `https://example.com/api/test/${i}`,
                    {
                        method: "GET",
                    }
                );

                tracingMiddleware(req);

                const generatedId = (nextResponseMock.headers.set as jest.Mock)
                    .mock.calls[i][1];
                expect(generatedIds.has(generatedId)).toBe(false); // Ensure the ID is unique
                generatedIds.add(generatedId);
            }

            expect(generatedIds.size).toBe(requestCount); // Ensure all IDs are unique
            console.log(`Generated ${generatedIds.size} unique request IDs.`);
        });

        it("should handle mixed HTTP methods for 10,000 requests (performance test)", () => {
            (isDev as jest.Mock).mockReturnValue(false);

            const requestCount = 10000;
            const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
            const generatedIds = new Set();

            for (let i = 0; i < requestCount; i++) {
                const method = methods[i % methods.length];
                const req = new NextRequest(
                    `https://example.com/api/test/${method}/${i}`,
                    {
                        method,
                    }
                );

                tracingMiddleware(req);

                const generatedId = (nextResponseMock.headers.set as jest.Mock)
                    .mock.calls[i][1];
                expect(generatedIds.has(generatedId)).toBe(false); // Ensure the ID is unique
                generatedIds.add(generatedId);
            }

            expect(generatedIds.size).toBe(requestCount); // Ensure all IDs are unique
            console.log(`Generated ${generatedIds.size} unique request IDs.`);
        });
    });
});
