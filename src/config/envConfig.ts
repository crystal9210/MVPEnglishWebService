// 環境判定
export const isDev = process.env.NODE_ENV !== "production";

// HTTP or HTTPS で開発するかどうか
// （環境変数や別フラグで切り替え可能）
export function isHttpForDev() {
    return process.env.USE_HTTP_DEV === "true";
}

// 例: 本番運用で HTTPS 強制にしたい時のフラグ
export const enforceHttps = !isDev; // dev中は強制しない、とか
