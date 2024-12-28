import { decode } from "html-entities";

/**
 * デコードを最大5回繰り返す
 * 制御文字を含む場合はエラー
 */
export function decodeInput(input: string): string {
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

/** Base64チェック */
export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

/** 危険パターンの正規表現群 */
export const dangerousPatterns = [
  /<[^>]*(on\w+|javascript:|data:|base64,)[^>]*>/gi,
  /&(#[0-9]+|[a-z]+);/gi,
  /%[0-9a-f]{2}/gi,
  /(?:;|\||&|\$\(|`|>|<|\\|\^|\[|\]|\{|}|\"|'|--)/gi,
  /(?:\.\.|\/)+|\/etc\/passwd/gi,
  /(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|SLEEP|BENCHMARK|LOAD_FILE|READ_FILE|XP_CMDSHELL|BULK_INSERT|HEX|TRUNCATE|INFORMATION_SCHEMA)/gi,
  /\$\{[^}]*\}/gi,
  /#\{[^}]*\}/gi,
  /\(\*\)|\(\|\)/gi,
  /\*\)|\|\(/gi,
  /\\u0000|\\x00/gi,
  /[\x00-\x1F\x7F-\x9F]/g,
  /(?:eval\(|alert\(|document\.cookie|window\.location)/gi,
  /(?:sleep|benchmark|load_file|read_file|xp_cmdshell|bulk_insert)/gi,
  /(?:\r\n|\n|\r)/g,
  /[\u202E\u202D\u202C\u202B\u202A]/g,
  /(?:\b[A-Z]{4,}\b)/g,
  /[¶¥§©®™€£¢¤]/g,
  /.*\uFFFD.*/g,
  /data:[^;]+;base64,[a-zA-Z0-9+/=]+/gi,
  /0x[a-fA-F0-9]+/g,
  /\w{5,}@\w{3,}\.[a-z]{2,}/g,
  /.{1000,}/,
  /\d{3}-\d{2}-\d{4}/,
  /(?:DROP|CREATE)\s+DATABASE/gi,
  /(?:TO|WITH|GRANT|REVOKE|IDENTIFIED\s+BY|AS)/gi,
  /(?:<!--|-->|<!DOCTYPE|<!ENTITY|<!\[CDATA\[)/gi,
  /<script\b[^>]*>.*?<\/script>/gi,
];

/** 危険パターンをチェック */
export function checkDangerousPatterns(input: string): void {
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

/** sanitizeObject共通ロジック (文字列判定はあとで実装) */
export async function sanitizeObjectCommon<T>(
  input: T,
  sanitizeStringFunc: (str: string) => Promise<string>
): Promise<T> {
  if (typeof input === "string") {
    // 文字列ならサニタイズ関数にかける
    const res = await sanitizeStringFunc(input);
    return res as unknown as T;
  }
  if (Array.isArray(input)) {
    const arrResult = [];
    for (const item of input) {
      arrResult.push(await sanitizeObjectCommon(item, sanitizeStringFunc));
    }
    return arrResult as unknown as T;
  }
  if (typeof input === "object" && input !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = await sanitizeObjectCommon(value, sanitizeStringFunc);
    }
    return result as T;
  }
  return input;
}
