/**
 * Confirmed all tests have passed at 2025/01/13.
 */

// Mock configuration
jest.mock("next/server", () => ({
    NextResponse: {
        next: jest.fn(() => ({
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        })),
        json: jest.fn(() => ({
            status: 401,
            body: { error: "Unauthorized" },
        })),
        cookies: {
            set: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock("crypto", () => ({
    randomBytes: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

import { sessionMiddleware } from "@/middlewares/session";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

describe("sessionMiddleware", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (randomBytes as jest.Mock).mockReturnValue(
            Buffer.from("aabbccddeeff00112233445566778899", "hex")
        );
    });

    it("should set a new sessionId if no sessionId exists", () => {
        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue(undefined) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "sessionId",
                value: "aabbccddeeff00112233445566778899",
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "strict",
                path: "/",
                maxAge: 3600,
            })
        );
    });

    it("should verify and refresh a JWT nearing expiration", () => {
        const mockToken = "mock.jwt.token";
        const mockRefreshedToken = "mock.jwt.refreshed.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 100, // Expires in 100 seconds
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
        (jwt.sign as jest.Mock).mockReturnValue(mockRefreshedToken);

        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "jwt",
                value: mockRefreshedToken,
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "strict",
                path: "/",
            })
        );
    });

    it("should delete an expired JWT", () => {
        const mockToken = "mock.jwt.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Token expired");
        });

        const mockNextResponse = {
            cookies: {
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.delete).toHaveBeenCalledWith("jwt");
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: "Unauthorized" },
            { status: 401 }
        );
    });

    it("should not modify cookies if both sessionId and valid JWT exist", () => {
        const mockToken = "mock.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: {
                get: jest
                    .fn()
                    .mockReturnValueOnce({ value: "existingSessionId" }) // sessionId
                    .mockReturnValueOnce({ value: mockToken }), // jwt
            },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.set).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully when randomBytes fails", () => {
        // Arrange
        (randomBytes as jest.Mock).mockImplementationOnce(() => {
            throw new Error("randomBytes error");
        });

        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = { cookies: { get: jest.fn() } } as any;

        // Act & Assert
        expect(() => sessionMiddleware(req)).toThrow("randomBytes error");
    });

    it("should generate unique session IDs for concurrent requests", () => {
        // Arrange
        let counter = 0; // Use a counter to simulate unique IDs
        (randomBytes as jest.Mock).mockImplementation(() => {
            counter++;
            return Buffer.from(`uniqueValue${counter}`, "utf8");
        });

        const mockNextResponse1 = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        const mockNextResponse2 = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;

        jest.spyOn(NextResponse, "next")
            .mockReturnValueOnce(mockNextResponse1)
            .mockReturnValueOnce(mockNextResponse2);

        const req1 = { cookies: { get: jest.fn() } } as any;
        const req2 = { cookies: { get: jest.fn() } } as any;

        // Act
        sessionMiddleware(req1);
        sessionMiddleware(req2);

        // Assert
        expect(mockNextResponse1.cookies.set).toHaveBeenCalled();
        expect(mockNextResponse2.cookies.set).toHaveBeenCalled();
        expect(
            mockNextResponse1.cookies.set.mock.calls[0][0].value
        ).not.toEqual(mockNextResponse2.cookies.set.mock.calls[0][0].value);
    });

    it("should handle session deletion gracefully", () => {
        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: "expiredSessionId" }),
            },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.delete).toHaveBeenCalledWith("jwt");
    });

    it("should handle empty cookies gracefully", () => {
        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue(undefined) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "sessionId",
            })
        );
    });

    it("should refresh both sessionId and JWT if both are missing", () => {
        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue(undefined) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.set).toHaveBeenCalledTimes(2); //  Set both sessionId and JWT
        expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({ name: "sessionId" })
        );
        expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({ name: "jwt" })
        );
    });

    it("should set secure=true in production environment", () => {
        const originalEnv = process.env.NODE_ENV;

        Object.defineProperty(process.env, "NODE_ENV", {
            value: "production",
            configurable: true,
        });

        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue(undefined) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({ secure: true })
        );

        Object.defineProperty(process.env, "NODE_ENV", {
            value: originalEnv,
            configurable: true,
        });
    });

    it("should delete an expired JWT", () => {
        const mockToken = "mock.jwt.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Token expired");
        });

        const mockNextResponse = {
            cookies: {
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        sessionMiddleware(req);

        expect(mockNextResponse.cookies.delete).toHaveBeenCalledWith("jwt");
        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: "Unauthorized" },
            { status: 401 }
        );
    });

    it("should handle errors gracefully when randomBytes fails", () => {
        (randomBytes as jest.Mock).mockImplementationOnce(() => {
            throw new Error("randomBytes error");
        });

        const mockNextResponse = {
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as any;
        jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

        const req = { cookies: { get: jest.fn() } } as any;

        expect(() => sessionMiddleware(req)).toThrow("randomBytes error");

        expect(mockNextResponse.cookies.set).not.toHaveBeenCalled();
    });
});
