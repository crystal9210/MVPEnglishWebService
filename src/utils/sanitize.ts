/**
 * Asynchronously imports the appropriate sanitization function based on the execution environment.
 *
 * - Server-side: imports `sanitizeInput.server.ts`
 * - Client-side: imports `sanitizeInput.client.ts`
 *
 * This approach prevents 'jsdom' from being statically analyzed and bundled on the client side.
 */
const isServer = typeof window === "undefined";

/**
 * sanitizeInputUniversal:
 *  - Sanitizes the input string by delegating to environment-specific sanitization functions.
 *
 * @param input - The input string to sanitize.
 * @returns A promise that resolves to the sanitized string.
 * @throws An error if sanitization fails.
 *
 * @example
 * ```typescript
 * sanitizeInputUniversal("<script>alert('xss')</script>")
 *   .then((sanitized) => {
 *     console.log(sanitized); // expected output: sanitized string without harmful scripts
 *   })
 *   .catch((err) => {
 *     console.error(err.message); // >> handle process of sanitization errors
 *   });
 * ```
 */
export async function sanitizeInputUniversal(input: string): Promise<string> {
    if (isServer) {
        const { sanitizeInputServer } = await import("./sanitizeInput.server");
        return sanitizeInputServer(input);
    } else {
        const { sanitizeInputClient } = await import("./sanitizeInput.client");
        return sanitizeInputClient(input);
    }
}
