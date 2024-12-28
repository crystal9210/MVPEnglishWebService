// sanitize.ts
import { decode } from "html-entities";
import DOMPurify, { Config, DOMPurify as DOMPurifyType } from "dompurify";

/**
 * ここが重要:
 *  - `require` を使って動的に "jsdom" を読み込み
 *  - `typeof window === "undefined"` 判定が true のときのみ実行
 * これにより、クライアントサイドのビルドで "jsdom" が静的解析されずに
 * バンドルされない可能性が高くなる（tree-shaking / code-splitting）。
 */
let JSDOM: any;
try {
  if (typeof window === "undefined") {
    // Node.js環境 (サーバーサイド) のみ require する
    JSDOM = require("jsdom").JSDOM;
  }
} catch (e) {
  // もし何かエラーが起きても無視（クライアント側では読み込まれない想定）
}

const isServer: boolean = typeof window === "undefined";

/** configオブジェクトはそのまま再利用 */
const domPurifyConfig: Config = {
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

let domPurifyInstance: DOMPurifyType | null = null;

/**
 *  getDOMPurify():
 *    - サーバーサイドなら jsdom で仮想windowを作成し、DOMPurifyを通す
 *    - クライアントサイドなら生の window を使う
 */
function getDOMPurify(): DOMPurifyType {
  if (domPurifyInstance) return domPurifyInstance;

  if (isServer) {
    // サーバーサイド
    if (!JSDOM) {
      throw new Error("jsdom not available in this environment");
    }
    const { window } = new JSDOM("");
    domPurifyInstance = DOMPurify(window as unknown as Window);
  } else {
    // クライアントサイド
    domPurifyInstance = DOMPurify(window);
  }
  domPurifyInstance.setConfig(domPurifyConfig);
  return domPurifyInstance;
}

/**
 * デコードロジックはそのまま
 */
function decodeInput(input: string): string {
  let decoded = input;
  for (let i = 0; i < 5; i++) {
    const newDecoded = decode(decoded);
    if (newDecoded === decoded) break;
    decoded = newDecoded;
  }
  if (/[\x00-\x1F\x7F-\x9F]/.test(decoded)) {
    throw new Error(`Input contains non-printable characters: ${decoded}`);
  }
  return decoded;
}

/**
 * Base64チェックロジック
 */
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
}

/**
 * 危険パターンチェックの配列
 */
const dangerousPatterns = [
  /<[^>]*(on\w+|javascript:|data:|base64,)[^>]*>/gi, // HTML/JS injection
  /&(#[0-9]+|[a-z]+);/gi, // HTML entities
  /%[0-9a-f]{2}/gi, // URL encoding
  /(?:;|\||&|\$\(|`|>|<|\\|\^|\[|\]|\{|}|\"|'|--)/gi, // Command injection
  /(?:\.\.|\/)+|\/etc\/passwd/gi, // Path traversal
  /(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|SLEEP|BENCHMARK|LOAD_FILE|READ_FILE|XP_CMDSHELL|BULK_INSERT|HEX|TRUNCATE|INFORMATION_SCHEMA)/gi, // SQL injection with HEX detection
  /\$\{[^}]*\}/gi, // Template injection
  /#\{[^}]*\}/gi, // Ruby-style template injection
  /\(\*\)|\(\|\)/gi, // LDAP injection patterns
  /\*\)|\|\(/gi, // Nested LDAP injection
  /\\u0000|\\x00/gi, // Null bytes
  /[\x00-\x1F\x7F-\x9F]/g, // Control characters
  /(?:eval\(|alert\(|document\.cookie|window\.location)/gi, // JavaScript-specific threats
  /(?:sleep|benchmark|load_file|read_file|xp_cmdshell|bulk_insert)/gi, // SQL-specific threats
  /(?:\r\n|\n|\r)/g, // CRLF injection
  /[\u202E\u202D\u202C\u202B\u202A]/g, // Unicode bidi override
  /(?:\b[A-Z]{4,}\b)/g, // Suspicious all-uppercase words
  /[¶¥§©®™€£¢¤]/g, // Special characters
  /.*\uFFFD.*/g, // Unicode replacement character
  /data:[^;]+;base64,[a-zA-Z0-9+/=]+/gi, // Base64 payloads
  /0x[a-fA-F0-9]+/g, // Hexadecimal payloads
  /\w{5,}@\w{3,}\.[a-z]{2,}/g, // Email-like patterns
  /.{1000,}/, // Overly long payloads
  /\d{3}-\d{2}-\d{4}/, // SSN patterns
  /(?:DROP|CREATE)\s+DATABASE/gi, // Database-specific commands
  /(?:TO|WITH|GRANT|REVOKE|IDENTIFIED\s+BY|AS)/gi, // Privilege escalation keywords
  /(?:<!--|-->|<!DOCTYPE|<!ENTITY|<!\[CDATA\[)/gi, // XML-based injections
  /<script\b[^>]*>.*?<\/script>/gi, // Simplified inline script tags
];

/**
 * 危険パターンをチェック
 */
function checkDangerousPatterns(input: string): void {
  // Base64 decode して再チェック
  if (isBase64(input)) {
    const decodedInput = atob(input);
    if (dangerousPatterns.some((pattern) => pattern.test(decodedInput))) {
      throw new Error(`Potentially dangerous Base64 content detected: ${decodedInput}`);
    }
  }

  if (dangerousPatterns.some((pattern) => pattern.test(input))) {
    throw new Error(`Potentially dangerous content detected: ${input}`);
  }
}

/**
 * メインのsanitizeInput関数:
 * 1. decode
 * 2. purify.sanitize
 * 3. dangerousPatternsチェック
 * 4. 空文字・制御文字の検出
 * 5. sanitizedとdecodedの差分判定
 */
export function sanitizeInput(input: string): string {
  const purify = getDOMPurify();

  // 1. decode
  const decoded = decodeInput(input);

  // 2. sanitize
  const sanitized = purify.sanitize(decoded);

  // 3. pattern check
  checkDangerousPatterns(decoded);
  checkDangerousPatterns(sanitized);

  // 4. ensure non-empty, no control chars
  if (sanitized.trim().length === 0 || /[\x00-\x1F\x7F-\x9F]/.test(sanitized)) {
    throw new Error(`Sanitization failed, potentially dangerous: ${input}`);
  }

  // 5. ensure sanitized matches decoded
  if (sanitized !== decoded) {
    throw new Error(`Input altered after sanitization: ${input}`);
  }

  return sanitized;
}

/**
 * sanitizeObject: 文字列プロパティを再帰的にsanitize
 */
export function sanitizeObject<T>(input: T): T {
  if (typeof input === "string") {
    return sanitizeInput(input) as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as T;
  }
  if (typeof input === "object" && input !== null) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[key as keyof T] = sanitizeObject(value);
      return acc;
    }, {} as T);
  }
  return input;
}
