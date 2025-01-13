import { NextRequest } from "next/server";

/**
 * Generates a fingerprint for a given request.
 * NOTE: createhash in 'crypto' file module is not adaptable to edge runtime env, so refactored.
 */
export class Fingerprinter {
    /**
     * Generates a fingerprint based on request headers.
     * @param req - The NextRequest object.
     * @returns A Promise that resolves to a SHA-256 hash representing the fingerprint.
     */
    async generate(req: NextRequest): Promise<string> {
        const userAgent = req.headers.get("user-agent") || "unknown";
        const acceptLanguage = req.headers.get("accept-language") || "unknown";
        const acceptEncoding = req.headers.get("accept-encoding") || "unknown";
        const connection = req.headers.get("connection") || "unknown";
        // Consider adding more factors for better fingerprinting, but be mindful of privacy. (TODO)

        const data = `${userAgent}:${acceptLanguage}:${acceptEncoding}:${connection}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        return hashHex;
    }
}

// import { NextRequest } from "next/server";
// import { createHash } from "crypto";

// /**
//  * Generates a fingerprint for a given request.
//  */
// export class Fingerprinter {
//     /**
//      * Generates a fingerprint based on request headers.
//      * @param req - The NextRequest object.
//      * @returns A SHA-256 hash representing the fingerprint.
//      */
//     generate(req: NextRequest): string {
//         const userAgent = req.headers.get("user-agent") || "unknown";
//         const acceptLanguage = req.headers.get("accept-language") || "unknown";
//         const acceptEncoding = req.headers.get("accept-encoding") || "unknown";
//         const connection = req.headers.get("connection") || "unknown";
//         // Consider adding more factors for better fingerprinting, but be mindful of privacy.

//         return createHash("sha256")
//             .update(
//                 `${userAgent}:${acceptLanguage}:${acceptEncoding}:${connection}`
//             )
//             .digest("hex");
//     }
// }
