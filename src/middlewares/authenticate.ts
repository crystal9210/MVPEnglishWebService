import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 認証ミドルウェア
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export async function authenticateMiddleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET! });
    console.log(`debugging token in middleware: ${JSON.stringify(token, null, 2)}`);
    const { pathname } = req.nextUrl;
    console.log(`debugging pathname in middleware: ${pathname}`);

    // 認証不要なパス
    const publicPaths = ['/api/auth', '/register', '/login'];
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // TODO sub調査・調整、token詳細設計反映
    if (!token || !token.sub) { // 'sub' は標準的なJWTクレーム
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // ユーザーIDをヘッダーに添付
    const userId = token.sub as string;
    if (userId) {
        req.headers.set('x-user-id', userId);
    }

    return NextResponse.next();
}
