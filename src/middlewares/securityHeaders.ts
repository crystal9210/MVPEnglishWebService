import { generateCspString } from "@/config/cspConfig";
import { isDev, isHttpForDev } from "@/config/envConfig";
import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { logger } from "@/config/logger";

/**
 * Type definition for security headers used in the middleware.
 */
type SecurityHeaders = {
    /**
     * Content-Security-Policy (CSP)
     * Restricts the sources from which scripts, styles, images, and other resources can be loaded.
     * Helps prevent XSS attacks.
     */
    "Content-Security-Policy": string;

    /**
     * Strict-Transport-Security (HSTS)
     * Instructs browsers to always use HTTPS when accessing the site.
     * Optional because it is applied only in non-development environments.
     */
    "Strict-Transport-Security"?: string;

    /**
     * X-Content-Type-Options
     * Prevents browsers from MIME-sniffing the content type of a response.
     * Reduces the risk of drive-by downloads.
     */
    "X-Content-Type-Options": string;

    /**
     * X-Frame-Options
     * Restricts embedding of the site in iframes, preventing clickjacking attacks.
     */
    "X-Frame-Options": string;

    /**
     * X-XSS-Protection
     * Enables some browsers' built-in XSS protection mechanisms.
     * Note: This is deprecated in many modern browsers but still supported for legacy compatibility.
     */
    "X-XSS-Protection": string;

    /**
     * Referrer-Policy
     * Controls how much referrer information is sent with requests to other sites.
     * Helps enhance user privacy.
     */
    "Referrer-Policy": string;

    /**
     * Permissions-Policy
     * Controls access to browser features like geolocation, microphone, and camera.
     * Helps mitigate over-permissioning by explicitly denying access to unnecessary features.
     */
    "Permissions-Policy": string;

    /**
     * X-Permitted-Cross-Domain-Policies
     * Specifies whether cross-domain requests for Adobe Flash, Adobe Reader, or other plugins are allowed.
     * Prevents unauthorized access to sensitive resources.
     */
    "X-Permitted-Cross-Domain-Policies": string;

    /**
     * Expect-CT
     * Enforces Certificate Transparency to detect and prevent the use of misissued TLS certificates.
     */
    "Expect-CT": string;
};

/**
 * Middleware to set security-related HTTP headers.
 *
 * - In Next.js, generating a response typically ends the middleware chain.
 * - However, to add headers and allow subsequent processing, you need to use
 *   "NextResponse.next() + set headers" approach.
 */
export function securityHeadersMiddleware(req: NextRequest): NextResponse {
    try {
        validateHeaders(req.headers);

        // Allow only specific HTTP methods
        const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
        if (!allowedMethods.includes(req.method)) {
            const res = NextResponse.json(
                { error: "Method Not Allowed" },
                { status: 405 } // >> 405: Method Not Allowed
            );
            applySecurityHeaders(res, "default-src 'none';"); // Should response with security headers applied
            return res;
        }

        // Check URL length to avoid extremely long URLs
        if (req.nextUrl.href.length > 2048) {
            const res = NextResponse.json(
                { error: "URL length exceeds maximum allowed limit" },
                { status: 414 } // >> 414: Request-URI Too Long
            );
            applySecurityHeaders(res, "default-src 'none';");
            return res;
        }

        // Generate a nonce for CSP to allow specific inline scripts/styles
        const nonce = crypto.randomBytes(16).toString("base64");

        // Generate the CSP string based on the environment and the generated nonce
        const cspString = generateCspString(nonce);

        // Validate the generated CSP string (example: ensure it contains "report-uri")
        if (!cspString.includes("report-uri")) {
            throw new Error("Invalid CSP configuration: Missing 'report-uri'");
        }

        // Call "NextResponse.next()" to pass processing to the next handler,
        // while generating a "response object with modified headers"
        const res = NextResponse.next({
            request: {
                headers: req.headers,
            },
        });

        // Apply security headers to the response
        applySecurityHeaders(res, cspString);

        /**
         * Uncomment the following lines if you need to add a nonce to CSP.
         * This allows specific inline scripts and styles by using the generated nonce.
         */
        // const nonce = crypto.randomBytes(16).toString("base64");
        // res.headers.set("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; ${otherDirectives}`);

        /**
         * If you want to debug by outputting the response headers to the console (development environment only)
         */
        if (isDev()) {
            logger.info("Setting Security Headers", {
                headers: Array.from(res.headers.entries()),
            });
        }

        // Finally, return this response object
        // → Subsequent middleware or final handlers will execute with the response containing the added headers
        return res;
    } catch (error) {
        const errorMessage = "Error in securityHeadersMiddleware:";

        if (error instanceof SyntaxError) {
            logger.error(`${errorMessage} Syntax Error`, error);
            return NextResponse.json(
                { error: "Invalid request syntax" },
                { status: 400 }
            );
        } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string" &&
            error.message.startsWith("Invalid header value")
        ) {
            logger.error(errorMessage, error);
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        } else {
            logger.error(errorMessage, error);
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    }
}

