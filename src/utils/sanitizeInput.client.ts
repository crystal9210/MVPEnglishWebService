"use client"; // クライアント用モジュール (Next.jsなら必須)

import DOMPurify, { Config, DOMPurify as DOMPurifyType } from "dompurify";
import {
  decodeInput,
  checkDangerousPatterns,
  sanitizeObjectCommon,
} from "./sanitizeCommon";

const domPurifyConfigClient: Config = {
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

let clientPurifyInstance: DOMPurifyType | null = null;

/** クライアント側: DOMPurify(window) */
function getClientPurify(): DOMPurifyType {
  if (clientPurifyInstance) return clientPurifyInstance;
  clientPurifyInstance = DOMPurify(window as unknown as Window & typeof globalThis);
  clientPurifyInstance.setConfig(domPurifyConfigClient);
  return clientPurifyInstance;
}

/**
 * クライアント側のサニタイズ関数
 */
export function sanitizeInputClient(input: string): string {
  const purify = getClientPurify();

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
 * クライアント側: sanitizeObject
 */
export async function sanitizeObjectClient<T>(input: T): Promise<T> {
  return sanitizeObjectCommon(input, async (str) => {
    return sanitizeInputClient(str);
  });
}
