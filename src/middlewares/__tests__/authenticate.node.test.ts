// TODO
import { NextRequest, NextResponse } from "next/server";
import { authenticateMiddleware } from "../authenticate";
import { getToken, JWT } from "next-auth/jwt";

// Mock the next-auth/jwt module
jest.mock("next-auth/jwt", () => ({
    getToken: jest.fn(),
}));

// Mock the environment configuration
jest.mock("../../config/envConfig", () => ({
    isDev: false,
    enforceHttps: true,
    isHttpForDev: jest.fn(),
    AUTH_SECRET: "test_secret",
}));

describe("authenticateMiddleware", () => {
    // Cast getToken as a Jest mock function with proper types
    const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;

    /**
     * Helper function to create a mock NextRequest.
     */
    const createMockRequest = (
        url: string,
        headers: Record<string, string> = {}
    ): NextRequest => {
        const req = new NextRequest(url, { headers });
        // nextUrl is read-only, so use defineProperty to set it
        Object.defineProperty(req, "nextUrl", {
            writable: true,
            value: new URL(url),
        });
        return req;
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should allow access to public paths without authentication", async () => {
        const publicPaths = ["/api/auth/login", "/register", "/signIn"];
        for (const path of publicPaths) {
            const req = createMockRequest(`https://example.com${path}`);
            mockedGetToken.mockResolvedValue(null); // No token

            const res = await authenticateMiddleware(req);
            expect(res).toBeInstanceOf(NextResponse); // Continue processing
            expect(req.headers.get("x-user-id")).toBeNull();
            expect(req.headers.get("x-user-role")).toBeNull();
        }
    });

    test("should redirect to sign-in if token is missing for protected paths", async () => {
        const protectedPaths = ["/api/protected", "/dashboard", "/admin"];
        for (const path of protectedPaths) {
            const req = createMockRequest(`https://example.com${path}`);
            mockedGetToken.mockResolvedValue(null); // No token

            const res = await authenticateMiddleware(req);
            expect(res).toBeInstanceOf(NextResponse);
            if (res instanceof NextResponse) {
                expect(res.status).toBe(307); // Redirect
                expect(res.headers.get("location")).toBe(
                    "https://example.com/signIn"
                );
            }
        }
    });

    test("should redirect to sign-in if token is invalid", async () => {
        const req = createMockRequest("https://example.com/api/protected");
        mockedGetToken.mockResolvedValue({ sub: undefined } as JWT | null); // Invalid token

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(307); // Redirect
            expect(res.headers.get("location")).toBe(
                "https://example.com/signIn"
            );
        }
    });

    test("should attach user ID and role to headers if token is valid", async () => {
        const req = createMockRequest("https://example.com/api/protected");
        mockedGetToken.mockResolvedValue({
            sub: "user123",
            role: "admin",
        } as JWT | null);

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse); // NextResponse オブジェクトを期待
        expect(req.headers.get("x-user-id")).toBe("user123");
        expect(req.headers.get("x-user-role")).toBe("admin");
    });

    test("should default user role to 'user' if role is missing in token", async () => {
        const req = createMockRequest("https://example.com/api/protected");
        mockedGetToken.mockResolvedValue({
            sub: "user123",
            // role is missing
        } as JWT | null);

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse); // NextResponse オブジェクトを期待
        expect(req.headers.get("x-user-id")).toBe("user123");
        expect(req.headers.get("x-user-role")).toBe("user");
    });

    test("should log client IP in development mode", async () => {
        jest.resetModules();
        jest.doMock("../../config/envConfig", () => ({
            isDev: true,
            enforceHttps: false,
            isHttpForDev: jest.fn(),
            AUTH_SECRET: "test_secret",
        }));

        const { authenticateMiddleware: authMiddleware } = await import(
            "../authenticate"
        );
        mockedGetToken.mockResolvedValue({
            sub: "user123",
            role: "admin",
        } as JWT | null);

        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});
        const req = createMockRequest("https://example.com/api/protected", {
            "x-forwarded-for": "123.123.123.123",
        });

        await authMiddleware(req);
        expect(consoleSpy).toHaveBeenCalledWith(
            "[authenticateMiddleware] client IP =",
            "123.123.123.123"
        );
        consoleSpy.mockRestore();
    });

    test("should log token details in development mode for protected paths", async () => {
        jest.resetModules(); // モジュールキャッシュをクリア
        jest.doMock("../../config/envConfig", () => ({
            isDev: true, // 開発モードを有効にする
            enforceHttps: false,
            isHttpForDev: jest.fn(),
            AUTH_SECRET: "test_secret",
        }));

        // モジュールを再インポートしてモックを適用
        const { authenticateMiddleware: authMiddleware } = await import(
            "../authenticate"
        );

        // getToken モックの設定
        const mockedGetToken = jest.requireMock("next-auth/jwt").getToken;
        mockedGetToken.mockResolvedValue({
            sub: "user123",
            role: "admin",
        });

        // getClientIp モックの設定
        jest.mock("../utils", () => ({
            getClientIp: jest.fn(() => "127.0.0.1"),
        }));

        // console.log モック
        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        // モックリクエストの作成
        const req = createMockRequest("https://example.com/api/protected");

        await authMiddleware(req);

        // ログ出力の検証
        expect(consoleSpy).toHaveBeenNthCalledWith(
            1,
            "[authenticateMiddleware] client IP =",
            "127.0.0.1"
        );
        expect(consoleSpy).toHaveBeenNthCalledWith(
            2,
            "[authenticateMiddleware] token:",
            expect.objectContaining({
                sub: "user123",
                role: "admin",
            })
        );

        consoleSpy.mockRestore();
    });

    test("should not log token details in development mode for public paths", async () => {
        jest.resetModules(); // モジュールキャッシュをクリア
        jest.doMock("../../config/envConfig", () => ({
            isDev: true, // 開発モードを有効にする
            enforceHttps: false,
            isHttpForDev: jest.fn(),
            AUTH_SECRET: "test_secret",
        }));

        // モジュールを再インポートしてモックを適用
        const { authenticateMiddleware: authMiddleware } = await import(
            "../authenticate"
        );

        // getToken モックの設定
        const mockedGetToken = jest.requireMock("next-auth/jwt").getToken;
        mockedGetToken.mockResolvedValue({
            sub: "user123",
            role: "admin",
        });

        // getClientIp モックの設定
        jest.mock("../utils", () => ({
            getClientIp: jest.fn(() => "127.0.0.1"),
        }));

        // console.log モック
        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        // モックリクエストの作成
        const req = createMockRequest("https://example.com/api/auth");

        await authMiddleware(req);

        // ログ出力の検証
        expect(consoleSpy).toHaveBeenNthCalledWith(
            1,
            "[authenticateMiddleware] client IP =",
            "127.0.0.1"
        );
        expect(consoleSpy).not.toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("token")
        );

        consoleSpy.mockRestore();
    });

    test("should handle expired token", async () => {
        const req = createMockRequest("https://example.com/api/protected");
        mockedGetToken.mockResolvedValue(null); // Expired token

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(307); // Redirect
            expect(res.headers.get("location")).toBe(
                "https://example.com/signIn"
            );
        }
    });

    test("should handle invalid token", async () => {
        const req = createMockRequest("https://example.com/api/protected");
        mockedGetToken.mockRejectedValue(new Error("Invalid token")); // Invalid token

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(307); // Redirect
            expect(res.headers.get("location")).toBe(
                "https://example.com/signIn"
            );
        }
    });

    test("should handle invalid client IP", async () => {
        const req = createMockRequest("https://example.com/api/protected");
        jest.mock("../utils", () => ({
            getClientIp: jest.fn(() => undefined), // Invalid client IP
        }));

        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse);
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test("should log token details in development mode for invalid token", async () => {
        jest.resetModules();
        jest.doMock("../../config/envConfig", () => ({
            isDev: true,
            enforceHttps: false,
            isHttpForDev: jest.fn(),
            AUTH_SECRET: "test_secret",
        }));

        const { authenticateMiddleware: authMiddleware } = await import(
            "../authenticate"
        );
        mockedGetToken.mockRejectedValue(new Error("Invalid token")); // Invalid token

        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        jest.mock("../utils", () => ({
            getClientIp: jest.fn(() => undefined), // Invalid client IP
        }));

        const req = createMockRequest("https://example.com/api/protected");

        await authMiddleware(req);

        expect(consoleSpy).toHaveBeenNthCalledWith(
            1,
            "[authenticateMiddleware] client IP =",
            undefined
        );
        expect(consoleSpy).not.toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("token")
        );
    });

    describe("authenticateMiddleware - Additional Test Cases", () => {
        // ... (既存のセットアップコードも維持)

        describe("Token Processing Edge Cases", () => {
            test("should handle token with empty string sub", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "",
                    role: "user",
                } as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).toBe(307);
                expect(res?.headers.get("location")).toBe(
                    "https://example.com/signIn"
                );
            });

            test("should handle token with non-string role", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: 123, // 無効な role タイプ
                } as unknown as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-role")).toBe("user");
            });

            test("should handle token with undefined role", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: undefined,
                } as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-role")).toBe("user");
            });
        });

        describe("Public Path Edge Cases", () => {
            test.each([
                "/api/auth/something/nested",
                "/register/confirm",
                "/signIn?redirect=/dashboard",
            ])("should allow access to nested public path %s", async (path) => {
                const req = createMockRequest(`https://example.com${path}`);
                mockedGetToken.mockResolvedValue(null);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).not.toBe(307);
            });

            test("should handle malformed URLs", async () => {
                const req = createMockRequest(
                    "https://example.com/api/auth/%invalid"
                );
                mockedGetToken.mockResolvedValue(null);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
            });
        });

        describe("Development Mode Logging Edge Cases", () => {
            beforeEach(() => {
                jest.resetModules();
                jest.doMock("../../config/envConfig", () => ({
                    isDev: true,
                    enforceHttps: false,
                    isHttpForDev: jest.fn(),
                    AUTH_SECRET: "test_secret",
                }));
            });

            test("should handle undefined client IP in development mode", async () => {
                const { authenticateMiddleware: authMiddleware } = await import(
                    "../authenticate"
                );
                const consoleSpy = jest
                    .spyOn(console, "log")
                    .mockImplementation();
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );

                jest.mock("../utils", () => ({
                    getClientIp: jest.fn(() => undefined),
                }));

                await authMiddleware(req);

                expect(consoleSpy).toHaveBeenCalledWith(
                    "[authenticateMiddleware] client IP =",
                    undefined
                );
                consoleSpy.mockRestore();
            });

            test("should handle circular JSON in token when logging", async () => {
                const { authenticateMiddleware: authMiddleware } = await import(
                    "../authenticate"
                );
                const consoleSpy = jest
                    .spyOn(console, "log")
                    .mockImplementation();
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );

                const circularObj: any = { foo: "bar" };
                circularObj.circular = circularObj;

                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                    circular: circularObj,
                } as unknown as JWT);

                await authMiddleware(req);

                expect(consoleSpy).toHaveBeenCalled();
                consoleSpy.mockRestore();
            });
        });

        describe("Error Handling Edge Cases", () => {
            test("should handle getToken throwing TypeError", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockRejectedValue(
                    new TypeError("Invalid token type")
                );

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).toBe(307);
                expect(res?.headers.get("location")).toBe(
                    "https://example.com/signIn"
                );
            });

            test("should handle request with malformed headers", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                Object.defineProperty(req, "headers", {
                    value: null,
                    writable: true,
                });

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).toBe(307);
            });
        });
    });

    describe("authenticateMiddleware - Enhanced Test Cases", () => {
        let originalEnv: NodeJS.ProcessEnv;

        beforeEach(() => {
            originalEnv = { ...process.env };
            process.env.AUTH_SECRET = "test_secret";
        });

        afterEach(() => {
            process.env = originalEnv;
            jest.resetModules();
        });

        describe("Environment Configuration Cases", () => {
            test("should handle missing AUTH_SECRET", async () => {
                delete process.env.AUTH_SECRET;
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockRejectedValue(
                    new Error("Missing AUTH_SECRET")
                );

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).toBe(307);
                expect(res?.headers.get("location")).toBe(
                    "https://example.com/signIn"
                );
            });

            test("should handle empty AUTH_SECRET", async () => {
                process.env.AUTH_SECRET = "";
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockRejectedValue(
                    new Error("Empty AUTH_SECRET")
                );

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).toBe(307);
            });
        });

        describe("Header Manipulation Cases", () => {
            test("should handle headers.set throwing error", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                const mockHeaders = new Headers();
                Object.defineProperty(mockHeaders, "set", {
                    value: () => {
                        throw new Error("Headers manipulation error");
                    },
                });
                Object.defineProperty(req, "headers", {
                    value: mockHeaders,
                    writable: true,
                });

                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                } as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(res?.status).toBe(307);
            });

            test("should maintain request immutability", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                const originalHeaders = new Headers(req.headers);

                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                } as JWT);

                await authenticateMiddleware(req);

                // 新しいヘッダーが追加されていることを確認
                expect(req.headers.get("x-user-id")).toBe("user123");
                expect(req.headers.get("x-user-role")).toBe("admin");
                // confirm the 元のヘッダーは変更されていないことを確認
                expect(originalHeaders.get("x-user-id")).toBeNull();
                expect(originalHeaders.get("x-user-role")).toBeNull();
            });
        });

        describe("Performance and Resource Cases", () => {
            test("should handle large token payload", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                const largePayload = {
                    sub: "user123",
                    role: "admin",
                    ...Array.from({ length: 1000 }, (_, i) => ({
                        [`key${i}`]: `value${i}`,
                    })),
                };

                mockedGetToken.mockResolvedValue(
                    largePayload as unknown as JWT
                );

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-id")).toBe("user123");
                expect(req.headers.get("x-user-role")).toBe("admin");
            });

            test("should handle concurrent requests", async () => {
                const requests = Array.from({ length: 10 }, () =>
                    createMockRequest("https://example.com/api/protected")
                );

                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                } as JWT);

                const results = await Promise.all(
                    requests.map((req) => authenticateMiddleware(req))
                );

                results.forEach((res) => {
                    expect(res).toBeInstanceOf(NextResponse);
                });
            });
        });

        describe("URL Handling Edge Cases", () => {
            test("should handle URLs with special characters", async () => {
                const specialUrls = [
                    "https://example.com/api/protected/über",
                    "https://example.com/api/protected/测试",
                    "https://example.com/api/protected/!@#$%^&*()",
                ];

                for (const url of specialUrls) {
                    const req = createMockRequest(url);
                    mockedGetToken.mockResolvedValue({
                        sub: "user123",
                        role: "admin",
                    } as JWT);

                    const res = await authenticateMiddleware(req);
                    expect(res).toBeInstanceOf(NextResponse);
                }
            });

            test("should handle path-only URLs", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                const originalUrl = req.nextUrl.pathname;

                Object.defineProperty(req, "nextUrl", {
                    value: new URL("/api/protected", "https://example.com"),
                    writable: true,
                });

                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                } as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.nextUrl.pathname).toBe(originalUrl);
            });
        });

        describe("Token Role Validation Cases", () => {
            test("should handle array of roles", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: ["admin", "user"],
                } as unknown as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-role")).toBe("user");
            });

            test("should handle numeric role values", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: 1,
                } as unknown as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-role")).toBe("user");
            });
        });

        describe("Development Mode Configuration Cases", () => {
            test("should handle switching between dev and prod modes", async () => {
                // First in production mode
                jest.doMock("../../config/envConfig", () => ({
                    isDev: false,
                    enforceHttps: true,
                    isHttpForDev: jest.fn(),
                    AUTH_SECRET: "test_secret",
                }));

                const { authenticateMiddleware: prodMiddleware } = await import(
                    "../authenticate"
                );
                const consoleSpy = jest
                    .spyOn(console, "log")
                    .mockImplementation();

                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                } as JWT);

                await prodMiddleware(req);
                expect(consoleSpy).not.toHaveBeenCalled();

                // Then in development mode
                jest.resetModules();
                jest.doMock("../../config/envConfig", () => ({
                    isDev: true,
                    enforceHttps: false,
                    isHttpForDev: jest.fn(),
                    AUTH_SECRET: "test_secret",
                }));

                const { authenticateMiddleware: devMiddleware } = await import(
                    "../authenticate"
                );
                await devMiddleware(req);
                expect(consoleSpy).toHaveBeenCalled();

                consoleSpy.mockRestore();
            });

            test("should handle development mode with invalid token", async () => {
                jest.resetModules();
                jest.doMock("../../config/envConfig", () => ({
                    isDev: true,
                    enforceHttps: false,
                    isHttpForDev: jest.fn(),
                    AUTH_SECRET: "test_secret",
                }));

                // NOTE: added settings of getClientIp mock
                jest.doMock("../utils", () => ({
                    getClientIp: jest.fn(() => "127.0.0.1"),
                }));

                const { authenticateMiddleware: devMiddleware } = await import(
                    "../authenticate"
                );
                const consoleSpy = jest
                    .spyOn(console, "log")
                    .mockImplementation();

                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockRejectedValue(new Error("Invalid token"));

                const res = await devMiddleware(req);
                expect(consoleSpy).toHaveBeenCalledWith(
                    "[authenticateMiddleware] client IP =",
                    "127.0.0.1" // undefined ではなく具体的な IP アドレスを期待
                );
                expect(res?.status).toBe(307);

                consoleSpy.mockRestore();
            });
        });

        describe("Error Recovery Cases", () => {
            test("should handle multiple consecutive errors", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken
                    .mockRejectedValueOnce(new Error("First error"))
                    .mockRejectedValueOnce(new Error("Second error"))
                    .mockResolvedValueOnce({
                        sub: "user123",
                        role: "admin",
                    } as JWT);

                // First attempt
                let res = await authenticateMiddleware(req);
                expect(res?.status).toBe(307);

                // Second attempt
                res = await authenticateMiddleware(req);
                expect(res?.status).toBe(307);

                // Third attempt - should succeed
                res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-id")).toBe("user123");
            });

            test("should handle recovery from header manipulation errors", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                let headerSetError = true;

                const mockHeaders = new Headers();
                Object.defineProperty(mockHeaders, "set", {
                    value: () => {
                        if (headerSetError) {
                            headerSetError = false;
                            throw new Error("Headers manipulation error");
                        }
                    },
                });
                Object.defineProperty(req, "headers", {
                    value: mockHeaders,
                    writable: true,
                });

                mockedGetToken.mockResolvedValue({
                    sub: "user123",
                    role: "admin",
                } as JWT);

                // First attempt - should fail due to header manipulation error
                let res = await authenticateMiddleware(req);
                expect(res?.status).toBe(307);

                // Second attempt - should succeed
                res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
            });
        });

        describe("Security Edge Cases", () => {
            test("should handle token with suspicious payload", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                mockedGetToken.mockResolvedValue({
                    sub: "user123; DROP TABLE users;",
                    role: "<script>alert('xss')</script>",
                } as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-id")).toBe(
                    "user123; DROP TABLE users;"
                );
                expect(req.headers.get("x-user-role")).toBe(
                    "<script>alert('xss')</script>"
                );
            });

            test("should handle extremely long token values", async () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                const longString = "a".repeat(10000);
                mockedGetToken.mockResolvedValue({
                    sub: longString,
                    role: longString,
                } as JWT);

                const res = await authenticateMiddleware(req);
                expect(res).toBeInstanceOf(NextResponse);
                expect(req.headers.get("x-user-id")).toBe(longString);
                expect(req.headers.get("x-user-role")).toBe(longString);
            });
        });
    });

    /**
     * performance tests for authenticateMiddleware
     *
     * this test suite focuses on:
     * - concurrent request handling
     * - memory efficiency
     * - response time under load
     * - header manipulation performance
     * - token validation under stress
     */
    describe("Performance and Load Testing Cases", () => {
        // Check memory usage before and after each performance test
        let initialMemoryUsage: NodeJS.MemoryUsage;

        beforeEach(() => {
            initialMemoryUsage = process.memoryUsage();
        });

        test("should handle high volume of concurrent requests efficiently", async () => {
            const numberOfRequests = 1000;
            const startTime = process.hrtime();

            const requests = Array.from({ length: numberOfRequests }, () =>
                createMockRequest("https://example.com/api/protected")
            );

            mockedGetToken.mockResolvedValue({
                sub: "user123",
                role: "admin",
            } as JWT);

            const results = await Promise.all(
                requests.map((req) => authenticateMiddleware(req))
            );

            const [seconds, nanoseconds] = process.hrtime(startTime);
            const totalTimeMs = seconds * 1000 + nanoseconds / 1000000;

            // Verify each request was processed successfully
            results.forEach((res) => {
                expect(res).toBeInstanceOf(NextResponse);
            });

            // Verify average processing time is within acceptable range
            const averageTimePerRequest = totalTimeMs / numberOfRequests;
            expect(averageTimePerRequest).toBeLessThan(1); // Expect less than 1ms
        });

        test("should handle memory efficiently with large payloads", async () => {
            const numberOfRequests = 100;
            const largePayload = {
                sub: "user123",
                role: "admin",
                ...Array.from({ length: 1000 }, (_, i) => ({
                    // Add 1KB of data to each field
                    [`key${i}`]: "a".repeat(1000),
                })),
            };

            mockedGetToken.mockResolvedValue(largePayload as unknown as JWT);

            const requests = Array.from({ length: numberOfRequests }, () =>
                createMockRequest("https://example.com/api/protected")
            );

            const beforeMemory = process.memoryUsage();

            await Promise.all(
                requests.map((req) => authenticateMiddleware(req))
            );

            const afterMemory = process.memoryUsage();

            // Verify memory increase is within acceptable limits
            const heapUsedDiff = afterMemory.heapUsed - beforeMemory.heapUsed;
            expect(heapUsedDiff).toBeLessThan(50 * 1024 * 1024); // expect less than 50MB increase
        });

        test("should maintain performance with multiple header manipulations", async () => {
            const numberOfRequests = 100;
            const startTime = process.hrtime();

            const requests = Array.from({ length: numberOfRequests }, () => {
                const req = createMockRequest(
                    "https://example.com/api/protected"
                );
                // Add multiple custom headers
                Array.from({ length: 50 }, (_, i) => {
                    req.headers.set(`custom-header-${i}`, `value-${i}`);
                });
                return req;
            });

            mockedGetToken.mockResolvedValue({
                sub: "user123",
                role: "admin",
            } as JWT);

            await Promise.all(
                requests.map((req) => authenticateMiddleware(req))
            );

            const [seconds, nanoseconds] = process.hrtime(startTime);
            const totalTimeMs = seconds * 1000 + nanoseconds / 1000000;
            const averageTimePerRequest = totalTimeMs / numberOfRequests;

            expect(averageTimePerRequest).toBeLessThan(2); // 2ms以下を期待
        });

        test("should handle rapid sequential requests", async () => {
            const numberOfSequences = 10;
            const requestsPerSequence = 10;
            const results: NextResponse[] = []; // Array to store the results

            mockedGetToken.mockResolvedValue({
                sub: "user123",
                role: "admin",
            } as JWT);

            const startTime = process.hrtime(); // Record the start time of the process

            for (let i = 0; i < numberOfSequences; i++) {
                const sequenceResults = await Promise.all(
                    Array.from({ length: requestsPerSequence }, async () => {
                        const req = createMockRequest(
                            "https://example.com/api/protected"
                        );
                        const result = await authenticateMiddleware(req);
                        if (result) {
                            return result; // Return non-`undefined` results
                        }
                        // If `undefined`, return a default value (modify as necessary)
                        return NextResponse.redirect(
                            new URL("/signIn", req.url)
                        );
                    })
                );

                results.push(...sequenceResults); // Aggregate the results

                // Simulate real usage patterns by adding a short wait time
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            const [seconds, nanoseconds] = process.hrtime(startTime);
            const totalTimeMs = seconds * 1000 + nanoseconds / 1000000; // Calculate the processing time in milliseconds

            // Verify that the number of results matches the expected value
            expect(results.length).toBe(
                numberOfSequences * requestsPerSequence
            );

            // Expect the total processing time to be less than 1 second
            expect(totalTimeMs).toBeLessThan(1000);
        });

        test("should handle token validation under load", async () => {
            const numberOfRequests = 100;
            const validTokenRatio = 0.7; // >> 70% of tokens are valid

            const requests = Array.from(
                { length: numberOfRequests },
                (_, index) => {
                    const req = createMockRequest(
                        "https://example.com/api/protected"
                    );
                    // Set valid/invalid tokens based on index
                    mockedGetToken.mockImplementationOnce(async () => {
                        if (index / numberOfRequests < validTokenRatio) {
                            return {
                                sub: "user123",
                                role: "admin",
                            } as JWT;
                        }
                        return null;
                    });
                    return req;
                }
            );

            const startTime = process.hrtime();
            const results = await Promise.all(
                requests.map((req) => authenticateMiddleware(req))
            );
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const totalTimeMs = seconds * 1000 + nanoseconds / 1000000;

            // Verify a result
            const validResponses = results.filter(
                (res) =>
                    res instanceof NextResponse && !res.headers.get("location")
            );
            expect(validResponses.length).toBeCloseTo(
                numberOfRequests * validTokenRatio,
                0
            );
            expect(totalTimeMs / numberOfRequests).toBeLessThan(1);
        });

        afterEach(() => {
            const finalMemoryUsage = process.memoryUsage();
            const memoryDiff = {
                heapUsed:
                    finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed,
                heapTotal:
                    finalMemoryUsage.heapTotal - initialMemoryUsage.heapTotal,
                external:
                    finalMemoryUsage.external - initialMemoryUsage.external,
                rss: finalMemoryUsage.rss - initialMemoryUsage.rss,
            };

            // Confirm not existing memory leak
            Object.entries(memoryDiff).forEach(([key, value]) => {
                // Outputs a warning if there is a memory increase of 1 MB or more
                if (value > 1024 * 1024) {
                    console.warn(
                        `Warning: Significant memory increase in ${key}: ${
                            value / (1024 * 1024)
                        }MB`
                    );
                }
            });
        });
    });

    test("should handle requests with missing standard headers", async () => {
        const req = createMockRequest("https://example.com/api/protected", {
            // Missing standard headers like `Host`
        });

        mockedGetToken.mockResolvedValue({
            sub: "user123",
            role: "admin",
        } as JWT);

        const res = await authenticateMiddleware(req);
        expect(res).toBeInstanceOf(NextResponse);
        expect(req.headers.get("x-user-id")).toBe("user123");
        expect(req.headers.get("x-user-role")).toBe("admin");
    });

    test("should handle concurrent requests with different headers", async () => {
        const req1 = createMockRequest("https://example.com/api/protected", {
            "x-custom-header": "value1",
        });
        const req2 = createMockRequest("https://example.com/api/protected", {
            "x-custom-header": "value2",
        });

        mockedGetToken.mockResolvedValueOnce({
            sub: "user123",
            role: "admin",
        } as JWT);
        mockedGetToken.mockResolvedValueOnce({
            sub: "user456",
            role: "user",
        } as JWT);

        const [res1, res2] = await Promise.all([
            authenticateMiddleware(req1),
            authenticateMiddleware(req2),
        ]);

        expect(res1).toBeInstanceOf(NextResponse);
        expect(req1.headers.get("x-user-id")).toBe("user123");
        expect(req1.headers.get("x-user-role")).toBe("admin");

        expect(res2).toBeInstanceOf(NextResponse);
        expect(req2.headers.get("x-user-id")).toBe("user456");
        expect(req2.headers.get("x-user-role")).toBe("user");
    });
});
