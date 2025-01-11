import { NextResponse, NextRequest } from "next/server";

const MAX_HEADER_SIZE = 8 * 1024; // 8KB limit for headers
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB limit for body
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"]; // Permissible HTTP methods

/**
 * Middleware to enforce bandwidth limits for request headers and body.
 * Validates headers, body types, and sizes, and restricts allowed HTTP methods.
 * @param req - Incoming Next.js request object
 * @returns - NextResponse or allows the request to pass
 */
export async function bandwidthLimitMiddleware(req: NextRequest) {
    let headers = req.headers;

    // Validate header type and convert if necessary
    if (!(headers instanceof Headers)) {
        if (typeof headers !== "object" || Array.isArray(headers)) {
            return NextResponse.json(
                {
                    error: "Invalid headers type. Expected Headers or Record<string, string>.",
                },
                { status: 400 }
            );
        }

        try {
            headers = convertToHeaders(headers);
        } catch (error) {
            if (error instanceof Error) {
                return invalidHeaderResponse(error.message);
            } else {
                return invalidHeaderResponse(
                    "Unknown error occurred while converting headers."
                );
            }
        }
    }

    // Validate headers for empty keys/values, non-ASCII characters, and non-string values
    for (const [key, value] of headers.entries()) {
        if (
            value === null ||
            value === undefined ||
            key.trim() === "" ||
            value.trim() === ""
        ) {
            return NextResponse.json(
                {
                    error: "Headers must not have empty keys or values",
                    invalidHeader: { key, value },
                },
                { status: 400 }
            );
        }

        if (typeof value !== "string") {
            return NextResponse.json(
                {
                    error: `Invalid header value for key "${key}". Expected a string.`,
                },
                { status: 400 }
            );
        }

        if (!/^[\x00-\x7F]+$/.test(key) || !/^[\x00-\x7F]+$/.test(value)) {
            return NextResponse.json(
                {
                    error: "Non-ASCII characters in headers are not allowed",
                    invalidHeader: { key, value },
                },
                { status: 400 }
            );
        }
    }

    // Validate body type (string or ReadableStream)
    if (req.body) {
        if (
            typeof req.body !== "string" &&
            !(req.body instanceof ReadableStream)
        ) {
            return NextResponse.json(
                {
                    error: "Invalid body type. Body must be a string or a valid ReadableStream.",
                },
                { status: 400 }
            );
        }

        // Verify ReadableStream validity
        if (req.body instanceof ReadableStream) {
            try {
                const reader = req.body.getReader();
                await reader.read(); // Attempt to read from the stream
                reader.releaseLock();
            } catch {
                return NextResponse.json(
                    {
                        error: "Invalid body type. Failed to process ReadableStream.",
                    },
                    { status: 400 }
                );
            }
        }
    }

    // Ensure HTTP method is allowed
    if (!ALLOWED_METHODS.includes(req.method)) {
        return methodNotAllowedResponse();
    }

    // Validate total header size against the limit
    const headerSize = calculateHeaderSize(headers);
    if (headerSize > MAX_HEADER_SIZE) {
        return headerTooLargeResponse(headerSize, MAX_HEADER_SIZE);
    }

    // Validate Content-Length header
    const contentLengthResult = getContentLength(headers);
    if (
        contentLengthResult.isValid &&
        contentLengthResult.value !== undefined
    ) {
        const contentLength = contentLengthResult.value;

        if (req.method === "POST" && contentLength > MAX_BODY_SIZE) {
            return payloadTooLargeResponse(contentLength, MAX_BODY_SIZE);
        }
    } else if (contentLengthResult.isPresent) {
        return invalidContentLengthResponse();
    }

    // Validate body size for POST and PUT requests
    if (req.method === "POST" || req.method === "PUT") {
        const bodyStream = req.body;

        if (bodyStream) {
            let bodySize = 0;
            for await (const chunk of readableStreamToAsyncIterator(
                bodyStream
            )) {
                bodySize += chunk.length;
                if (bodySize > MAX_BODY_SIZE) {
                    return payloadTooLargeResponse(bodySize, MAX_BODY_SIZE);
                }
            }
        }
    }

    return NextResponse.next();
}

/**
 * Helper function to convert a ReadableStream into an async iterator.
 * Used to process and calculate the size of ReadableStream bodies.
 * @param stream - ReadableStream to be processed
 * @returns - Async iterator for chunks in the stream
 */
