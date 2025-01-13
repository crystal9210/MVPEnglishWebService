import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

jest.mock("next/server", () => {
    const cookiesMock = {
        set: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
        getAll: jest.fn(),
        has: jest.fn(),
    };

    return {
        NextResponse: {
            next: jest.fn(() => ({
                cookies: cookiesMock, // ✅ 一貫したオブジェクトを使用
            })),
            json: jest.fn((body, init) => ({
                status: init?.status || 200,
                body,
            })),
        },
        __cookiesMock__: cookiesMock, // ✅ テストでアクセス可能にする
    };
});

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "mock.jwt.refreshed.token"), // ✅ JWT を返す
    verify: jest.fn(() => ({
        sub: "user123",
        roles: ["user"],
        exp: Math.floor(Date.now() / 1000) + 100, // 有効期限が近い
    })), // ✅ デコードされた JWT を返す
}));
// describe("test", () => {
//     const originalEnv = process.env;

//     beforeEach(() => {
//         jest.resetModules();
//         process.env = { ...originalEnv };
//         Object.defineProperty(process.env, "NODE_ENV", {
//             value: "production", // 本番環境を模倣
//             writable: true,
//         });
//         process.env.JWT_SECRET = "static-production-secret"; // JWT_SECRET の設定
//         jest.clearAllMocks();
//     });

//     afterEach(() => {
//         process.env = originalEnv;
//     });

//     it("should use STATIC_JWT_SECRET in production environment", async () => {
//         // モジュールを再インポート
//         const { sessionMiddleware } = await import("@/middlewares/session");

//         const mockToken = "mock.jwt.token";
//         const mockDecodedToken = {
//             sub: "user123",
//             roles: ["user"],
//             exp: Math.floor(Date.now() / 1000) + 100, // Near expiration
//         };

//         (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
//         } as any;

//         const response = sessionMiddleware(req);

//         expect(jwt.verify).toHaveBeenCalledWith(
//             mockToken,
//             "static-production-secret"
//         );
//         expect(response).toBeDefined();
//     });
// });

