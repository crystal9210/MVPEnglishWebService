import {
    rateLimitConfigSchema,
    RateLimitConfig,
} from "@/schemas/middleware/rateLimitConfig";

/**
 * Default configuration for rate limiting.
 */
const parsedConfig = rateLimitConfigSchema.safeParse({
    anonymous: {
        requestsPerMinute: 100,
        suspiciousIpChangeLimit: 5,
    },
    authenticated: {
        requestsPerMinute: 200,
    },
    cache: {
        maxSize: 10000,
        ttl: 60 * 1000,
    },
    paths: {
        "/api/sensitive": {
            requestsPerMinute: 10, // Stricter limit for sensitive API
            ttl: 30 * 1000, // Shorter TTL
        },
        "/admin": {
            requestsPerMinute: 50, // Stricter limit for admin panel
            ttl: 60 * 1000, // Shorter TTL
        },
    },
});

if (!parsedConfig.success) {
    console.error("Rate limit config validation failed", parsedConfig.error);
    throw new Error("Invalid rate limit configuration");
}

export const rateLimitConfig: RateLimitConfig = parsedConfig.data;
