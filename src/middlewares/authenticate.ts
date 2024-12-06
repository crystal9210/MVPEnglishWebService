import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 認証ミドルウェア
 * @param req NextRequest
 * @returns NextResponse | undefined
 */
export async function authenticateMiddleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    const { pathname } = req.nextUrl;

    // 認証不要なパス
    const publicPaths = ['/api/auth', '/register', '/login'];
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    if (!token || !token.uid) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // トークンからユーザーIDを取得し、ヘッダーに添付
    const userId = token.uid as string; // トークンに uid が含まれていると仮定
    if (userId) {
        req.headers.set('x-user-id', userId);
    }

    return NextResponse.next();
}