describe("sessionMiddleware", () => {
    const JWT_SECRET = "test-secret";

    let sessionMiddleware: any;
    let cookiesMock: any;
    const JWT_EXPIRES_IN = 3600; // 1時間
    const REFRESH_THRESHOLD = JWT_EXPIRES_IN / 2;

    beforeEach(async () => {
        jest.resetModules(); // Reset module registry to allow re-importing modules
        cookiesMock = {
            set: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(),
            has: jest.fn(),
        };

        // Set the environment variable before importing the middleware
        process.env.JWT_SECRET = JWT_SECRET;

        // Dynamically import the middleware to ensure it picks up the updated env variable
        const middlewareModule = await import("../session");
        sessionMiddleware = middlewareModule.sessionMiddleware;

        jest.spyOn(NextResponse, "next").mockReturnValue({
            cookies: cookiesMock,
        } as unknown as NextResponse);

        jest.spyOn(NextResponse, "json").mockImplementation(
            (body, init) =>
                ({
                    status: init?.status || 200,
                    body,
                } as any)
        );
    });

    afterEach(() => {
        delete process.env.JWT_SECRET; // Clean up the environment variable
    });

    it("should proceed without a JWT token", () => {
        const req = {
            cookies: { get: jest.fn().mockReturnValue(undefined) },
        } as any;

        const response = sessionMiddleware(req);

        expect(req.cookies.get).toHaveBeenCalledWith("jwt");
        expect(response).toBeUndefined(); // トークンがない場合は無修正で進む
    });

    it("should delete JWT token if expired", () => {
        const mockToken = "mock.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) - 100, // 有効期限切れ
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const req = {
            cookies: {
                get: jest.fn(() => ({ value: mockToken })),
            },
        } as unknown as NextRequest;

        const response = sessionMiddleware(req);

        expect(jwt.verify).toHaveBeenCalledWith(mockToken, JWT_SECRET);
        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt"); // ✅ クッキーが削除される
    });

    it("should refresh JWT token if nearing expiration", () => {
        const mockToken = "mock.jwt.token";
        const mockRefreshedToken = "mock.jwt.refreshed.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 100, // 有効期限が近い
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
        (jwt.sign as jest.Mock).mockReturnValue(mockRefreshedToken);

        const req = {
            cookies: {
                get: jest.fn(() => ({ value: mockToken })), // 修正: { value: mockToken } を返す
            },
        } as unknown as NextRequest;

        // スパイを追加
        const getSpy = jest.spyOn(req.cookies, "get");

        const response = sessionMiddleware(req);

        // `cookies.get` が呼び出されたか確認
        expect(getSpy).toHaveBeenCalledWith("jwt"); // 通常は "jwt" という名前でトークンを取得する
        expect(getSpy).toHaveBeenCalledTimes(1);

        // 他のアサーション
        expect(jwt).toHaveBeenCalledWith(mockToken, JWT_SECRET);
        expect(jwt.sign).toHaveBeenCalledWith(
            { sub: "user123", roles: ["user"] },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        expect(response.cookies.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "jwt",
                value: mockRefreshedToken,
                httpOnly: true,
                sameSite: "strict",
            })
        );
    });

    it("should delete expired JWT token", () => {
        const mockToken = "mock.jwt.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            const error = new Error("Token expired");
            error.name = "TokenExpiredError"; // エラー種別を指定
            throw error;
        });

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        const response = sessionMiddleware(req);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        expect(response?.status).toBe(401);
        expect(response?.body).toEqual({
            error: "Unauthorized: JWT token has expired",
        });
    });

    it("should handle invalid JWT token", () => {
        const mockToken = "invalid.jwt.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            const error = new Error("Invalid token");
            error.name = "JsonWebTokenError"; // モックエラーの種類
            throw error;
        });

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        const response = sessionMiddleware(req);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        expect(response?.status).toBe(401);
        expect(response?.body).toEqual({
            error: "Unauthorized: Invalid JWT token",
        });
    });

    it("should not refresh JWT if sufficient time remains", () => {
        const mockToken = "mock.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 2000, // 十分な有効期限が残っている
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        sessionMiddleware(req);

        expect(jwt.sign).not.toHaveBeenCalled(); // リフレッシュしない
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    it("should handle JWT without 'exp' field", () => {
        const mockToken = "mock.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const req = {
            cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
        } as any;

        sessionMiddleware(req);

        expect(jwt.sign).not.toHaveBeenCalled(); // リフレッシュしない
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    it("should prevent JWT_SECRET from being overwritten during runtime", async () => {
        const initialModule = await import("../session");
        const sessionMiddleware = initialModule.sessionMiddleware;

        // モジュール初期化後に JWT_SECRET を変更
        process.env.JWT_SECRET = "malicious-key";

        const mockToken = "mock.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 100,
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: mockToken }),
            },
        } as any;

        sessionMiddleware(req);

        // JWT_SECRET の値が初期化時の値を使用しているかを確認
        expect(jwt.verify).toHaveBeenCalledWith(mockToken, JWT_SECRET);
    });

    it("should not modify response if a valid JWT is provided", () => {
        const mockToken = "valid.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 1000, // 十分な有効期限
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: mockToken }),
            },
        } as any;

        const response = sessionMiddleware(req);

        // レスポンスが変更されていないことを確認
        expect(response?.status).toBeUndefined();
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    // 3. 異常系の追加テスト - InvalidSignatureError
    it("should handle token with invalid signature", () => {
        const mockToken = "invalid.signature.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            const error = new Error("Invalid signature");
            error.name = "JsonWebTokenError";
            throw error;
        });

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: mockToken }),
            },
        } as any;

        const response = sessionMiddleware(req);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        expect(response?.status).toBe(401);
        expect(response?.body).toEqual({
            error: "Unauthorized: Invalid JWT token",
        });
    });

    // 3. 異常系の追加テスト - IncompleteTokenError
    it("should handle incomplete JWT token", () => {
        const mockToken = "incomplete.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            const error = new Error("Token is incomplete");
            error.name = "JsonWebTokenError";
            throw error;
        });

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: mockToken }),
            },
        } as any;

        const response = sessionMiddleware(req);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        expect(response?.status).toBe(401);
        expect(response?.body).toEqual({
            error: "Unauthorized: Invalid JWT token",
        });
    });

    // 4. 負荷テスト（擬似）
    it("should handle multiple valid requests without errors", () => {
        const mockToken = "valid.jwt.token";
        const mockDecodedToken = {
            sub: "user123",
            roles: ["user"],
            exp: Math.floor(Date.now() / 1000) + 1000, // 十分な有効期限
        };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: mockToken }),
            },
        } as any;

        // 1000 リクエストをシミュレート
        for (let i = 0; i < 1000; i++) {
            const response = sessionMiddleware(req);
            expect(response?.status).toBeUndefined(); // レスポンスが変更されていない
        }

        expect(cookiesMock.set).not.toHaveBeenCalled(); // リフレッシュなし
        expect(jwt.verify).toHaveBeenCalledTimes(1000);
    });

    it("should handle multiple expired tokens gracefully", () => {
        const mockToken = "expired.jwt.token";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            const error = new Error("Token expired");
            error.name = "TokenExpiredError";
            throw error;
        });

        const req = {
            cookies: {
                get: jest.fn().mockReturnValue({ value: mockToken }),
            },
        } as any;

        // 1000 リクエストをシミュレート
        for (let i = 0; i < 1000; i++) {
            const response = sessionMiddleware(req);
            expect(response?.status).toBe(401); // エラーステータスが返される
        }

        expect(cookiesMock.delete).toHaveBeenCalledTimes(1000);
    });
});

