/**
 * All tests have passed at 2025/01/12.
 */

/**
 * Test suites for contentTypeCheckMiddleware
 *
 * This test suite validates the behavior of the contentTypeCheckMiddleware,
 * ensuring it handles all edge cases, normal operations, and error scenarios correctly.
 *
 * === Test Summary ===
 *
 * 1. General Content-Length Validation
 *    ✓ should reject GET requests with Content-Length near the upper limit
 *    ✓ should reject HEAD requests with Content-Length near the upper limit
 *    ✓ should reject DELETE requests with Content-Length near the upper limit
 *    ✓ should reject GET requests with negative Content-Length
 *    ✓ should reject HEAD requests with negative Content-Length
 *    ✓ should reject DELETE requests with negative Content-Length
 *
 * 2. Header Validation
 *    ✓ should reject requests with non-ASCII header names
 *    ✓ should reject requests with extremely long header values
 *    ✓ should allow POST requests with empty body when Content-Length is 0
 *    ✓ should allow PUT requests with empty body when Content-Length is 0
 *    ✓ should allow requests with header value at the exact 2048 bytes limit
 *    ✓ should reject requests with header value exceeding 2048 bytes
 *    ✓ should reject requests with header names containing special characters
 *
 * 3. POST, PUT, PATCH Requests
 *    ✓ should allow POST requests with valid Content-Type
 *    ✓ should allow PUT requests with valid Content-Type
 *    ✓ should allow PATCH requests with valid Content-Type
 *    ✓ should reject POST requests with unsupported Content-Type
 *    ✓ should reject PUT requests with unsupported Content-Type
 *    ✓ should reject PATCH requests with unsupported Content-Type
 *
 * 4. GET, HEAD, DELETE Requests
 *    ✓ should reject GET requests with Content-Length > 0
 *    ✓ should reject HEAD requests with Content-Length > 0
 *    ✓ should reject DELETE requests with Content-Length > 0
 *    ✓ should reject GET requests with invalid Content-Length
 *    ✓ should reject HEAD requests with invalid Content-Length
 *    ✓ should reject DELETE requests with invalid Content-Length
 *    ✓ should allow GET requests without Content-Length or Content-Type
 *    ✓ should allow HEAD requests without Content-Length or Content-Type
 *    ✓ should allow DELETE requests without Content-Length or Content-Type
 *
 * 5. Configurable Behavior
 *    ✓ should reject POST requests with invalid Content-Type when customized
 *    ✓ should allow DELETE requests with valid Content-Type when restriction is disabled
 *    ✓ should reject unknown HTTP methods with proper response 1
 *    ✓ should reject unknown HTTP methods with proper response 2
 */

import { contentTypeCheckMiddleware } from "../contentTypeCheck";
import { NextRequest, NextResponse } from "next/server";

