// TODO
import { NextResponse, NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

// レートリミット設定
const rateLimit = new LRUCache({
    max: 1000, // 最大エントリ数
    ttl: 1000 * 60, // 1分
});

/**
 * レートリミッティングミドルウェア
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export function rateLimitMiddleware(req: NextRequest) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

    const count = rateLimit.get(ip) || 0;
    if (count >= 100) { // 1分間に100リクエストを超えた場合
        return NextResponse.json(
            { error: 'Too Many Requests' },
            { status: 429 }
        );
    }

    rateLimit.set(ip, count + 1);
    return NextResponse.next();
}
