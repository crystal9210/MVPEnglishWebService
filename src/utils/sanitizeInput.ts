import { DOMPurify } from "dompurify"; // XSS
import jsdom from "jsdom";



// 手動でサニタイズ処理を実装する例 - ただし対応範囲が限定的かつ手動だと限度があるためサポートされ、外部から提供されているパッケージを信頼した方が効率的かつ堅牢な可能性が高い - 技術選定としてパッケージの選定も注意して行うこと
// export const sanitizeInput = (input: string): string =>
//     input
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot")
//         .replace(/'/g, "&#039;");

// ex: &を&amp;に変換 - htmlエンティティとして解釈されなくなる
