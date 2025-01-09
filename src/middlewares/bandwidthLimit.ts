import { NextResponse, NextRequest } from "next/server";

/**
 * Middleware to limit size of request header and body
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export function bandwidthLimitMiddleware(req: NextRequest) {
    const MAX_HEADER_SIZE = 8 * 1024; // 8KB
    const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

    // checks header size.
    let headerSize = 0;
    req.headers.forEach((value, key) => {
        headerSize += key.length + value.length;
    });

    if (headerSize > MAX_HEADER_SIZE) {
        return NextResponse.json(
            { error: "Header Too Large" },
            { status: 431 }
        );
    }

    // checks body size.
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
        return NextResponse.json(
            { error: "Payload Too Large" },
            { status: 413 }
        );
    }

    // If you want to restrict more details (e.g. only POST is allowed 2MB, etc.):
    // if (req.method === 'POST') { ...
    // if (req.method === 'POST') { ... } to add a conditional branch like this:
    //  if (req.method.=== 'POST') { ...

    // You can also change the size by environment variables if necessary
    // e.g. if (isDev) { ... } else { ... }

    return NextResponse.next();
}
