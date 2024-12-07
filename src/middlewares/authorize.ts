import { NextResponse, NextRequest } from 'next/server';

/**
 * 認可ミドルウェア
 * @param req NextRequest
 * @param requiredRoles 必要なユーザーロールの配列
 * @returns NextResponse | undefined
 */
export function authorizeMiddleware(req: NextRequest, requiredRoles: string[]) {
    // ユーザーIDと役割をヘッダーから取得
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId || !userRole) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    if (!requiredRoles.includes(userRole)) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    return NextResponse.next();
}
