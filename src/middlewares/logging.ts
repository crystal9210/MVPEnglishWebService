import { NextResponse, NextRequest } from 'next/server';

/**
 * ログ記録ミドルウェア
 * @param req NextRequest
 * @returns NextResponse
 */
export async function loggingMiddleware(req: NextRequest) {
    const { method, url, headers } = req;
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

    console.log(`[Request] ${method} ${url} - IP: ${ip}`);

    // セッション情報やその他の識別情報をログに記録する場合は、適切にフィルタリング
    // 例: ユーザーIDや役割
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    if (userId) {
        console.log(`User ID: ${userId}, Role: ${userRole}`);
    }

    return NextResponse.next();
}
