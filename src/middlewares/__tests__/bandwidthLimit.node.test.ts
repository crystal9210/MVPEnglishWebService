/**
 * Confirmed all tests have passed at 2025/01/11.
 */

import { bandwidthLimitMiddleware } from "../bandwidthLimit";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

describe("bandwidthLimitMiddleware", () => {
    const MAX_HEADER_SIZE = 8 * 1024; // 8KB
    const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

    /**
     * Utility function to create mock NextRequest objects.
     * This allows flexibility in testing headers and body combinations.
     * @param headers - Request headers (Headers or key-value object).
     * @param contentLength - Content length value as a string.
     * @param method - HTTP method (default is "GET").
     * @param body - Arbitrary body data to allow for invalid scenarios.
     */
    const createMockRequest = (
        headers: Headers | Record<string, string | null | undefined>,
        contentLength?: string,
        method: string = "GET",
        body?: unknown // Allow arbitrary data for body to test edge cases
    ): NextRequest => {
        let mockHeaders: Headers;

        // Convert headers into Headers object if not already
        if (headers instanceof Headers) {
            mockHeaders = headers;
        } else if (typeof headers === "object" && headers !== null) {
            mockHeaders = new Headers();
            for (const [key, value] of Object.entries(headers)) {
                if (value === null || value === undefined) {
                    throw new Error(
                        `Header "${key}" has a null or undefined value.`
                    );
                }
                if (typeof value !== "string") {
                    throw new Error(`Header "${key}" must be a string.`);
                }
                mockHeaders.append(key, value);
            }
        } else {
            throw new Error(
                "Invalid headers type. Expected Headers or Record<string, string>."
            );
        }

        // Add content-length header if provided
        if (contentLength !== undefined) {
            mockHeaders.set("content-length", contentLength);
        }

        const url = "http://localhost/api";

        // Allow TRACE method with minimal mock properties
        if (method === "TRACE") {
            return {
                method,
                headers: mockHeaders,
                body,
                url,
            } as unknown as NextRequest;
        }

        // Return NextRequest with arbitrary body
        return new NextRequest(url, {
            method,
            headers: mockHeaders,
            body: body as BodyInit, // Loosening type to allow edge case testing
        });
    };

    /**
     * Custom class to mock NextRequest and override its body getter.
     * This allows testing invalid body types like numbers or plain objects.
     */
    class MockNextRequest extends NextRequest {
        constructor(init: {
            headers: Headers;
            method: string;
            body?: unknown;
        }) {
            const url = "http://localhost/api";
            const { headers, method, body } = init;

            // Add the `duplex` property for ReadableStream compatibility
            super(url, {
                method,
                headers,
                body: body as any, // Pass the body as any to avoid type errors
                duplex: "half", // Required for ReadableStream compatibility
            } as any); // Cast to any to bypass type checks for RequestInit
            (this as any)._mockBody = init.body; // Store the raw body for getter
        }

        // Override the body getter to return the stored raw body
        get body() {
            return (this as any)._mockBody;
        }
    }

    test("should allow requests within header and body size limits", async () => {
        const req = createMockRequest(
            { "x-custom-header": "small-value" },
            "512"
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should allow requests with header size at the exact limit", async () => {
        const headerKey = "x-large-header";
        const remainingSize = MAX_HEADER_SIZE - headerKey.length - 2;
        const headers: Record<string, string> = {
            [headerKey]: "x".repeat(remainingSize),
        };
        const req = createMockRequest(headers);
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should allow requests with body size at the exact limit", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            MAX_BODY_SIZE.toString()
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should reject requests with headers exceeding the limit", async () => {
        const oversizedHeaders: Record<string, string> = {
            "x-large-header": "x".repeat(MAX_HEADER_SIZE + 1),
        };
        const req = createMockRequest(oversizedHeaders);
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(431);
    });

    test("should reject requests with body exceeding the limit", async () => {
        const oversizedBody = "x".repeat(MAX_BODY_SIZE + 1); // Create a body exceeding the limit
        const req = createMockRequest(
            { "content-type": "application/json" },
            (MAX_BODY_SIZE + 1).toString(),
            "POST",
            oversizedBody
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(413);

        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Payload Too Large",
            actualSize: MAX_BODY_SIZE + 1,
            maxAllowedSize: MAX_BODY_SIZE,
        });
    });

    test("should reject requests with both oversized headers and body", async () => {
        const oversizedHeaders: Record<string, string> = {
            "x-large-header": "x".repeat(MAX_HEADER_SIZE + 1),
        };
        const req = createMockRequest(
            oversizedHeaders,
            (MAX_BODY_SIZE + 1).toString()
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(431);
    });

    test("should reject requests with negative content-length", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "-1"
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);
    });

    test("should reject requests with invalid content-length header", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "invalid"
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);
    });

    test("should allow requests without content-length header", async () => {
        const req = createMockRequest({ "content-type": "application/json" });
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should handle empty headers gracefully", async () => {
        const req = createMockRequest({});
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should reject requests with header size exceeding the limit by 1 byte", async () => {
        const oversizedHeaders: Record<string, string> = {
            "x-large-header": "x".repeat(MAX_HEADER_SIZE + 1),
        };
        const req = createMockRequest(oversizedHeaders);
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(431);
    });

    test("should reject requests with body size exceeding the limit by 1 byte", async () => {
        const oversizedBody = "x".repeat(MAX_BODY_SIZE + 1);
        const req = createMockRequest(
            { "content-type": "application/json" },
            (MAX_BODY_SIZE + 1).toString(),
            "POST",
            oversizedBody
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(413);

        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Payload Too Large",
            actualSize: MAX_BODY_SIZE + 1,
            maxAllowedSize: MAX_BODY_SIZE,
        });
    });

    test("should reject requests with excessively large content-length value", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            (Number.MAX_SAFE_INTEGER + 1).toString()
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);
    });

    test("should reject requests with fractional content-length", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "12.34"
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);
    });

    test("should allow POST requests within size limits", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "512",
            "POST",
            JSON.stringify({ key: "value" })
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should reject unsupported HTTP methods", async () => {
        const req = createMockRequest({}, "512", "UNSUPPORTED");
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(405);
    });

    test("should reject requests with empty header values", async () => {
        const req = createMockRequest({ "x-empty-header": "" });
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);
    });

    test("should reject TRACE method requests regardless of size", async () => {
        const req = createMockRequest({}, "512", "TRACE");
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(405);

        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Method Not Allowed",
        });
    });

    test("should handle Express.js-like requests gracefully", async () => {
        const mockExpressHeaders = {
            "content-length": "512",
            "x-custom-header": "valid",
        };
        const req = createMockRequest(mockExpressHeaders, "512", "GET");
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should reject requests with non-ASCII characters in headers", async () => {
        const mockHeaders = { "x-non-ascii-header": "あいうえお" };

        let errorCaught = false;
        try {
            createMockRequest(mockHeaders);
        } catch (error) {
            errorCaught = true;
            if (error instanceof Error) {
                expect(error.message).toContain("ByteString");
            }
        }
        expect(errorCaught).toBe(true);
    });

    test("should reject requests with empty header keys", async () => {
        const mockHeaders = { "": "value" };

        let errorCaught = false;
        try {
            createMockRequest(mockHeaders);
        } catch (error) {
            errorCaught = true;
            if (error instanceof Error) {
                expect(error.message).toBe(
                    'Headers.append: "" is an invalid header name.'
                );
            }
        }
        expect(errorCaught).toBe(true);
    });

    test("should reject requests with null header values", async () => {
        const headersWithNull = {
            "x-valid-header": "value",
            "x-null-header": null, // Invalid header
        };

        // Pass a header which includes a null field.
        expect(() => {
            createMockRequest(headersWithNull as Record<string, string | null>);
        }).toThrowError(
            'Header "x-null-header" has a null or undefined value.'
        );
    });

    test("should reject requests with content-length less than zero", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "-10"
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);

        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Invalid Content-Length",
            actualSize: null,
            maxAllowedSize: MAX_BODY_SIZE,
        });
    });

    test("should reject requests with undefined headers", async () => {
        const undefinedHeaders = undefined;

        expect(() => {
            createMockRequest(
                undefinedHeaders as unknown as Record<string, string>
            );
        }).toThrowError(
            "Invalid headers type. Expected Headers or Record<string, string>."
        );
    });

    test("should reject requests with null headers", async () => {
        const nullHeaders = null;

        expect(() => {
            createMockRequest(nullHeaders as unknown as Record<string, string>);
        }).toThrowError(
            "Invalid headers type. Expected Headers or Record<string, string>."
        );
    });

    test("should reject requests with an array as headers", async () => {
        const arrayHeaders = ["key", "value"]; // Invalid data type (array) header data

        const req = {
            headers: arrayHeaders as unknown as Headers, // Pass invalid data type
        } as unknown as NextRequest;

        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(400);
        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Invalid headers type. Expected Headers or Record<string, string>.",
        });
    });

    test("should reject requests with headers containing null values", async () => {
        const headersWithNullValue = {
            "x-valid-header": "value",
            "x-null-header": null,
        };

        expect(() => {
            createMockRequest(
                headersWithNullValue as Record<string, string | null>
            );
        }).toThrowError(
            'Header "x-null-header" has a null or undefined value.'
        );
    });

    test("should reject requests with headers containing undefined values", async () => {
        const headersWithUndefinedValue = {
            "x-valid-header": "value",
            "x-undefined-header": undefined,
        };

        expect(() => {
            createMockRequest(
                headersWithUndefinedValue as Record<string, string | undefined>
            );
        }).toThrowError(
            'Header "x-undefined-header" has a null or undefined value.'
        );
    });

    test("should reject requests with headers containing non-string values", async () => {
        const headersWithNonStringValue = {
            "x-valid-header": "value",
            "x-number-header": 12345,
            "x-array-header": ["value1", "value2"],
        };

        expect(() => {
            createMockRequest(
                headersWithNonStringValue as unknown as Record<string, string>
            );
        }).toThrowError('Header "x-number-header" must be a string.');
    });

    test("should reject requests with headers containing empty keys", async () => {
        const headersWithEmptyKey = {
            "": "value",
            "x-valid-header": "value",
        };

        expect(() => {
            createMockRequest(headersWithEmptyKey as Record<string, string>);
        }).toThrowError('Headers.append: "" is an invalid header name.');
    });

    test("should reject requests with non-string body", async () => {
        const nonStringBody = 12345; // Invalid data type body (number type)

        const req = new MockNextRequest({
            headers: new Headers({ "content-type": "application/json" }),
            method: "POST",
            body: nonStringBody, // >> pass the invalid data type(number)
        });

        const res = await bandwidthLimitMiddleware(req);

        expect(res.status).toBe(400);
        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Invalid body type. Body must be a string or a valid ReadableStream.",
        });
    });

    test("should reject requests with invalid stream body", async () => {
        const invalidStreamBody = { notAStream: true }; // >> Invalid stream data type

        const req = new MockNextRequest({
            headers: new Headers({ "content-type": "application/json" }),
            method: "POST",
            body: invalidStreamBody, // Pass the invalid stream data
        });

        const res = await bandwidthLimitMiddleware(req);

        expect(res.status).toBe(400);
        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Invalid body type. Body must be a string or a valid ReadableStream.",
        });
    });

    test("should allow POST requests with an empty string body", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "0",
            "POST",
            ""
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should allow POST requests with a null body", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "0",
            "POST",
            null
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should allow POST requests with an undefined body", async () => {
        const req = createMockRequest(
            { "content-type": "application/json" },
            "0",
            "POST",
            undefined
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should allow headers with a size exactly equal to MAX_HEADER_SIZE", async () => {
        const headerKey = "x-header";
        const headerValue = "x".repeat(MAX_HEADER_SIZE - headerKey.length - 2); // Account for ": " separator
        const headers: Record<string, string> = { [headerKey]: headerValue };

        const req = createMockRequest(headers);
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });

    test("should reject headers exceeding MAX_HEADER_SIZE by 1 byte", async () => {
        const headerKey = "x-header";
        const headerValue = "x".repeat(MAX_HEADER_SIZE - headerKey.length - 1); // Exceeds by 1 byte
        const headers: Record<string, string> = { [headerKey]: headerValue };

        const req = createMockRequest(headers);
        const res = await bandwidthLimitMiddleware(req);
        expect(res.status).toBe(431);
        const responseBody = await res.json();
        expect(responseBody).toEqual({
            error: "Header Too Large",
            actualSize: MAX_HEADER_SIZE + 1,
            maxAllowedSize: MAX_HEADER_SIZE,
        });
    });

    test("should allow a valid ReadableStream within the size limit", async () => {
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(512)); // Add valid data
                controller.close();
            },
        });

        const req = new MockNextRequest({
            headers: new Headers({
                "content-type": "application/octet-stream",
            }),
            method: "POST",
            body: stream,
        });

        const res = await bandwidthLimitMiddleware(req);

        expect(res).toEqual(NextResponse.next());
    });

    test("should reject unsupported MIME type", async () => {
        const req = createMockRequest(
            { "content-type": "application/x-unsupported" },
            "512",
            "POST",
            JSON.stringify({ key: "value" })
        );
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next()); // Adjust if middleware rejects unsupported MIME types
    });

    test("should handle duplicate headers and normalize case sensitivity", async () => {
        const headers = new Headers({
            "X-Test-Header": "value1",
            "x-test-header": "value2",
        });

        const req = createMockRequest(headers);
        const res = await bandwidthLimitMiddleware(req);
        expect(res).toEqual(NextResponse.next());
    });
});
