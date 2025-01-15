// TODO
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// jest.mock("next/server", () => {
//     const cookiesMock = {
//         set: jest.fn(),
//         delete: jest.fn(),
//         get: jest.fn(),
//         getAll: jest.fn(),
//         has: jest.fn(),
//     };

//     return {
//         NextResponse: {
//             next: jest.fn(() => ({
//                 cookies: cookiesMock, // ✅ 一貫したオブジェクトを使用
//             })),
//             json: jest.fn((body, init) => ({
//                 status: init?.status || 200,
//                 body,
//             })),
//         },
//         __cookiesMock__: cookiesMock, // ✅ テストでアクセス可能にする
//     };
// });

// jest.mock("jsonwebtoken", () => ({
//     sign: jest.fn(() => "mock.jwt.refreshed.token"), // ✅ JWT を返す
//     verify: jest.fn(() => ({
//         sub: "user123",
//         roles: ["user"],
//         exp: Math.floor(Date.now() / 1000) + 100, // 有効期限が近い
//     })), // ✅ デコードされた JWT を返す
// }));
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

/**
 * JWT作成用ユーティリティ。
 * expInSec が正なら "現在時刻 + expInSec" に失効、
 * 負なら期限切れにする。省略なら expなし
 */
function makeToken(payload: Record<string, any>, expInSec?: number): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const exp = expInSec ? nowSec + expInSec : undefined;
    return jwt.sign(
        exp ? { ...payload, exp } : payload,
        process.env.JWT_SECRET!
    );
}
describe("sessionMiddleware - Comprehensive Tests", () => {
    let sessionMiddleware: any; // 実際のミドルウェア
    let cookiesMock: any; // next/serverモックの cookies

    const TEST_SECRET = "test-secret";

    /**
     * もともとの環境変数を保存し、afterAllで戻す
     */
    const REAL_ENV = { ...process.env };

    beforeEach(async () => {
        // 1) モジュールキャッシュリセット
        jest.resetModules();

        // 2) 環境変数をセット
        process.env = {
            ...REAL_ENV,
            JWT_SECRET: TEST_SECRET,
            NODE_ENV: "production", // or "development"/"test"に適宜変更
            USE_HTTP_DEV: "true",
        };

        // 3) cookiesモックを再生成
        cookiesMock = {
            set: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(),
            has: jest.fn(),
        };

        // 4) NextResponse の mockImplementation を再設定
        //    成功時 => { cookies: cookiesMock }
        //    失敗時 => { status: init?.status || 200, body }
        // 例: beforeEach の中など
        const ns = (await import("next/server")) as any;
        const __cookiesMock__ = ns.__cookiesMock__;
        cookiesMock = __cookiesMock__;
        Object.values(cookiesMock).forEach((fn: unknown) => {
            if (typeof fn === "function") {
                (fn as jest.Mock).mockClear();
            }
        });

        // 5) sessionMiddleware を import
        const middlewareModule = await import("../session");
        sessionMiddleware = middlewareModule.sessionMiddleware;

        // 6) mock呼び出し履歴をクリア
        jest.clearAllMocks();
    });

    afterAll(() => {
        // 環境変数を元に戻す
        process.env = REAL_ENV;
    });

    // ------------------------------------------------------------------------------
    // 1) No token => pass-through
    it("should pass through if no JWT token in cookies", () => {
        const req = { cookies: { get: jest.fn(() => undefined) } } as any;
        const result = sessionMiddleware(req);

        // ミドルウェア実装上、トークン無い場合は return undefined;
        expect(result).toBeUndefined();

        // cookiesの操作もない
        expect(cookiesMock.set).not.toHaveBeenCalled();
        expect(cookiesMock.delete).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 2) Valid token(残り時間たっぷり => +7200) => no refresh
    it("should do nothing if JWT is valid and not near expiration", () => {
        // REFRESH_THRESHOLD=1800 => 7200なら全然余裕 => refreshしない
        const validToken = makeToken({ sub: "user123" }, 7200);
        const req = {
            cookies: { get: jest.fn(() => ({ value: validToken })) },
        } as any;

        const response = sessionMiddleware(req);

        // 成功 => { cookies: cookiesMock }, status undefined
        expect(response).toEqual({ cookies: cookiesMock });
        expect(response.status).toBeUndefined();

        // refresh なし => set()呼ばれない
        expect(cookiesMock.set).not.toHaveBeenCalled();
        // delete() もなし
        expect(cookiesMock.delete).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 3) near expiry => refresh
    it("should refresh token if it is near expiration", () => {
        // 1800より小さい => 100秒 => refresh
        const nearExpToken = makeToken({ sub: "user123" }, 100);
        const req = {
            cookies: { get: jest.fn(() => ({ value: nearExpToken })) },
        } as any;

        const response = sessionMiddleware(req);

        // refresh => success => { cookies: cookiesMock }
        expect(response).toEqual({ cookies: cookiesMock });
        expect(cookiesMock.set).toHaveBeenCalledTimes(1);

        // 新しいトークンを verify
        const [[{ value: refreshed }]] = cookiesMock.set.mock.calls;
        const decoded = jwt.verify(refreshed, TEST_SECRET) as jwt.JwtPayload;
        const nowSec = Math.floor(Date.now() / 1000);
        // 3600秒近く先
        expect(decoded.exp).toBeGreaterThan(nowSec + 3000);

        // deleteは呼ばれていない
        expect(cookiesMock.delete).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 4) expired => 401 + cookies.delete
    it("should return 401 if JWT is expired", () => {
        // expが -100 => 期限切れ
        const expiredToken = makeToken({ sub: "user123" }, -100);
        const req = {
            cookies: { get: jest.fn(() => ({ value: expiredToken })) },
        } as any;

        const response = sessionMiddleware(req);
        // => { status:401, body:{error}, ...}
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/expired/i);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        // setは呼ばれない
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 5) invalid structure => 401
    it("should return 401 if decoded token is not an object", () => {
        // verifyが文字列返した場合
        jest.spyOn(jwt, "verify").mockReturnValueOnce("not-an-object" as any);

        const req = {
            cookies: { get: jest.fn(() => ({ value: "fake.token" })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/invalid jwt structure/i);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 6) missing exp => treat as expired => 401
    it("should return 401 if exp is missing", () => {
        // sign({sub}) but no exp => sessionMiddlewareが missing exp => 401
        const tokenNoExp = jwt.sign({ sub: "noexp" }, TEST_SECRET, {
            noTimestamp: true, // これで iat も外す
        });
        const req = {
            cookies: { get: jest.fn(() => ({ value: tokenNoExp })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/expired/i);

        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 7) TokenExpiredError => 401
    it("should catch TokenExpiredError specifically", () => {
        jest.spyOn(jwt, "verify").mockImplementation(() => {
            throw new jwt.TokenExpiredError("jwt expired", new Date());
        });
        const req = {
            cookies: { get: jest.fn(() => ({ value: "any" })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/expired/i);
        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
    });

    // ------------------------------------------------------------------------------
    // 8) NotBeforeError => 401
    it("should catch NotBeforeError specifically", () => {
        jest.spyOn(jwt, "verify").mockImplementation(() => {
            throw new jwt.NotBeforeError("not active", new Date());
        });
        const req = {
            cookies: { get: jest.fn(() => ({ value: "any" })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/not active/i);
        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
    });

    // ------------------------------------------------------------------------------
    // 9) JsonWebTokenError => 401
    it("should catch JsonWebTokenError specifically", () => {
        jest.spyOn(jwt, "verify").mockImplementation(() => {
            throw new jwt.JsonWebTokenError("invalid signature");
        });
        const req = {
            cookies: { get: jest.fn(() => ({ value: "any" })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/invalid jwt token/i);
        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
    });

    // ------------------------------------------------------------------------------
    // 10) Unknown error => 500
    it("should return 500 for unexpected error", () => {
        jest.spyOn(jwt, "verify").mockImplementation(() => {
            throw new Error("Something unknown");
        });
        const req = {
            cookies: { get: jest.fn(() => ({ value: "any" })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
    });

    // ------------------------------------------------------------------------------
    // 11) Refresh token even if sub/roles missing
    it("should refresh token even if sub or roles is missing", () => {
        // near expiry => +100
        const partialToken = makeToken({}, 100);
        const req = {
            cookies: { get: jest.fn(() => ({ value: partialToken })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response).toEqual({ cookies: cookiesMock });
        expect(cookiesMock.set).toHaveBeenCalledTimes(1);

        const [[{ value: newJwt }]] = cookiesMock.set.mock.calls;
        const decoded = jwt.verify(newJwt, TEST_SECRET) as jwt.JwtPayload;
        expect(decoded.sub).toBe("anonymous"); // sessionMiddleware で補完
        expect(decoded.roles).toEqual(["user"]); // sessionMiddleware で補完
    });

    // ------------------------------------------------------------------------------
    // 12) devモード => console.warn / console.error
    it("should log warnings/errors in dev mode when expired", async () => {
        // 一時的に NODE_ENV=development
        Object.defineProperty(process.env, "NODE_ENV", {
            value: "development",
            configurable: true,
        });
        const expired = makeToken({ sub: "devtest" }, -50);

        const req = {
            cookies: { get: jest.fn(() => ({ value: expired })) },
        } as any;
        const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();

        const response = sessionMiddleware(req);

        // => 401
        expect(response.status).toBe(401);
        // => devなら console.warn() が呼ばれるはず
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "[SessionMiddleware] JWT token is expired or missing 'exp' field."
        );

        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    // ------------------------------------------------------------------------------
    // 13) 1000連続 => 有効期限が十分なら refreshなし
    it("should handle 1000 valid requests without issues", () => {
        const bigExpToken = makeToken({ sub: "loadTest" }, 7200);
        const req = { cookies: { get: jest.fn() } } as any;

        for (let i = 0; i < 1000; i++) {
            req.cookies.get.mockReturnValue({ value: bigExpToken });
            const resp = sessionMiddleware(req);
            expect(resp).toEqual({ cookies: cookiesMock });
        }
        // refreshしない => set呼ばれない
        expect(cookiesMock.set).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------------------
    // 14) tampered signature => 401
    it("should return 401 if token signature is tampered", () => {
        const normal = makeToken({ sub: "tamperTest" }, 3600);
        // tamper
        const tampered = normal.replace(/\./g, "_");
        const req = {
            cookies: { get: jest.fn(() => ({ value: tampered })) },
        } as any;

        const response = sessionMiddleware(req);
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/invalid jwt token/i);
        expect(cookiesMock.delete).toHaveBeenCalledWith("jwt");
    });

    // ------------------------------------------------------------------------------
    // 15) near expiry repeatedly => refresh each time
    it("should refresh repeatedly if token is near expiry on each call", () => {
        let token = makeToken({ sub: "loop" }, 100);
        const req = { cookies: { get: jest.fn() } } as any;

        for (let i = 0; i < 5; i++) {
            req.cookies.get.mockReturnValue({ value: token });
            sessionMiddleware(req);
            // 1回呼ぶたびに set() される => その都度 token を更新
            if (cookiesMock.set.mock.calls.length > i) {
                const [[{ value: newToken }]] =
                    cookiesMock.set.mock.calls.slice(-1);
                token = newToken;
            }
        }
        // => 5回 refresh
        expect(cookiesMock.set).toHaveBeenCalledTimes(5);
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
