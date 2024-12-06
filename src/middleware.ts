import { NextResponse, NextRequest } from 'next/server';
import { authenticateMiddleware } from '@/middlewares/authenticate';

export async function middleware(req: NextRequest) {
    // 認証ミドルウェア呼び出し
    const authResponse = await authenticateMiddleware(req);
    if (authResponse) return authResponse;

    // 認証成功ー＞次に進む
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*', '/dashboard/:path*', '/register/:path*'],
};
