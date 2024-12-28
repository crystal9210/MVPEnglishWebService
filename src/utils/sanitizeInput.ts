import { decode } from "html-entities";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type { Config, DOMPurify as DOMPurifyType } from "dompurify";

const isServer: boolean = typeof window === "undefined";

let domPurify: DOMPurifyType | null = null;

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

const getDOMPurify = (): DOMPurifyType => {
  if (domPurify) return domPurify;

  if (isServer) {
    const { window } = new JSDOM("");
    domPurify = DOMPurify(window);
  } else {
    domPurify = DOMPurify(window);
  }

  domPurify.setConfig(domPurifyConfig);

  return domPurify;
};


const decodeInput = (input: string): string => {
  let decoded = input;
  for (let i = 0; i < 5; i++) {
    const newDecoded = decode(decoded);
    if (newDecoded === decoded) break; // これ以上デコードの変化がない場合は終了
    decoded = newDecoded;
  }
  if (/[\x00-\x1F\x7F-\x9F]/.test(decoded)) {
    throw new Error(`Input contains non-printable characters: ${decoded}`);
  }
  return decoded;
};


const isBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
};

const checkDangerousPatterns = (input: string): void => {
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
    /\d{3}-\d{2}-\d{4}/, // Social Security Number (SSN) patterns
    /(?:DROP|CREATE)\s+DATABASE/gi, // Database-specific commands
    /(?:TO|WITH|GRANT|REVOKE|IDENTIFIED\s+BY|AS)/gi, // Privilege escalation keywords
    /(?:<!--|-->|<!DOCTYPE|<!ENTITY|<!\[CDATA\[)/gi, // XML-based injections
    /<script\b[^>]*>.*?<\/script>/gi, // Simplified inline script tags
  ];

  if (isBase64(input)) {
    // Base64デコード後の文字列もチェック
    const decodedInput = atob(input);
    if (dangerousPatterns.some((pattern) => pattern.test(decodedInput))) {
      throw new Error(`Potentially dangerous Base64 content detected: ${decodedInput}`);
    }
  }

  if (dangerousPatterns.some((pattern) => pattern.test(input))) {
    throw new Error(`Potentially dangerous content detected: ${input}`);
  }
};

export const sanitizeInput = (input: string): string => {
  const purify = getDOMPurify();

  // Step 1: Decode the input multiple times
  const decoded = decodeInput(input);

  // Step 2: Sanitize the decoded input
  const sanitized = purify.sanitize(decoded);

  // Step 3: Check for dangerous patterns in both decoded and sanitized input
  checkDangerousPatterns(decoded);
  checkDangerousPatterns(sanitized);

  // Step 4: Ensure sanitized input is printable and non-empty
  if (sanitized.trim().length === 0 || /[\x00-\x1F\x7F-\x9F]/.test(sanitized)) {
    throw new Error(`Sanitization failed, potentially dangerous: ${input}`);
  }

  // Step 5: Ensure the sanitized input matches the decoded input (optional)
  if (sanitized !== decoded) {
    throw new Error(`Input altered after sanitization: ${input}`);
  }

  return sanitized;
};

export const sanitizeObject = <T>(input: T): T => {
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
};

