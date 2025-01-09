import { NextResponse, NextRequest } from "next/server";

/**
 * Middleware which checks Content-Type header.
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export function contentTypeCheckMiddleware(req: NextRequest) {
    const allowedContentTypes = ["application/json"];
    const contentType = req.headers.get("content-type");

    if (["POST", "PUT", "PATCH"].includes(req.method) && contentType) {
        const isAllowed = allowedContentTypes.some((type) =>
            contentType.includes(type)
        );
        if (!isAllowed) {
            return NextResponse.json(
                { error: "Unsupported Media Type" },
                { status: 415 }
            );
        }
    }

    if (["GET", "HEAD", "DELETE"].includes(req.method) && contentType) {
        const length = req.headers.get("content-length");
        if (length && parseInt(length, 10) > 0) {
            return NextResponse.json(
                { error: "GET, HEAD, DELETE with body not allowed" },
                { status: 400 }
            );
        }
    }

    return NextResponse.next();
}
