import { NextResponse, NextRequest } from "next/server";

/**
 * Middleware to check Content-Type and Content-Length headers.
 * @param req NextRequest
 * @param options Middleware configuration options
 * @returns NextResponse | undefined
 */
export function contentTypeCheckMiddleware(
    req: NextRequest,
    options: {
        allowedContentTypes?: string[];
        restrictedMethods?: string[];
        maxBodyContentLength?: number;
    } = {}
) {
    const allowedContentTypes = options.allowedContentTypes || [
        "application/json",
    ];
    const restrictedMethods = options.restrictedMethods || [
        "GET",
        "HEAD",
        "DELETE",
    ];
    const maxBodyContentLength = options.maxBodyContentLength || 0;

    // Validate all headers
    const encoder = new TextEncoder();
    for (const [key, value] of req.headers.entries()) {
        if (encoder.encode(value).length > 2048) {
            return createErrorResponse(
                400,
                "Invalid header: Value is too long"
            );
        }
    }

    // Check for unsupported HTTP methods
    if (
        !["GET", "HEAD", "DELETE", "POST", "PUT", "PATCH"].includes(req.method)
    ) {
        return createErrorResponse(405, "Method Not Allowed");
    }

    const contentType = req.headers.get("content-type");

    // Dynamic Content-Type Validation
    if (["POST", "PUT", "PATCH"].includes(req.method) && contentType) {
        const isAllowed = allowedContentTypes.some((type) =>
            contentType.includes(type)
        );
        if (!isAllowed) {
            return createErrorResponse(
                415,
                `Unsupported Media Type: ${contentType}`,
                { allowedTypes: allowedContentTypes }
            );
        }
    }

    // Dynamic Content-Length Validation
    if (restrictedMethods.includes(req.method)) {
        const length = req.headers.get("content-length");
        if (length) {
            const contentLength = parseInt(length, 10);

            if (isNaN(contentLength) || contentLength < 0) {
                return createErrorResponse(
                    400,
                    `Invalid Content-Length header: ${length}`
                );
            }

            if (contentLength > maxBodyContentLength) {
                return createErrorResponse(
                    400,
                    `${req.method} requests with a body are not allowed`,
                    { maxBodyContentLength }
                );
            }
        }
    }

    return NextResponse.next();
}

/**
 * Helper to create standardized error responses.
 * @param status HTTP status code
 * @param message Error message
 * @param details Additional details for debugging (optional)
 * @returns NextResponse
 */
function createErrorResponse(
    status: number,
    message: string,
    details?: Record<string, unknown>
) {
    return NextResponse.json(
        { error: message, ...(details && { details }) },
        { status }
    );
}