/**
 * Apply security headers to the response object.
 * Ensures existing headers are not unnecessarily overwritten.
 */
function applySecurityHeaders(res: NextResponse, cspString: string) {
    /**
     * List of Headers
     * 1) Content-Security-Policy (CSP)
     *    → Restricts the sources from which scripts and styles can be loaded, preventing XSS attacks
     *
     * 2) Strict-Transport-Security (HSTS)
     *    → Instructs browsers to always use HTTPS when accessing the site
     *
     * 3) X-Content-Type-Options
     *    → Prevents browsers from MIME-sniffing the content type, reducing the risk of drive-by downloads
     *
     * 4) X-Frame-Options
     *    → Restricts embedding of the site in iframes, preventing clickjacking attacks
     *
     * 5) X-XSS-Protection
     *    → Enables some browsers' built-in XSS protection mechanisms (deprecated in many modern browsers)
     *
     * 6) Referrer-Policy
     *    → Controls the amount of referrer information sent with requests, enhancing privacy
     *
     * 7) Permissions-Policy
     *    → Controls access to browser features like geolocation, microphone, and camera
     *
     * 8) X-Permitted-Cross-Domain-Policies
     *    → Controls Adobe products' cross-domain policies, preventing unauthorized access
     *
     * 9) Expect-CT
     *    → Enforces Certificate Transparency to detect misissued certificates
     */

    const headersToSet: SecurityHeaders = {
        "Content-Security-Policy": cspString,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "no-referrer",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        "X-Permitted-Cross-Domain-Policies": "none",
        "Expect-CT":
            "max-age=86400, enforce, report-uri='https://example.com/report'",
    };

    // Add Strict-Transport-Security only if the environment is not for development
    if (!isHttpForDev()) {
        headersToSet["Strict-Transport-Security"] =
            "max-age=63072000; includeSubDomains; preload";
    }

    for (const [key, value] of Object.entries(headersToSet)) {
        const existingHeader = res.headers.get(key);

        // ヘッダーが既に存在し、値が異なる場合はエラーを記録して拒否
        if (existingHeader && existingHeader !== value) {
            const errorMsg = `Security rule violation: Header "${key}" has an unexpected value "${existingHeader}". Expected: "${value}".`;
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        // ヘッダーが存在しない場合のみ設定
        if (!existingHeader) {
            res.headers.set(key, value);
        }
    }
}

// Whitelist of allowed headers
const ALLOWED_HEADERS = [
    "content-type",
    "authorization",
    "x-requested-with",
    "accept",
    "user-agent",
    "referer",
    "origin",
    "cookie",
    "accept-language",
    "cache-control",
    "pragma",
    // Add other allowed headers here
];

// Header validation rules
const HEADER_VALIDATION_RULES: { [key: string]: (value: string) => boolean } = {
    "content-type": (value: string) =>
        /^application\/(json|xml)|text\/plain/.test(value),
    authorization: (value: string) => value.startsWith("Bearer "),
    "accept-language": (value: string) => /^[a-zA-Z\- ,]+$/.test(value),
    "cache-control": (value: string) => /^[a-zA-Z0-9\- ,]+$/.test(value),
    pragma: (value: string) => /^[a-zA-Z0-9\- ,]+$/.test(value),
    // Add validation rules for other headers here
};
/**
 * Validate headers to ensure there are no invalid header values.
 * Throws an error if any invalid header value is detected.
 */
export function validateHeaders(headers: Headers) {
    for (const [key, value] of headers.entries()) {
        // 1. ヘッダー名がホワイトリストに存在しない場合はエラーをスロー
        if (!ALLOWED_HEADERS.includes(key.toLowerCase())) {
            const errorMsg = `Invalid header name: ${key}`;
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        // 2. ヘッダー値が空またはヌル文字を含む場合はエラーをスロー
        if (!value || value.includes("\u0000")) {
            const errorMsg = `Invalid header value for ${key}`;
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        // 3. 特定のヘッダーに対してバリデーションルールを適用
        const validationRule = HEADER_VALIDATION_RULES[key.toLowerCase()];
        if (validationRule && !validationRule(value)) {
            const errorMsg = `Invalid header value for ${key}: ${value}`;
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }
    }
}
