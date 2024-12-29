import DOMPurify, { Config, DOMPurify as DOMPurifyType } from "dompurify";
import { JSDOM } from "jsdom";

import {
    decodeInput,
    checkDangerousPatterns,
    sanitizeObjectCommon,
} from "./sanitizeCommon";

/** DOMPurify configuration for server-side sanitization */
const domPurifyConfigServer: Config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    FORBID_ATTR: [
        "onerror",
        "onclick",
        "onload",
        "onmouseover",
        "onfocus",
        "onchange",
        "onkeydown",
        "onkeyup",
    ],
    FORBID_TAGS: [
        "style",
        "script",
        "iframe",
        "object",
        "embed",
        "link",
        "meta",
        "svg",
        "input",
        "button",
        "textarea",
    ],
    KEEP_CONTENT: false,
};

let serverPurifyInstance: DOMPurifyType | null = null;

/**
 * getServerPurify:
 *  - Creates and configures a server-side instance of DOMPurify using jsdom.
 *
 * @returns The configured DOMPurify instance.
 */
function getServerPurify(): DOMPurifyType {
    if (serverPurifyInstance) return serverPurifyInstance;
    const { window } = new JSDOM("");
    // Cast to avoid type errors
    serverPurifyInstance = DOMPurify(
        window as unknown as Window & typeof globalThis
    );
    serverPurifyInstance.setConfig(domPurifyConfigServer);
    return serverPurifyInstance;
}

/**
 * sanitizeInputServer:
 *  - Sanitizes the input string on the server side.
 *  - Ensures that the input does not contain any disallowed patterns or tags.
 *
 * @param input - The input string to sanitize.
 * @returns The sanitized string.
 * @throws An error if sanitization fails or if dangerous patterns are detected.
 *
 * @example
 * ```typescript
 * try {
 *   const safeInput = sanitizeInputServer("<script>alert('xss')</script>");
 *   console.log(safeInput); // expected output: sanitized string without scripts.
 * } catch (err) {
 *   console.error(err.message); // >> Some implementation is defined here to handle
 * }
 * ```
 */
export function sanitizeInputServer(input: string): string {
    const purify = getServerPurify();

    // 1. Decode the input
    const decoded = decodeInput(input);

    // 2. Sanitize the decoded input
    const sanitized = purify.sanitize(decoded);

    // 3. Check for dangerous patterns in both decoded and sanitized inputs
    checkDangerousPatterns(decoded);
    checkDangerousPatterns(sanitized);

    // 4. Ensure the sanitized input is not empty or contains control characters
    if (
        sanitized.trim().length === 0 ||
        /[\x00-\x1F\x7F-\x9F]/.test(sanitized)
    ) {
        throw new Error(`Sanitization failed, potentially dangerous: ${input}`);
    }

    // 5. Ensure the sanitized input matches the decoded input
    if (sanitized !== decoded) {
        throw new Error(`Input altered after sanitization: ${input}`);
    }

    return sanitized;
}

/**
 * sanitizeObjectServer:
 *  - Sanitizes an object by recursively sanitizing its string properties.
 *
 * @param input - The object to sanitize.
 * @returns A promise that resolves to the sanitized object.
 * @throws An error if sanitization fails for any property.
 *
 * @example
 * ```typescript
 * const userData = { comment: "<script>alert('xss')</script>" };
 * sanitizeObjectServer(userData)
 *   .then((sanitizedData) => {
 *     console.log(sanitizedData); // expected output: sanitized object without scripts.
 *   })
 *   .catch((err) => {
 *     console.error(err.message); // >> Some implementation is defined here to handle sanitization errors.
 *   });
 * ```
 */
export async function sanitizeObjectServer<T>(input: T): Promise<T> {
    return sanitizeObjectCommon(input, async (str) => {
        return sanitizeInputServer(str);
    });
}
