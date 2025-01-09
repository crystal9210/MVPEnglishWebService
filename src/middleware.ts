import { NextResponse, NextRequest } from "next/server";
import {
    loggingMiddleware,
    securityHeadersMiddleware,
    bandwidthLimitMiddleware,
    contentTypeCheckMiddleware,
    rateLimitMiddleware,
    authenticateMiddleware,
    authorizeMiddleware,
    errorHandlerMiddleware,
} from "@/middlewares";

/**
 * Global middleware.
 * @param req
 * @returns
 */
export async function middleware(req: NextRequest) {
    try {
        // 1) ログ記録 (最優先で記録)
        const logResponse = loggingMiddleware(req);
        if (logResponse) {
            // logResponse が何らかのレスポンスを返している場合、それを返して終了
            return logResponse;
        }

        // 2) セキュリティヘッダー付与
        const securityResponse = securityHeadersMiddleware(req);
        if (securityResponse) {
            // securityResponseが即時レスポンスを返す場合、そのまま終了
            // しかしここでは securityResponse = NextResponse.next() を返す設計なので
            // "レスポンスオブジェクト" を後続に流す
            return securityResponse;
        }

        // 帯域幅制限
        const bandwidthResponse = bandwidthLimitMiddleware(req);
        if (bandwidthResponse) return bandwidthResponse;

        // Content-Type チェック
        const contentTypeResponse = contentTypeCheckMiddleware(req);
        if (contentTypeResponse) return contentTypeResponse;

        // レートリミット
        const rateLimitResponse = rateLimitMiddleware(req);
        if (rateLimitResponse) return rateLimitResponse;

        // 認証チェック
        const authResponse = await authenticateMiddleware(req);
        if (authResponse) return authResponse;

        // 認可チェック (admin ページだけ特別に)
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const authorizeResponse = authorizeMiddleware(req, ["admin"]);
            if (authorizeResponse) return authorizeResponse;
        }

        return NextResponse.next();
    } catch (error) {
        return errorHandlerMiddleware(error as Error);
    }
}

export const config = {
    // ミドルウェアを適用するパス
    matcher: [
        "/api/:path*",
        "/dashboard/:path*",
        "/register/:path*",
        "/admin/:path*",
    ],
};