async function* readableStreamToAsyncIterator(
    stream: ReadableStream<Uint8Array>
) {
    const reader = stream.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield value!;
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Converts non-Headers objects (e.g., key-value pairs) into a Headers object.
 * Validates all keys and values are strings.
 * @param headers - Object or Headers to be converted
 * @returns - A valid Headers object
 */
function convertToHeaders(headers: Record<string, unknown> | Headers): Headers {
    if (headers instanceof Headers) {
        return headers;
    }
    const convertedHeaders = new Headers();
    for (const [key, value] of Object.entries(headers)) {
        if (value === null) {
            throw new Error(
                `Invalid header value for key "${key}". Value cannot be null.`
            );
        }
        if (typeof value === "string") {
            convertedHeaders.append(key, value);
        } else {
            throw new Error(
                `Invalid header value for key "${key}". Expected a string.`
            );
        }
    }
    return convertedHeaders;
}

/**
 * Generates a JSON response for unsupported HTTP methods.
 * @returns - NextResponse object with 405 status
 */
function methodNotAllowedResponse() {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

/**
 * Generates a JSON response when headers exceed the maximum allowed size.
 * @param actualSize - Calculated size of the headers
 * @param maxAllowedSize - Maximum allowable size for headers
 * @returns - NextResponse object with 431 status
 */
function headerTooLargeResponse(actualSize: number, maxAllowedSize: number) {
    return NextResponse.json(
        {
            error: "Header Too Large",
            actualSize,
            maxAllowedSize,
        },
        { status: 431 }
    );
}

/**
 * Generates a JSON response for invalid Content-Length headers.
 * @returns - NextResponse object with 400 status
 */
function invalidContentLengthResponse() {
    return NextResponse.json(
        {
            error: "Invalid Content-Length",
            actualSize: null,
            maxAllowedSize: MAX_BODY_SIZE,
        },
        { status: 400 }
    );
}

/**
 * Generates a JSON response for invalid headers.
 * @param message - Detailed error message
 * @returns - NextResponse object with 400 status
 */
function invalidHeaderResponse(message: string) {
    return NextResponse.json(
        {
            error: "Invalid Headers",
            message,
        },
        { status: 400 }
    );
}

/**
 * Generates a JSON response when the request body exceeds the maximum size.
 * @param actualSize - Size of the request body
 * @param maxAllowedSize - Maximum allowable size for the body
 * @returns - NextResponse object with 413 status
 */
function payloadTooLargeResponse(actualSize: number, maxAllowedSize: number) {
    return NextResponse.json(
        {
            error: "Payload Too Large",
            actualSize,
            maxAllowedSize,
        },
        { status: 413 }
    );
}

/**
 * Calculates the total size of all headers, including keys, values, and separators.
 * @param headers - Headers object
 * @returns - Total size of headers in bytes
 */
function calculateHeaderSize(headers: Headers) {
    let size = 0;
    for (const [key, value] of headers.entries()) {
        size += key.length + value.length + 2; // Include ": " separator
    }
    return size;
}

/**
 * Extracts and validates the Content-Length header as a number.
 * Ensures it is present, valid, and non-negative.
 * @param headers - Headers object
 * @returns - Object containing validation result and content length
 */
function getContentLength(headers: Headers): {
    isValid: boolean;
    isPresent: boolean;
    value?: number;
} {
    const contentLengthRaw = headers.get("content-length");
    if (contentLengthRaw === null) {
        return { isValid: false, isPresent: false };
    }
    if (!/^\d+$/.test(contentLengthRaw.trim())) {
        return { isValid: false, isPresent: true };
    }
    const contentLength = parseInt(contentLengthRaw, 10);
    if (
        isNaN(contentLength) ||
        contentLength < 0 ||
        contentLength > Number.MAX_SAFE_INTEGER
    ) {
        return { isValid: false, isPresent: true };
    }
    return { isValid: true, isPresent: true, value: contentLength };
}

//  --- upgrade example ---
// If you want to restrict more details (e.g. only POST is allowed 2MB, etc.):
// if (req.method === 'POST') { ...
// if (req.method === 'POST') { ... } to add a conditional branch like this:
//  if (req.method === 'POST') { ...

// You can also change the size by environment variables if necessary
// e.g. if (isDev) { ... } else { ... }
