import { NextResponse, NextRequest } from 'next/server';

/**
 * Content-Type ヘッダーをチェックするミドルウェア
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export function contentTypeCheckMiddleware(req: NextRequest) {
    const allowedContentTypes = ['application/json'];
    const contentType = req.headers.get('content-type');

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && contentType) {
        const isAllowed = allowedContentTypes.some(type => contentType.includes(type));
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Unsupported Media Type' },
                { status: 415 }
            );
        }
    }

    return NextResponse.next();
}
