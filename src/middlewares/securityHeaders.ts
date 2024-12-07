import { NextResponse, NextRequest } from 'next/server';

/**
 * セキュリティヘッダーを設定するミドルウェア
 * @param req NextRequest
 * @returns NextResponse
 */
export function securityHeadersMiddleware(req: NextRequest) {
    const res = NextResponse.next();

    res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-src 'none';");
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'no-referrer');
    res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return res;
}
