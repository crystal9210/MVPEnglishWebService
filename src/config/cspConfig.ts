import { isDev } from "./envConfig";

/**
 * Generates the Content Security Policy (CSP) string based on the environment.
 *
 * @returns {string} - The appropriate CSP string.
 */
export function generateCspString(nonce: string): string {
    // CSP for production: excludes 'unsafe-inline' and recommends using nonce or hash
    const CSP_PROD = [
        "default-src 'self';",
        `script-src 'self' 'nonce-${nonce}';`, // Use nonce for scripts
        `style-src 'self' 'nonce-${nonce}';`, // Use nonce for styles
        "img-src 'self' data:;",
        "connect-src 'self';",
        "font-src 'self';",
        "frame-src 'none';",
        "report-uri /csp-report-endpoint;", // Report URI for CSP violations
    ].join(" ");

    // CSP for development: allows 'unsafe-inline' for convenience
    const CSP_DEV = [
        "default-src 'self';",
        `script-src 'self' 'nonce-${nonce}';`, // Use nonce even in development
        `style-src 'self' 'nonce-${nonce}' 'unsafe-inline';`, // Allow 'unsafe-inline' styles
        "img-src 'self' data:;",
        "connect-src 'self';",
        "font-src 'self';",
        "frame-src 'none';",
        "report-uri /csp-report-endpoint;", // Report URI for CSP violations
    ].join(" ");

    return isDev() ? CSP_DEV : CSP_PROD;
}
