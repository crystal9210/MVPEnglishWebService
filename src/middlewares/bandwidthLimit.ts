import { NextResponse, NextRequest } from 'next/server';

/**
 * リクエストヘッダーとボディのサイズを制限するミドルウェア
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export function bandwidthLimitMiddleware(req: NextRequest) {
    const MAX_HEADER_SIZE = 8 * 1024; // 8KB
    const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

    // ヘッダーサイズのチェック
    let headerSize = 0;
    req.headers.forEach((value, key) => {
        headerSize += key.length + value.length;
    });

    if (headerSize > MAX_HEADER_SIZE) {
        return NextResponse.json(
            { error: 'Header Too Large' },
            { status: 431 }
        );
    }

    // ボディサイズのチェック
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
        return NextResponse.json(
            { error: 'Payload Too Large' },
            { status: 413 }
        );
    }

    return NextResponse.next();
}
