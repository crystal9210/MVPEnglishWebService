import { NextRequest } from "next/server";
import { createHash } from "crypto";

/**
 * Generates a fingerprint for a given request.
 */
export class Fingerprinter {
    /**
     * Generates a fingerprint based on request headers.
     * @param req - The NextRequest object.
     * @returns A SHA-256 hash representing the fingerprint.
     */
    generate(req: NextRequest): string {
        const userAgent = req.headers.get("user-agent") || "unknown";
        const acceptLanguage = req.headers.get("accept-language") || "unknown";
        const acceptEncoding = req.headers.get("accept-encoding") || "unknown";
        const connection = req.headers.get("connection") || "unknown";
        // Consider adding more factors for better fingerprinting, but be mindful of privacy.

        return createHash("sha256")
            .update(
                `${userAgent}:${acceptLanguage}:${acceptEncoding}:${connection}`
            )
            .digest("hex");
    }
}
