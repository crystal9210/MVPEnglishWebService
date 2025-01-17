// TODO
/* eslint-disable no-unused-vars */
import { generateCspString } from "@/config/cspConfig";
import { isDev, isHttpForDev } from "@/config/envConfig";
import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { logger } from "@/config/logger";
import { getClientIp } from "@/utils/getClientIp";

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
                { status: 405 } // 405: Method Not Allowed
            );
            applySecurityHeaders(res, "default-src 'none';"); // Apply security headers
            return res;
        }

        // Check URL length to avoid extremely long URLs
        if (req.nextUrl.href.length > 2048) {
            const res = NextResponse.json(
                { error: "URL length exceeds maximum allowed limit" },
                { status: 414 } // 414: Request-URI Too Long
            );
            applySecurityHeaders(res, "default-src 'none';"); // Apply security headers
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

        // Pass processing to the next handler with modified headers
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
        // res.headers.set("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; ${otherDirectives}`);

        /**
         * If you want to debug by outputting the response headers to the console (development environment only)
         */
        if (isDev()) {
            const requestIp = getClientIp(req); // getClientIp 関数を使用
            const timestamp = new Date().toISOString();
            logger.info("Setting Security Headers", {
                headers: Array.from(res.headers.entries()),
                requestIp,
                timestamp,
            });
        }

        // Finally, return this response object
        // → Subsequent middleware or final handlers will execute with the response containing the added headers
        return res;
    } catch (error) {
        const errorMessage = "Error in securityHeadersMiddleware:";

        if (error instanceof SyntaxError) {
            logger.error(`${errorMessage} Syntax Error`, { error });
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
            logger.error(errorMessage, { error });
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        } else {
            logger.error(errorMessage, { error });
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

        // If the header already exists with a different value, log an error and throw
        if (existingHeader && existingHeader !== value) {
            const errorMsg = `Security rule violation: Header "${key}" has an unexpected value "${existingHeader}". Expected: "${value}".`;
            logger.error(errorMsg, { expected: value, actual: existingHeader });
            throw new Error(errorMsg);
        }

        // Only set the header if it does not already exist
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
    "sec-fetch-site",
    "sec-fetch-mode",
    "sec-fetch-dest",
    "sec-fetch-user",
    "upgrade-insecure-requests",
    "x-csrftoken",
    "x-xsrf-token",
    "dnt",
    "content-length",
    "access-control-allow-origin",
    "accept-encoding",
    // Add other allowed headers here
];

// Header validation rules
const HEADER_VALIDATION_RULES: { [key: string]: (value: string) => boolean } = {
    "content-type": (value: string) =>
        /^application\/(json|xml)|text\/plain$/.test(value),
    authorization: (value: string) =>
        /^Bearer\s[A-Za-z0-9\-._~+/]+=*$/.test(value),
    "accept-language": (value: string) => /^[a-zA-Z\- ,]+$/.test(value),
    "cache-control": (value: string) => /^[a-zA-Z0-9\- ,]+$/.test(value),
    pragma: (value: string) => /^[a-zA-Z0-9\- ,]+$/.test(value),
    "x-requested-with": (value: string) => /^XMLHttpRequest$/.test(value),
    accept: (value: string) =>
        /^([a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+)(,\s*[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+)*$/.test(
            value
        ),
    "user-agent": (value: string) => value.length > 0 && value.length <= 512,
    referer: (value: string) => isValidUrl(value),
    origin: (value: string) => isValidUrl(value),
    cookie: (value: string) =>
        /^([a-zA-Z0-9\-]+=[^;]+)(;\s*[a-zA-Z0-9\-]+=[^;]+)*$/.test(value),
    "sec-fetch-site": (value: string) =>
        ["none", "same-origin", "same-site", "cross-site"].includes(value),
    "sec-fetch-mode": (value: string) =>
        ["navigate", "no-cors", "cors", "same-origin"].includes(value),
    "sec-fetch-dest": (value: string) =>
        [
            "document",
            "iframe",
            "image",
            "script",
            "style",
            "font",
            "media",
            "worker",
            "nested-processor",
            "report",
        ].includes(value),
    "sec-fetch-user": (value: string) => value === "?1",
    "upgrade-insecure-requests": (value: string) => value === "1",
    "x-csrftoken": (value: string) => /^[a-zA-Z0-9\-_]+$/.test(value),
    "x-xsrf-token": (value: string) => /^[a-zA-Z0-9\-_]+$/.test(value),
    dnt: (value: string) => ["1", "0"].includes(value),
    "content-length": (value: string) =>
        /^\d+$/.test(value) && parseInt(value, 10) <= 1000000, // Example: max size == 1MB
    "access-control-allow-origin": (value: string) =>
        /^https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/.test(value) ||
        value === "*",
    "accept-encoding": (value: string) => /^gzip|deflate|br$/.test(value),
    // Add validation rules for other headers here
};

/**
 * Validate headers to ensure there are no invalid header values.
 * Throws an error if any invalid header value is detected.
 */
export function validateHeaders(headers: Headers) {
    for (const [key, value] of headers.entries()) {
        const lowerKey = key.toLowerCase();

        // If the header name is not in the whitelist, throw an error
        if (!ALLOWED_HEADERS.includes(lowerKey)) {
            const errorMsg = `Invalid header name: ${key}`;
            logger.error(errorMsg, { header: key, value });
            throw new Error(errorMsg);
        }

        // If the header value is empty or contains null characters, throw an error
        if (!value || value.includes("\u0000")) {
            const errorMsg = `Invalid header value for ${key}`;
            logger.error(errorMsg, { header: key, value });
            throw new Error(errorMsg);
        }

        // Apply specific validation rules for certain headers
        const validationRule = HEADER_VALIDATION_RULES[lowerKey];
        if (validationRule && !validationRule(value)) {
            const errorMsg = `Invalid header value for ${key}: ${value}`;
            logger.error(errorMsg, { header: key, value });
            throw new Error(errorMsg);
        }
    }
}

/**
 * Utility function to validate URLs.
 *
 * @param {string} url - The URL string to validate.
 * @returns {boolean} - True if the URL is valid and uses allowed protocols, false otherwise.
 */
function isValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Allow only http and https protocols
        return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
}
