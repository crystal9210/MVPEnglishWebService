import { isDev } from "./envConfig";

// 本番(secure)で使うCSP: 'unsafe-inline'を排除し、nonceやhash導入が望ましい
const CSP_PROD = [
    "default-src 'self';",
    "script-src 'self';", // TODO nonce='xxx' や 'sha256-xxxx' を入れるのがベスト
    "style-src 'self';", // inlineを許可しない
    "img-src 'self' data:;",
    "connect-src 'self';",
    "font-src 'self';",
    "frame-src 'none';",
].join(" ");

// 開発用CSP: 'unsafe-inline' を許可する等、便利さ重視
const CSP_DEV = [
    "default-src 'self';",
    "script-src 'self';",
    // ↑ devツールなどにあわせてinline許可したい場合:
    // "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data:;",
    "connect-src 'self';",
    "font-src 'self';",
    "frame-src 'none';",
].join(" ");

export const cspString = isDev ? CSP_DEV : CSP_PROD;