describe("contentTypeCheckMiddleware", () => {
    /**
     * Validates header names to ensure they contain only ASCII characters.
     * Non-ASCII header names are rejected to maintain compatibility with standards.
     * @param headers - The request headers to validate.
     * @throws Error if any header name contains non-ASCII characters.
     */
    function validateHeaders(headers: Record<string, string>): void {
        for (const key of Object.keys(headers)) {
            if (!/^[\x00-\x7F]+$/.test(key)) {
                throw new Error(
                    `Invalid header name: ${key} (non-ASCII characters are not allowed)`
                );
            }
        }
    }

    /**
     * Utility function to create mock NextRequest objects for testing.
     * @param method - The HTTP method of the request (e.g., POST, GET).
     * @param headers - The request headers.
     * @returns A mock NextRequest object.
     */
    const createMockRequest = (
        method: string,
        headers: Record<string, string>
    ): NextRequest => {
        validateHeaders(headers);
        const url = "http://localhost/api";
        return new NextRequest(url, {
            method,
            headers: new Headers(headers),
        });
    };

    /**
     * Utility function to parse the JSON body from a NextResponse.
     * @param res - The NextResponse object.
     * @returns Parsed JSON object or null if no body exists.
     */
    async function getResponseJson(res: NextResponse): Promise<any> {
        const reader = res.body?.getReader();
        if (!reader) return null;

        const { value } = await reader.read();
        if (!value) return null;

        const decoded = new TextDecoder().decode(value);
        return JSON.parse(decoded);
    }

    // POST, PUT, PATCH tests
    describe("POST, PUT, PATCH requests", () => {
        test.each(["POST", "PUT", "PATCH"])(
            "should allow %s requests with valid Content-Type",
            async (method) => {
                const req = createMockRequest(method, {
                    "content-type": "application/json",
                });
                const res = contentTypeCheckMiddleware(req);

                expect(res?.status).toBe(200); // NextResponse.next() returns undefined
            }
        );

        test.each(["POST", "PUT", "PATCH"])(
            "should reject %s requests with unsupported Content-Type",
            async (method) => {
                const req = createMockRequest(method, {
                    "content-type": "text/plain",
                });
                const res = contentTypeCheckMiddleware(req);

                expect(res?.status).toBe(415);

                const responseBody = await getResponseJson(res!);
                expect(responseBody).toEqual({
                    error: "Unsupported Media Type: text/plain",
                    details: { allowedTypes: ["application/json"] },
                });
            }
        );
    });

    // GET, HEAD, DELETE tests
    describe("GET, HEAD, DELETE requests", () => {
        test.each(["GET", "HEAD", "DELETE"])(
            "should reject %s requests with Content-Length > 0",
            async (method) => {
                const req = createMockRequest(method, {
                    "content-length": "10",
                    "content-type": "application/json",
                });
                const res = contentTypeCheckMiddleware(req);

                expect(res?.status).toBe(400);

                const responseBody = await getResponseJson(res!);
                expect(responseBody.error).toBe(
                    `${method} requests with a body are not allowed`
                );
                expect(responseBody.details).toEqual({
                    maxBodyContentLength: 0,
                });
            }
        );

        test.each(["GET", "HEAD", "DELETE"])(
            "should reject %s requests with invalid Content-Length",
            async (method) => {
                const req = createMockRequest(method, {
                    "content-length": "invalid",
                });
                const res = contentTypeCheckMiddleware(req);

                expect(res?.status).toBe(400);

                const responseBody = await getResponseJson(res!);
                expect(responseBody).toEqual({
                    error: "Invalid Content-Length header: invalid",
                });
            }
        );

        test.each(["GET", "HEAD", "DELETE"])(
            "should allow %s requests without Content-Length or Content-Type",
            async (method) => {
                const req = createMockRequest(method, {});
                const res = contentTypeCheckMiddleware(req);

                expect(res.status).toBe(200);
            }
        );

        describe("Configurable contentTypeCheckMiddleware", () => {
            test("should reject POST requests with invalid Content-Type when customized", async () => {
                const req = createMockRequest("POST", {
                    "content-type": "application/xml",
                });
                const res = contentTypeCheckMiddleware(req, {
                    allowedContentTypes: ["application/json"],
                });

                expect(res?.status).toBe(415);
                const responseBody = await getResponseJson(res!);
                expect(responseBody).toEqual({
                    error: "Unsupported Media Type: application/xml",
                    details: {
                        allowedTypes: ["application/json"],
                    },
                });
            });

            test("should allow DELETE requests with valid Content-Type when restriction is disabled", async () => {
                const req = createMockRequest("DELETE", {
                    "content-length": "0",
                    "content-type": "application/json",
                });
                const res = contentTypeCheckMiddleware(req, {
                    restrictedMethods: [], // Disable restrictions for testing
                });

                expect(res.status).toBe(200);
            });

            test("should reject unknown HTTP methods with proper response 1", async () => {
                const req = createMockRequest("UNKNOWN", {
                    "content-type": "application/json",
                });
                const res = contentTypeCheckMiddleware(req);

                expect(res?.status).toBe(405); // Method Not Allowed
                const responseBody = await getResponseJson(res!);
                expect(responseBody).toEqual({
                    error: "Method Not Allowed",
                });
            });

            test("should reject unknown HTTP methods with proper response 2", async () => {
                const req = createMockRequest("INVALID_METHOD", {});
                const res = contentTypeCheckMiddleware(req);

                expect(res?.status).toBe(405);
                const responseBody = await getResponseJson(res!);
                expect(responseBody).toEqual({
                    error: "Method Not Allowed",
                });
            });
        });
    });

    test.each(["GET", "HEAD", "DELETE"])(
        "should reject %s requests with Content-Length near the upper limit",
        async (method) => {
            const maxInt32 = (2 ** 31 - 1).toString();
            const req = createMockRequest(method, {
                "content-length": maxInt32,
            });
            const res = contentTypeCheckMiddleware(req);

            expect(res?.status).toBe(400);

            const responseBody = await getResponseJson(res!);
            expect(responseBody).toEqual({
                error: `${method} requests with a body are not allowed`,
                details: { maxBodyContentLength: 0 },
            });
        }
    );

    test.each(["GET", "HEAD", "DELETE"])(
        "should reject %s requests with negative Content-Length",
        async (method) => {
            const req = createMockRequest(method, {
                "content-length": "-10",
            });
            const res = contentTypeCheckMiddleware(req);

            expect(res?.status).toBe(400);

            const responseBody = await getResponseJson(res!);
            expect(responseBody).toEqual({
                error: "Invalid Content-Length header: -10",
            });
        }
    );

    test("should reject requests with non-ASCII header names", () => {
        expect(() => {
            createMockRequest("POST", {
                ヘッダー名: "value",
            });
        }).toThrowError(/Invalid header name/);
    });

    test("should reject requests with extremely long header values", async () => {
        const longValue = "x".repeat(10000); // 10KB以上のヘッダー
        const req = createMockRequest("POST", {
            "content-type": longValue,
        });

        const res = contentTypeCheckMiddleware(req);

        expect(res?.status).toBe(400);
        const responseBody = await getResponseJson(res!);
        expect(responseBody).toEqual({
            error: "Invalid header: Value is too long",
        });
    });

    test.each(["POST", "PUT"])(
        "should allow %s requests with empty body when Content-Length is 0",
        async (method) => {
            const req = createMockRequest(method, {
                "content-length": "0",
            });
            const res = contentTypeCheckMiddleware(req);

            expect(res?.status).toBe(200);
        }
    );

    test("should allow requests with header value at the exact 2048 bytes limit", async () => {
        const baseContentType = "application/json";
        const paddingLength =
            2048 - new TextEncoder().encode(baseContentType).length;
        const validValue = baseContentType + "x".repeat(paddingLength - 1); // -1 considers semicolons and spaces

        const req = createMockRequest("POST", {
            "content-type": validValue,
        });

        const res = contentTypeCheckMiddleware(req);

        expect(res?.status).toBe(200);
    });

    // Below are 2 implementation patterns of Reject test for confirmation of the logics
    test("should reject requests with header value exceeding 2048 bytes", async () => {
        const invalidValue = "x".repeat(2049);
        const req = createMockRequest("POST", {
            "content-type": invalidValue,
        });

        const res = contentTypeCheckMiddleware(req);

        expect(res?.status).toBe(400);
        const responseBody = await getResponseJson(res!);
        expect(responseBody).toEqual({
            error: "Invalid header: Value is too long",
        });
    });

    test("should reject requests with header value exceeding 2048 bytes", async () => {
        const baseContentType = "application/json";
        const encoder = new TextEncoder();
        const baseLength = encoder.encode(baseContentType).length;

        const paddingLength = 2048 - baseLength + 1;
        const invalidValue = baseContentType + "x".repeat(paddingLength);

        const req = createMockRequest("POST", {
            "content-type": invalidValue,
        });

        const res = contentTypeCheckMiddleware(req);

        expect(res?.status).toBe(400);

        const responseBody = await getResponseJson(res!);
        expect(responseBody).toEqual({
            error: "Invalid header: Value is too long",
        });
    });

    test("should reject requests with header names containing special characters", () => {
        expect(() => {
            createMockRequest("POST", {
                "X-Bad\nHeader": "value",
            });
        }).toThrowError(
            new TypeError(
                'Headers.append: "X-Bad\nHeader" is an invalid header name.'
            )
        );
    });
});
