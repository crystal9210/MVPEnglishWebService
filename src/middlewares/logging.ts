// TODO
import { NextRequest } from "next/server";
import { getClientIp } from "./utils";

/**
 * ログ記録ミドルウェア
 * @param req NextRequest
 * @returns NextResponse
 */
export async function loggingMiddleware(req: NextRequest) {
    // メソッドとURLを取得
    const { method, url } = req;

    // IPを共通関数で取得
    const ip = getClientIp(req);

    console.log(`[Request] ${method} ${url} - IP: ${ip}`);
    // (1) リクエストヘッダーをコンソール出力したい場合
    // 大量ログになる恐れがあるので開発環境限定にするなど要検討
    req.headers.forEach((val, key) => {
        console.log(`[loggingMiddleware] Request header: ${key} = ${val}`);
    });

    // セッション情報やその他の識別情報をログに記録する場合は、適切にフィルタリング
    // 例: ユーザーIDや役割
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    if (userId) {
        console.log(`User ID: ${userId}, Role: ${userRole}`);
    }

    return undefined;
}
