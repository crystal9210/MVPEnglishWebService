// Node.js 環境で TextEncoder/TextDecoder をグローバルに設定
import { TextEncoder, TextDecoder } from "util";

if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}