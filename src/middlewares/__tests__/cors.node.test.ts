// TODO

import { corsMiddleware } from "@/middlewares/cors";
import { NextRequest, NextResponse } from "next/server";
import { isDev, isHttpForDev, shouldEnforceHttps } from "@/config/envConfig";
import { logger } from "@/config/logger";

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
            next: jest.fn(() => ({
                headers: new Map(),
            })),
        },
    };
});

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
    });

    it("should allow requests from allowed origins", () => {
        // Arrange
        const req = new NextRequest("https://yourdomain.com/api/test", {
            method: "GET",
        });
        req.headers.set("origin", "https://yourdomain.com");

        const response = corsMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for origin: https://yourdomain.com"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
                "https://yourdomain.com"
            );
            expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
                "Content-Type, Authorization"
            );
            expect(
                response.headers.get("Access-Control-Allow-Credentials")
            ).toBe("true");
        }
    });

    it("should reject insecure HTTP requests if HTTPS is enforced", () => {
        // Arrange
        (shouldEnforceHttps as jest.Mock).mockReturnValue(true);

        const req = new NextRequest("http://yourdomain.com/api/test", {
            method: "GET",
        });
        req.headers.set("origin", "http://yourdomain.com");

        const response = corsMiddleware(req);

        // Assert
        expect(logger.warn).toHaveBeenCalledWith(
            "Rejected insecure request: GET http://yourdomain.com/api/test Origin: http://yourdomain.com"
        );
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: "HTTPS is required." },
            { status: 403 }
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.status).toBe(403);
            expect(response.body).toBe(
                JSON.stringify({ error: "HTTPS is required." })
            );
        }
    });

    it("should handle preflight OPTIONS requests correctly", () => {
        // Arrange
        const req = new NextRequest("https://yourdomain.com/api/test", {
            method: "OPTIONS",
        });
        req.headers.set("origin", "https://yourdomain.com");

        const response = corsMiddleware(req);

        // Assert
        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: "CORS Preflight" },
            { status: 204 }
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.status).toBe(204);
            expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
                "https://yourdomain.com"
            );
            expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
                "Content-Type, Authorization"
            );
            expect(
                response.headers.get("Access-Control-Allow-Credentials")
            ).toBe("true");
        }
    });

    it("should allow all origins in development with HTTP", () => {
        // Arrange
        (isDev as jest.Mock).mockReturnValue(true);
        (isHttpForDev as jest.Mock).mockReturnValue(true);

        const req = new NextRequest("http://localhost:3000/api/test", {
            method: "GET",
        });
        req.headers.set("origin", "http://localhost:3000");

        const response = corsMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for all origins in development: GET http://localhost:3000/api/test"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
                "*"
            );
            expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
                "Content-Type, Authorization"
            );
            expect(
                response.headers.get("Access-Control-Allow-Credentials")
            ).toBe("true");
        }
    });

    it("should not set CORS headers for disallowed origins", () => {
        // Arrange
        const req = new NextRequest("https://disallowed.com/api/test", {
            method: "GET",
        });
        req.headers.set("origin", "https://disallowed.com");

        const response = corsMiddleware(req);

        // Assert
        expect(logger.debug).toHaveBeenCalledWith(
            "CORS headers not set for origin: https://disallowed.com"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.has("Access-Control-Allow-Origin")).toBe(
                false
            );
            expect(response.headers.has("Access-Control-Allow-Methods")).toBe(
                false
            );
            expect(response.headers.has("Access-Control-Allow-Headers")).toBe(
                false
            );
            expect(
                response.headers.has("Access-Control-Allow-Credentials")
            ).toBe(false);
        }
    });

    it("should handle requests without Origin header gracefully", () => {
        // Arrange
        const req = new NextRequest("https://yourdomain.com/api/test", {
            method: "GET",
        });
        // No Origin header set

        const response = corsMiddleware(req);

        // Assert
        expect(logger.debug).toHaveBeenCalledWith(
            "CORS headers not set for origin: null"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.has("Access-Control-Allow-Origin")).toBe(
                false
            );
        }
    });

    it("should allow CORS for allowed origins and handle non-OPTIONS methods", () => {
        // Arrange
        const req = new NextRequest("https://www.yourdomain.com/api/test", {
            method: "POST",
        });
        req.headers.set("origin", "https://www.yourdomain.com");

        const response = corsMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for origin: https://www.yourdomain.com"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
                "https://www.yourdomain.com"
            );
            expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
                "Content-Type, Authorization"
            );
            expect(
                response.headers.get("Access-Control-Allow-Credentials")
            ).toBe("true");
        }
    });

    it("should allow CORS for allowed origins and handle secure HTTPS enforcement correctly", () => {
        // Arrange
        (shouldEnforceHttps as jest.Mock).mockReturnValue(true);
        const req = new NextRequest("https://yourdomain.com/api/test", {
            method: "GET",
        });
        req.headers.set("origin", "https://yourdomain.com");

        const response = corsMiddleware(req);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            "CORS allowed for origin: https://yourdomain.com"
        );
        expect(response).toBeDefined();
        if (response) {
            expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
                "https://yourdomain.com"
            );
            expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
                "Content-Type, Authorization"
            );
            expect(
                response.headers.get("Access-Control-Allow-Credentials")
            ).toBe("true");
        }
    });
});