// --- Tests for Node.js env logic which is commented out in session.ts ---
// /**
//  * Confirmed all tests have passed at 2025/01/13.
//  */

// // Mock configuration
// jest.mock("next/server", () => ({
//     NextResponse: {
//         next: jest.fn(() => ({
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         })),
//         json: jest.fn(() => ({
//             status: 401,
//             body: { error: "Unauthorized" },
//         })),
//         cookies: {
//             set: jest.fn(),
//             delete: jest.fn(),
//         },
//     },
// }));

// jest.mock("crypto", () => ({
//     randomBytes: jest.fn(),
// }));

// jest.mock("uuid", () => ({
//     v4: jest.fn(),
// }));

// jest.mock("jsonwebtoken", () => ({
//     sign: jest.fn(),
//     verify: jest.fn(),
// }));

// import { sessionMiddleware } from "@/middlewares/session";
// import { NextResponse } from "next/server";
// import { randomBytes } from "crypto";
// import jwt from "jsonwebtoken";

// describe("sessionMiddleware", () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//         (randomBytes as jest.Mock).mockReturnValue(
//             Buffer.from("aabbccddeeff00112233445566778899", "hex")
//         );
//     });

//     it("should set a new sessionId if no sessionId exists", () => {
//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue(undefined) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
//             expect.objectContaining({
//                 name: "sessionId",
//                 value: "aabbccddeeff00112233445566778899",
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV !== "development",
//                 sameSite: "strict",
//                 path: "/",
//                 maxAge: 3600,
//             })
//         );
//     });

//     it("should verify and refresh a JWT nearing expiration", () => {
//         const mockToken = "mock.jwt.token";
//         const mockRefreshedToken = "mock.jwt.refreshed.token";
//         const mockDecodedToken = {
//             sub: "user123",
//             roles: ["user"],
//             exp: Math.floor(Date.now() / 1000) + 100, // Expires in 100 seconds
//         };

//         (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
//         (jwt.sign as jest.Mock).mockReturnValue(mockRefreshedToken);

//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
//             expect.objectContaining({
//                 name: "jwt",
//                 value: mockRefreshedToken,
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV !== "development",
//                 sameSite: "strict",
//                 path: "/",
//             })
//         );
//     });

//     it("should delete an expired JWT", () => {
//         const mockToken = "mock.jwt.token";

//         (jwt.verify as jest.Mock).mockImplementation(() => {
//             throw new Error("Token expired");
//         });

//         const mockNextResponse = {
//             cookies: {
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.delete).toHaveBeenCalledWith("jwt");
//         expect(NextResponse.json).toHaveBeenCalledWith(
//             { error: "Unauthorized" },
//             { status: 401 }
//         );
//     });

//     it("should not modify cookies if both sessionId and valid JWT exist", () => {
//         const mockToken = "mock.jwt.token";
//         const mockDecodedToken = {
//             sub: "user123",
//             roles: ["user"],
//             exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
//         };

