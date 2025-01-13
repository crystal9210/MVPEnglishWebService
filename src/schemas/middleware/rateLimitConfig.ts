import { z } from "zod";

/**
 * Zod schema for RateLimitConfig.
 */
export const rateLimitConfigSchema = z.object({
    anonymous: z.object({
        requestsPerMinute: z.number().int().positive(),
        suspiciousIpChangeLimit: z.number().int().nonnegative(),
    }),
    authenticated: z.object({
        requestsPerMinute: z.number().int().positive(),
    }),
    cache: z.object({
        maxSize: z.number().int().positive(),
        ttl: z.number().int().positive(),
    }),
    paths: z.record(
        z.object({
            requestsPerMinute: z.number().int().positive(),
            ttl: z.number().int().positive(),
        })
    ),
});

export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;
