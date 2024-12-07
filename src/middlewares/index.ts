import { NextResponse, NextRequest } from 'next/server';
import { authenticateMiddleware } from './authenticate';
import { authorizeMiddleware } from './authorize';
import { rateLimitMiddleware } from './rateLimit';
import { bandwidthLimitMiddleware } from './bandwidthLimit';
import { contentTypeCheckMiddleware } from './contentTypeCheck';
import { errorHandlerMiddleware } from './errorHandler';
import { securityHeadersMiddleware } from './securityHeaders';
import { loggingMiddleware } from './logging';

/**
 * グローバルミドルウェア
 * @param req NextRequest
 * @returns NextResponse
 */
export async function middleware(req: NextRequest) {
    try {
        // ログ記録
        const logResponse = loggingMiddleware(req);
        if (logResponse) return logResponse;

        // セキュリティヘッダーの設定
        const securityResponse = securityHeadersMiddleware(req);
        if (securityResponse) return securityResponse;

        // 帯域幅制限のチェック
        const bandwidthResponse = bandwidthLimitMiddleware(req);
        if (bandwidthResponse) return bandwidthResponse;

        // コンテンツタイプのチェック
        const contentTypeResponse = contentTypeCheckMiddleware(req);
        if (contentTypeResponse) return contentTypeResponse;

        // レートリミットのチェック
        const rateLimitResponse = rateLimitMiddleware(req);
        if (rateLimitResponse) return rateLimitResponse;

        // 認証のチェック
        const authResponse = await authenticateMiddleware(req);
        if (authResponse) return authResponse;

        // 認可のチェック（必要に応じて）
        // 例: 管理者専用ページへのアクセス制御
        if (req.nextUrl.pathname.startsWith('/admin')) {
            const authorizeResponse = authorizeMiddleware(req, ['admin']);
            if (authorizeResponse) return authorizeResponse;
        }

        // 他のミドルウェアや処理へ
        return NextResponse.next();
    } catch (error) {
        return errorHandlerMiddleware(error as Error);
    }
}

export const config = {
    matcher: ['/api/:path*', '/dashboard/:path*', '/register/:path*', '/admin/:path*'],
};



// --- use case samples ---


// -- sample1: app/api/register/route.ts --
// import { NextResponse } from 'next/server';
// import { withValidationAndSanitization } from '@/middlewares/validateAndSanitize';
// import { userRegistrationSchema } from '@/models/user';
// import { userService } from '@/services/userService';

// /**
//  * ユーザー登録ハンドラー
//  */
// async function registerHandler(req: Request, context: { params: any, validatedBody: any }) {
//     const { validatedBody } = context;
//     const { email, password, name, role } = validatedBody;

//     try {
//         const user = await userService.registerUser({ email, password, name, role });
//         return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
//     }
// }

// // バリデーションとサニタイズを適用
// export const POST = withValidationAndSanitization(registerHandler, userRegistrationSchema, ['name']);



// -- sample2: app/api/dashboard/route.ts --
// import { NextResponse } from 'next/server';
// import { authorizeMiddleware } from '@/middlewares/authorize';
// import { getDashboardData } from '@/services/dashboardService';

// /**
//  * ダッシュボードデータ取得ハンドラー
//  */
// export async function GET(req: Request, context: any) {
//     // 認可チェック（例: 管理者のみアクセス可能）
//     const authorizeResponse = authorizeMiddleware(req as any, ['admin']);
//     if (authorizeResponse) return authorizeResponse;

//     try {
//         const data = await getDashboardData();
//         return NextResponse.json({ data }, { status: 200 });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
//     }
// }