//         (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: {
//                 get: jest
//                     .fn()
//                     .mockReturnValueOnce({ value: "existingSessionId" }) // sessionId
//                     .mockReturnValueOnce({ value: mockToken }), // jwt
//             },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.set).not.toHaveBeenCalled();
//     });

//     it("should handle errors gracefully when randomBytes fails", () => {
//         // Arrange
//         (randomBytes as jest.Mock).mockImplementationOnce(() => {
//             throw new Error("randomBytes error");
//         });

//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = { cookies: { get: jest.fn() } } as any;

//         // Act & Assert
//         expect(() => sessionMiddleware(req)).toThrow("randomBytes error");
//     });

//     it("should generate unique session IDs for concurrent requests", () => {
//         // Arrange
//         let counter = 0; // Use a counter to simulate unique IDs
//         (randomBytes as jest.Mock).mockImplementation(() => {
//             counter++;
//             return Buffer.from(`uniqueValue${counter}`, "utf8");
//         });

//         const mockNextResponse1 = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         const mockNextResponse2 = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;

//         jest.spyOn(NextResponse, "next")
//             .mockReturnValueOnce(mockNextResponse1)
//             .mockReturnValueOnce(mockNextResponse2);

//         const req1 = { cookies: { get: jest.fn() } } as any;
//         const req2 = { cookies: { get: jest.fn() } } as any;

//         // Act
//         sessionMiddleware(req1);
//         sessionMiddleware(req2);

//         // Assert
//         expect(mockNextResponse1.cookies.set).toHaveBeenCalled();
//         expect(mockNextResponse2.cookies.set).toHaveBeenCalled();
//         expect(
//             mockNextResponse1.cookies.set.mock.calls[0][0].value
//         ).not.toEqual(mockNextResponse2.cookies.set.mock.calls[0][0].value);
//     });

//     it("should handle session deletion gracefully", () => {
//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: {
//                 get: jest.fn().mockReturnValue({ value: "expiredSessionId" }),
//             },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.delete).toHaveBeenCalledWith("jwt");
//     });

//     it("should handle empty cookies gracefully", () => {
//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue(undefined) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
//             expect.objectContaining({
//                 name: "sessionId",
//             })
//         );
//     });

//     it("should refresh both sessionId and JWT if both are missing", () => {
//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue(undefined) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.set).toHaveBeenCalledTimes(2); //  Set both sessionId and JWT
//         expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
//             expect.objectContaining({ name: "sessionId" })
//         );
//         expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
//             expect.objectContaining({ name: "jwt" })
//         );
//     });

//     it("should set secure=true in production environment", () => {
//         const originalEnv = process.env.NODE_ENV;

//         Object.defineProperty(process.env, "NODE_ENV", {
//             value: "production",
//             configurable: true,
//         });

//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue(undefined) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.set).toHaveBeenCalledWith(
//             expect.objectContaining({ secure: true })
//         );

//         Object.defineProperty(process.env, "NODE_ENV", {
//             value: originalEnv,
//             configurable: true,
//         });
//     });

//     it("should delete an expired JWT", () => {
//         const mockToken = "mock.jwt.token";

//         (jwt.verify as jest.Mock).mockImplementation(() => {
//             throw new Error("Token expired");
//         });

//         const mockNextResponse = {
//             cookies: {
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = {
//             cookies: { get: jest.fn().mockReturnValue({ value: mockToken }) },
//         } as any;

//         sessionMiddleware(req);

//         expect(mockNextResponse.cookies.delete).toHaveBeenCalledWith("jwt");
//         expect(NextResponse.json).toHaveBeenCalledWith(
//             { error: "Unauthorized" },
//             { status: 401 }
//         );
//     });

//     it("should handle errors gracefully when randomBytes fails", () => {
//         (randomBytes as jest.Mock).mockImplementationOnce(() => {
//             throw new Error("randomBytes error");
//         });

//         const mockNextResponse = {
//             cookies: {
//                 set: jest.fn(),
//                 delete: jest.fn(),
//             },
//         } as any;
//         jest.spyOn(NextResponse, "next").mockReturnValue(mockNextResponse);

//         const req = { cookies: { get: jest.fn() } } as any;

//         expect(() => sessionMiddleware(req)).toThrow("randomBytes error");

//         expect(mockNextResponse.cookies.set).not.toHaveBeenCalled();
//     });
// });
