import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDev } from "@/config/envConfig";
import { getClientIp } from "./utils";

/**
 * 認証ミドルウェア: next-auth で発行されたJWTを検証
 */
export async function authenticateMiddleware(req: NextRequest) {
    // デバッグ：クライアントIP
    if (isDev) {
        console.log("[authenticateMiddleware] client IP=", getClientIp(req));
    }

    // トークン取得
    const token = await getToken({ req, secret: process.env.AUTH_SECRET! });

    // 認証不要パスはスキップ
    const publicPaths = ["/api/auth", "/register", "/signIn"];
    if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // トークンが無い or token.sub が無ければ未認証
    if (!token || !token.sub) {
        return NextResponse.redirect(new URL("/signIn", req.url));
    }

    // 認証済み >> ユーザーIDをヘッダーにセット
    req.headers.set("x-user-id", token.sub);

    // ログ: tokenの中身を出したい場合
    if (isDev) {
        console.log("[authenticateMiddleware] token:", token);
    }

    return NextResponse.next();
}
