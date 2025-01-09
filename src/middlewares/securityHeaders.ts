import { cspString } from "@/config/cspConfig";
import { isDev, isHttpForDev } from "@/config/envConfig";
import { NextResponse, NextRequest } from "next/server";

/**
 * セキュリティヘッダーを設定するミドルウェア。
 *
 * - Next.jsで「レスポンスを生成」すると、その時点でチェーンが終わるのが基本ルール。
 * - しかし、ヘッダーだけ付けて後続の処理に進ませるには、
 *   "NextResponse.next() + header を set" という書き方をする必要がある。
 */
export function securityHeadersMiddleware(req: NextRequest) {
    // 後続に処理を渡すため "NextResponse.next()" を呼ぶが、ここで「ヘッダーを変更したレスポンスオブジェクト」を生成
    // request: { headers: req.headers } の指定で、元のリクエストヘッダーを複製している
    const res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    /**
     * ヘッダー一覧
     * 1) Content-Security-Policy (CSP)
     *    → スクリプトやスタイルのロード元を制限し、XSS攻撃を防ぐ
     *
     * 2) Strict-Transport-Security (HSTS)
     *    → ブラウザに対して「必ずHTTPSでアクセスせよ」と教える
     *
     * 3) X-Content-Type-Options
     *    → ブラウザがコンテンツタイプを勝手に推測("MIMEスニッフィング")しないようにする
     *
     * 4) X-Frame-Options
     *    → iframe などへの埋め込みを制限し、「クリックジャッキング」攻撃を防ぐ
     *
     * 5) X-XSS-Protection
     *    → 一部ブラウザで動作するXSS対策 (ただしmodernブラウザの多くは非推奨)
     *
     * 6) Referrer-Policy
     *    → リンク遷移時に参照元URLを送らないように制御 (プライバシー保護)
     *
     * 7) Permissions-Policy
     *    → geolocation(位置情報)やマイク・カメラへのアクセスを制御
     */
    res.headers.set("Content-Security-Policy", cspString);
    // HTTPS を強制したいかどうか >> 本番のみenforceする等
    // HTTPで動かす開発環境では Strict-Transport-Security をつけないなど
    // settings of HSTS
    if (!isHttpForDev()) {
        // production https, dev https の場合に付与
        res.headers.set(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains; preload"
        );
    }
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()"
    );

    // (2) レスポンスヘッダーをコンソール出力してデバッグしたい場合（開発向け）
    if (isDev) {
        console.log("[securityHeadersMiddleware] Setting Security Headers");
        console.log(Array.from(res.headers.entries()));
    }

    // 最後に、このレスポンスオブジェクトを return する
    // → 後続のミドルウェアや最終ハンドラは、付与されたヘッダーを含むレスポンスとして実行される
    return res;
}
