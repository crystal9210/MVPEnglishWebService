import DOMPurify, { Config, DOMPurify as DOMPurifyType } from "dompurify";
import { JSDOM } from "jsdom";

import {
  decodeInput,
  checkDangerousPatterns,
  sanitizeObjectCommon,
} from "./sanitizeCommon";

/** サーバー用: DOMPurify設定 */
const domPurifyConfigServer: Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  FORBID_ATTR: [
    "onerror", "onclick", "onload", "onmouseover", "onfocus", "onchange", "onkeydown", "onkeyup"
  ],
  FORBID_TAGS: [
    "style", "script", "iframe", "object", "embed", "link", "meta", "svg", "input", "button", "textarea"
  ],
  KEEP_CONTENT: false,
};

let serverPurifyInstance: DOMPurifyType | null = null;

/** サーバー側: jsdom使って仮想windowを作成 */
function getServerPurify(): DOMPurifyType {
  if (serverPurifyInstance) return serverPurifyInstance;
  const { window } = new JSDOM("");
  // キャストで型エラー回避
  serverPurifyInstance = DOMPurify(window as unknown as Window & typeof globalThis);
  serverPurifyInstance.setConfig(domPurifyConfigServer);
  return serverPurifyInstance;
}

/**
 * サーバー側のサニタイズ関数 (同期)
 */
export function sanitizeInputServer(input: string): string {
  const purify = getServerPurify();

  // 1. decode
  const decoded = decodeInput(input);

  // 2. sanitize
  const sanitized = purify.sanitize(decoded);

  // 3. check patterns
  checkDangerousPatterns(decoded);
  checkDangerousPatterns(sanitized);

  // 4. ensure not empty
  if (sanitized.trim().length === 0 || /[\x00-\x1F\x7F-\x9F]/.test(sanitized)) {
    throw new Error(`Sanitization failed, potentially dangerous: ${input}`);
  }

  // 5. ensure equality
  if (sanitized !== decoded) {
    throw new Error(`Input altered after sanitization: ${input}`);
  }

  return sanitized;
}

/**
 * サーバー側: sanitizeObject
 */
export async function sanitizeObjectServer<T>(input: T): Promise<T> {
  return sanitizeObjectCommon(input, async (str) => {
    return sanitizeInputServer(str);
  });
}
