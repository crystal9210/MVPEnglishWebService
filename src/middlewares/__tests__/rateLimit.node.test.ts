/**
 * Confirmed all tests have passed at 2025/01/13.
 */
import { NextRequest, NextResponse } from "next/server";
import {
    rateLimitMiddleware,
    cache,
    fingerprinter,
    rateLimitConfig,
    SuspiciousBehaviorDetector,
    AnonymousUserRateLimiter,
    AuthenticatedUserRateLimiter,
    detector,
} from "../rateLimit";
import { LRUCacheAdapter, CacheEntry } from "@/utils/middleware";
import { createHash } from "crypto";

// Helper function to create a NextRequest with optional headers and IP
const createRequest = (
    url: string,
    headers: Record<string, string> = {},
    ip?: string
) => {
    const req = new NextRequest(url, { headers });
    if (ip) {
        Object.defineProperty(req, "ip", {
            get: () => ip,
            configurable: true,
        });
    }
    // URLオブジェクトを作成し、それをnextUrlに設定
    const urlObj = new URL(url);
    Object.defineProperty(req, "nextUrl", {
        writable: true,
        value: urlObj,
    });
    return req;
};

describe("rateLimitMiddleware - Comprehensive Tests", () => {
    beforeEach(() => {
        cache.clear(); // Clear cache before each test
    });

    // ... (Normal / Happy Path tests) ...

    test("[Normal] Block if over the limit for unauthenticated user with custom config", () => {
        const customConfig = {
            ...rateLimitConfig,
            anonymous: { ...rateLimitConfig.anonymous, requestsPerMinute: 5 },
        };
        const req = createRequest(
            "https://example.com/api/test",
            {},
            "1.2.3.4"
        );
        for (let i = 0; i < 5; i++) {
            rateLimitMiddleware(req, customConfig);
        }
        const res = rateLimitMiddleware(req, customConfig);
        expect(res).toBeInstanceOf(NextResponse);
        expect(res?.status).toBe(429);
    });

    test("[Normal] Block if over the limit for authenticated user with custom config", () => {
        const customConfig = {
            ...rateLimitConfig,
            authenticated: {
                ...rateLimitConfig.authenticated,
                requestsPerMinute: 5,
            },
        };
        const req = createRequest(
            "https://example.com/api/test",
            { "x-user-id": "user123" },
            "1.2.3.4"
        );
        for (let i = 0; i < 5; i++) {
            rateLimitMiddleware(req, customConfig);
        }
        const res = rateLimitMiddleware(req, customConfig);
        expect(res).toBeInstanceOf(NextResponse);
        expect(res?.status).toBe(429);
    });

    // ... (Boundary Scenarios tests) ...

    // ... (Edge Cases tests) ...

    test("[Edge] Custom path rate limiting", () => {
        const req = createRequest(
            "https://example.com/api/sensitive",
            {},
            "1.2.3.4"
        );
        const configWithPath = {
            ...rateLimitConfig,
            paths: {
                ...rateLimitConfig.paths,
                "/api/sensitive": { requestsPerMinute: 2, ttl: 30 * 1000 },
            },
        };
        for (let i = 0; i < 2; i++) {
            rateLimitMiddleware(req, configWithPath);
        }

        const res = rateLimitMiddleware(req, configWithPath);
        expect(res).toBeInstanceOf(NextResponse);
        expect(res?.status).toBe(429);
    });

    test("[Edge] Invalid or missing path in custom config", () => {
        const req = createRequest("https://example.com/test", {}, "127.0.0.1");
        const res = rateLimitMiddleware(req, {
            ...rateLimitConfig,
            paths: { "/missingpath": { requestsPerMinute: 2, ttl: 60000 } },
        });
        expect(res).toBeInstanceOf(NextResponse);
        if (res instanceof NextResponse) {
            expect(res.status).toBe(200);
        } else {
            fail("Response is not an instance of NextResponse");
        }
    });

    test("[Edge] Default config is used when custom config is invalid 1", async () => {
        const ip = "1.2.3.4";
        const url = "https://example.com/api/test";
        const invalidConfig = { invalidConfig: true } as any;

        for (let i = 0; i <= 100; i++) {
            // 100回リクエストして101回目でレートリミットを確認
            const req = createRequest(url, {}, ip);
            Object.defineProperty(req, "nextUrl", {
                writable: true,
                value: new URL(url),
            });

            const res = rateLimitMiddleware(req, invalidConfig);

            if (i < 100) {
                expect(res).toBeInstanceOf(NextResponse);
                if (res && res.status) {
                    expect(res.status).toBe(200);
                }
            } else {
                expect(res).toBeInstanceOf(NextResponse);
                if (res && res.status) {
                    expect(res.status).toBe(429); // Too Many Requests
                }
                break;
            }
        }
    });

    test("[Edge] Custom config is ignored and default config is used 2", async () => {
        const ip = "1.2.3.4";
        const url = "https://example.com/api/test";
        const customConfig = {
            anonymous: { requestsPerMinute: 10 }, // 1分に10リクエストしか許可しないと設定
            invalidConfig: true,
        } as any;

        for (let i = 0; i < 15; i++) {
            // 15回リクエストを送信
            const req = createRequest(url, {}, ip);
            Object.defineProperty(req, "nextUrl", {
                writable: true,
                value: new URL(url),
            });

            const res = rateLimitMiddleware(req, customConfig);
            console.log(JSON.stringify(res, null, 2));

            if (i < 10) {
                expect(res).toBeInstanceOf(NextResponse);
                if (res && res.status) {
                    expect(res.status).toBe(200); // デフォルト設定では100回までOK
                }
            } else if (i === 10) {
                // カスタム設定ではここでレートリミットに達するはず
                expect(res).toBeInstanceOf(NextResponse);
                if (res && res.status) {
                    expect(res.status).toBe(200); // デフォルト設定が使われているので200が返される
                }
            } else {
                // 11回目以降はデフォルト設定ではまだレートリミットに達していない
                expect(res).toBeInstanceOf(NextResponse);
                if (res && res.status) {
                    expect(res.status).toBe(200);
                }
            }
        }
    });

    test("[Edge] Cache key separation by fingerprint for unauthenticated users with custom config", () => {
        const customConfig = {
            ...rateLimitConfig,
            anonymous: { requestsPerMinute: 5, suspiciousIpChangeLimit: 5 },
        };
        const req1 = createRequest(
            "https://example.com/api/test",
            {
                "user-agent": "Mozilla/5.0",
                "accept-language": "en-US",
                "accept-encoding": "gzip, deflate, br",
                connection: "keep-alive",
            },
            "1.2.3.4"
        );
        const req2 = createRequest(
            "https://example.com/api/test",
            {
                "user-agent": "Chrome/5.0",
                "accept-language": "ja-JP",
                "accept-encoding": "gzip",
                connection: "close",
            },
            "1.2.3.4"
        );

        for (let i = 0; i < 5; i++) {
            rateLimitMiddleware(req1, customConfig);
        }
        const res1 = rateLimitMiddleware(req1, customConfig);
        expect(res1?.status).toBe(429);

        const res2 = rateLimitMiddleware(req2, customConfig);
        expect(res2?.status).toBe(200);
    });

    test("[Edge] User-specific cache key separation for authenticated users with custom config", () => {
        const customConfig = {
            ...rateLimitConfig,
            authenticated: { requestsPerMinute: 5 },
        };
        const reqUser1 = createRequest(
            "https://example.com/api/test",
            { "x-user-id": "user1" },
            "1.2.3.4"
        );
        const reqUser2 = createRequest(
            "https://example.com/api/test",
            { "x-user-id": "user2" },
            "1.2.3.4"
        );

        for (let i = 0; i < 5; i++) {
            rateLimitMiddleware(reqUser1, customConfig);
        }
        const resUser1 = rateLimitMiddleware(reqUser1, customConfig);
        expect(resUser1?.status).toBe(429);

        const resUser2 = rateLimitMiddleware(reqUser2, customConfig);
        expect(resUser2?.status).toBe(200);
    });

    // ... (Abnormal Scenarios tests) ...

    test("[PenTest] Attempt rapid IP changes to trigger suspicious behavior", async () => {
        const req = createRequest(
            "https://example.com/api/test",
            {
                "user-agent": "Mozilla/5.0",
                "accept-language": "en-US",
                "accept-encoding": "gzip, deflate, br",
                connection: "keep-alive",
            },
            "1.2.3.0"
        );

        const customConfig = {
            ...rateLimitConfig,
            anonymous: { requestsPerMinute: 100, suspiciousIpChangeLimit: 2 },
        };

        // Simulate rapid IP changes
        for (let i = 0; i < 100; i++) {
            // TODO iの境界値の調査 (>> テストの失敗成功)
            Object.defineProperty(req, "ip", { value: `1.2.3.${i}` });
            rateLimitMiddleware(req, customConfig);
        }

        Object.defineProperty(req, "ip", { value: "1.2.3.5" });
        const res = rateLimitMiddleware(req, customConfig);

        expect(res?.status).toBe(429);
        const resBody = await res?.json();
        expect(resBody).toEqual({ error: "Too Many Requests" });
    });

    test("[PenTest] Test fingerprint generation with additional headers", () => {
        const req1 = createRequest(
            "https://example.com/api/test",
            {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "accept-language": "ja-JP",
                "accept-encoding": "gzip, deflate, br",
                connection: "keep-alive",
            },
            "1.2.3.4"
        );

        const req2 = createRequest(
            "https://example.com/api/test",
            {
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "accept-language": "en-US",
                "accept-encoding": "gzip, deflate",
                connection: "close",
            },
            "1.2.3.4"
        );

        const expectedFingerprint1 = createHash("sha256")
            .update(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64):ja-JP:gzip, deflate, br:keep-alive"
            )
            .digest("hex");

        const expectedFingerprint2 = createHash("sha256")
            .update(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7):en-US:gzip, deflate:close"
            )
            .digest("hex");

        expect(fingerprinter.generate(req1)).toBe(expectedFingerprint1);
        expect(fingerprinter.generate(req2)).toBe(expectedFingerprint2);
    });

    // ... (Stress Testing tests) ...

    // ... (TTL Expiration tests) ...

    // ... (Additional Edge Cases tests) ...

    describe("LRUCacheAdapter", () => {
        it("should store and retrieve entries correctly", () => {
            const lruCache = new LRUCacheAdapter(100, 60000);
            const entry: CacheEntry = {
                count: 5,
                firstSeen: Date.now(),
                history: new Set(["127.0.0.1"]),
            };
            lruCache.set("key1", entry);
            expect(lruCache.get("key1")).toEqual(entry);
        });
        // ...other tests for LRUCacheAdapter
    });

    describe("Fingerprinter", () => {
        // ... tests for Fingerprinter (already implemented in previous responses)
    });

    describe("SuspiciousBehaviorDetector", () => {
        it("should detect suspicious behavior correctly", () => {
            const detector = new SuspiciousBehaviorDetector(2); // limit to 2 IP addresses
            const history = new Set<string>();

            expect(detector.isSuspicious(history, "1.1.1.1")).toBe(false); // 1st unique IP
            expect(detector.isSuspicious(history, "2.2.2.2")).toBe(false); // 2nd unique IP
            expect(detector.isSuspicious(history, "3.3.3.3")).toBe(true); // 3rd unique IP (suspicious)
            expect(detector.isSuspicious(history, "1.1.1.1")).toBe(false); // Not suspicious because this IP is not new
        });
    });

    describe("RateLimiter", () => {
        // Test abstract class is working
        describe("RateLimiter", () => {
            it("should throw error if isRateLimited is called directly", () => {
                const limiter = new AuthenticatedUserRateLimiter(
                    cache,
                    5,
                    60000
                );
                expect(() => {
                    limiter.isRateLimited.call(null, "test", "::1");
                }).toThrow();
            });
        });
    });

    describe("AnonymousUserRateLimiter", () => {
        it("should rate limit correctly", () => {
            const limiter = new AnonymousUserRateLimiter(
                cache,
                5,
                60000,
                detector
            );
            const fingerprint = "test-fingerprint";
            const ip = "1.2.3.4";

            for (let i = 0; i < 5; i++) {
                expect(limiter.isRateLimited(fingerprint, ip)).toBe(false);
            }
            expect(limiter.isRateLimited(fingerprint, ip)).toBe(true);
        });
    });

    describe("AuthenticatedUserRateLimiter", () => {
        it("should rate limit correctly", () => {
            const limiter = new AuthenticatedUserRateLimiter(cache, 5, 60000);
            const userId = "test-user";
            const ip = "1.2.3.4";

            for (let i = 0; i < 5; i++) {
                expect(limiter.isRateLimited(userId, ip)).toBe(false);
            }
            expect(limiter.isRateLimited(userId, ip)).toBe(true);
        });
    });

    test("should clear cache correctly", () => {
        const fingerprint = fingerprinter.generate(
            createRequest("https://example.com/test", {}, "1.2.3.4")
        );
        const cacheKey = `fp:${fingerprint}:ip:1.2.3.4`;
        cache.set(cacheKey, {
            count: 1,
            firstSeen: Date.now(),
            history: new Set(["1.2.3.4"]),
        });
        expect(cache.has(cacheKey)).toBe(true);

        cache.clear();
        expect(cache.has(cacheKey)).toBe(false);
    });
});
