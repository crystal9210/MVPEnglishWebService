// TODO

import { cachingMiddleware } from "@/middlewares/caching";
import { NextRequest, NextResponse } from "next/server";

// Mock dependencies
jest.mock("next/server", () => {
    const originalModule = jest.requireActual("next/server");
    return {
        ...originalModule,
        NextResponse: {
            next: jest.fn(() => ({
                headers: new Map(),
            })),
        },
    };
});

describe("cachingMiddleware", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should disable caching for API routes", () => {
        // Arrange
        const req = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });

        // Act
        const response = cachingMiddleware(req);

        // Assert
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledWith(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );
        }
    });

    it("should enable caching for non-API routes", () => {
        // Arrange
        const req = new NextRequest("https://example.com/static/image.png", {
            method: "GET",
        });

        // Act
        const response = cachingMiddleware(req);

        // Assert
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledWith(
                "Cache-Control",
                "public, max-age=3600, immutable"
            );
        }
    });

    it("should correctly handle different HTTP methods", () => {
        // Arrange
        const reqGet = new NextRequest("https://example.com/api/test", {
            method: "GET",
        });
        const reqPost = new NextRequest("https://example.com/api/test", {
            method: "POST",
        });
        const reqPut = new NextRequest("https://example.com/static/data.json", {
            method: "PUT",
        });

        // Act
        const responseGet = cachingMiddleware(reqGet);
        const responsePost = cachingMiddleware(reqPost);
        const responsePut = cachingMiddleware(reqPut);

        // Assert
        expect(NextResponse.next).toHaveBeenCalledTimes(3);

        if (responseGet) {
            expect(responseGet.headers.set).toHaveBeenCalledWith(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );
        }

        if (responsePost) {
            expect(responsePost.headers.set).toHaveBeenCalledWith(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );
        }

        if (responsePut) {
            expect(responsePut.headers.set).toHaveBeenCalledWith(
                "Cache-Control",
                "public, max-age=3600, immutable"
            );
        }
    });

    it("should handle root path correctly", () => {
        // Arrange
        const req = new NextRequest("https://example.com/", {
            method: "GET",
        });

        // Act
        const response = cachingMiddleware(req);

        // Assert
        expect(NextResponse.next).toHaveBeenCalledTimes(1);
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.set).toHaveBeenCalledWith(
                "Cache-Control",
                "public, max-age=3600, immutable"
            );
        }
    });
});
