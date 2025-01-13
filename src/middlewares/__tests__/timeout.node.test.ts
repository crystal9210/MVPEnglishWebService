/**
 * Confirmed all tests have passed at 2025/01/13.
 */

import { timeoutMiddleware } from "@/middlewares/timeout";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/config/logger";

jest.useFakeTimers();

// Mock dependencies
jest.mock("next/server", () => {
    const originalModule = jest.requireActual("next/server");
    return {
        ...originalModule,
        NextResponse: {
            json: jest.fn((body, init) => ({
                status: init?.status || 200,
                body: JSON.stringify(body),
                headers: new Map(Object.entries(init?.headers || {})),
            })),
            next: jest.fn(() => ({})),
        },
    };
});

jest.mock("@/config/logger", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe("timeoutMiddleware", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should proceed to next middleware before timeout", async () => {
        // Arrange
        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });

        // Act
        const promise = timeoutMiddleware(req);

        // Fast-forward time less than MAX_REQUEST_TIME_MS
        jest.advanceTimersByTime(1000);

        const response = await promise;

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "Processing request: GET https://example.com/api/test"
        );
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(response).toBe(NextResponse.next());
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("should respond with 503 if request times out", async () => {
        // Arrange
        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });

        // Act
        const promise = timeoutMiddleware(req);

        // Fast-forward time beyond MAX_REQUEST_TIME_MS
        jest.advanceTimersByTime(6000);

        const response = await promise;

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "Processing request: GET https://example.com/api/test"
        );
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: "Request timed out" },
            { status: 503 }
        );
        expect(logger.error).toHaveBeenCalledWith(
            "Request timed out: GET https://example.com/api/test"
        );
        expect(response).toEqual(
            NextResponse.json({ error: "Request timed out" }, { status: 503 })
        );
    });

    it("should handle multiple concurrent requests correctly", async () => {
        // Arrange
        const req1 = new NextRequest("https://example.com/api/test1", {
            method: "GET",
        });
        const req2 = new NextRequest("https://example.com/api/test2", {
            method: "POST",
        });

        // Act
        const promise1 = timeoutMiddleware(req1);
        const promise2 = timeoutMiddleware(req2);

        // Fast-forward time to trigger both timeouts
        jest.advanceTimersByTime(6000);

        const response1 = await promise1;
        const response2 = await promise2;

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "Processing request: GET https://example.com/api/test1"
        );
        expect(logger.info).toHaveBeenCalledWith(
            "Processing request: POST https://example.com/api/test2"
        );
        expect(NextResponse.json).toHaveBeenCalledTimes(2);
        expect(logger.error).toHaveBeenCalledWith(
            "Request timed out: GET https://example.com/api/test1"
        );
        expect(logger.error).toHaveBeenCalledWith(
            "Request timed out: POST https://example.com/api/test2"
        );
        expect(response1).toEqual(
            NextResponse.json({ error: "Request timed out" }, { status: 503 })
        );
        expect(response2).toEqual(
            NextResponse.json({ error: "Request timed out" }, { status: 503 })
        );
    });
});
