/**
 * Determines if the current environment is development.
 *
 * @returns {boolean} - True if not in production, false otherwise.
 */
export function isDev(): boolean {
    return process.env.NODE_ENV !== "production";
}

/**
 * Determines if HTTP is used for development.
 *
 * @returns {boolean} - True if USE_HTTP_DEV is set to "true", false otherwise.
 */
export function isHttpForDev(): boolean {
    return process.env.USE_HTTP_DEV === "true";
}

/**
 * Determines if HTTPS should be enforced.
 *
 * @returns {boolean} - True if not in development, false otherwise.
 */
export function shouldEnforceHttps(): boolean {
    return !isDev();
}
