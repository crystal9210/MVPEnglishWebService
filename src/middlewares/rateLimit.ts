/**
 * Middleware for rate limiting and spoofing detection.
 * - Uses a combination of IP, user ID, and fingerprint for caching.
 * - Detects suspicious patterns like rapid changes in IPs or fingerprints.
 */
/* eslint-disable no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import {
    SuspiciousBehaviorDetector,
    AnonymousUserRateLimiter,
    AuthenticatedUserRateLimiter,
    LRUCacheAdapter,
    Fingerprinter,
} from "@/utils/middleware";
import { getClientIp } from "../utils/getClientIp";

/**
 * Configuration for rate limiting.
 */
interface RateLimitConfig {
    /** Configuration for anonymous users. */
    anonymous: {
        /** Maximum number of requests allowed per minute. */
        requestsPerMinute: number;
        /** Threshold for detecting suspicious IP changes. */
        suspiciousIpChangeLimit: number;
    };
    /** Configuration for authenticated users. */
    authenticated: {
        /** Maximum number of requests allowed per minute. */
        requestsPerMinute: number;
    };
    /** Configuration for the cache. */
    cache: {
        /** Maximum number of entries in the LRU cache. */
        maxSize: number;
        /** Time-to-live (TTL) for cache entries in milliseconds. */
        ttl: number;
    };
    /** Configuration for the specific paths. */
    paths: {
        [key: string]: {
            /** Maximum number of requests allowed per minute. */
            requestsPerMinute: number;
            /** Time-to-live (TTL) for cache entries in milliseconds. */
            ttl: number;
        };
    };
}

/**
 * Default configuration for rate limiting.
 */
const defaultConfig: RateLimitConfig = {
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
};

/**
 * Function to validate the rate limit configuration.
 *
 * This function checks whether the provided configuration object conforms to the
 * RateLimitConfig interface. The use of `any` is intentional to allow flexibility in
 * passing various configurations, especially when configurations are received from dynamic
 * sources like environment variables or external APIs.
 *
 * @param {any} config - The configuration object to validate. The use of `any` is intentional.
 * @returns {config is RateLimitConfig} - A type predicate indicating whether the config is a valid RateLimitConfig.
 */
function isValidRateLimitConfig(config: any): config is RateLimitConfig {
    if (typeof config !== "object" || config === null) return false;

    return (
        typeof config.anonymous === "object" &&
        typeof config.anonymous.requestsPerMinute === "number" &&
        typeof config.anonymous.suspiciousIpChangeLimit === "number" &&
        typeof config.authenticated === "object" &&
        typeof config.authenticated.requestsPerMinute === "number" &&
        typeof config.cache === "object" &&
        typeof config.cache.maxSize === "number" &&
        typeof config.cache.ttl === "number" &&
        typeof config.paths === "object"
    );
}

/**
 * Middleware for rate limiting.
 *
 * This middleware applies rate limits based on the request's authentication status and
 * the request path. It uses a combination of IP address, user ID, and fingerprint to
 * determine the rate limits and detect suspicious behavior.
 *
 * @param {NextRequest} req - The incoming request object.
 * @param {RateLimitConfig} [config] - Optional. Configuration for rate limiting. If not provided, defaultConfig is used.
 * @returns {NextResponse | undefined} - A response object if the request is rate limited, otherwise undefined.
 */
export function rateLimitMiddleware(
    req: NextRequest,
    config?: RateLimitConfig
): NextResponse | undefined {
    // Ensure that effectiveConfig is never undefined
    const effectiveConfig = isValidRateLimitConfig(config)
        ? { ...defaultConfig, ...config }
        : defaultConfig;

    // Use effectiveConfig for the rest of the logic
    const ip = getClientIp(req);
    const userId = req.headers.get("x-user-id");
    const fingerprint = fingerprinter.generate(req);

    // Ensure nextUrl exists and has a pathname
    const pathname =
        req.nextUrl && req.nextUrl.pathname ? req.nextUrl.pathname : "/";
    // Get specific configuration for the requested path
    const pathConfig = effectiveConfig.paths[pathname] || {};

    if (userId) {
        // Authenticated user
        const limit =
            pathConfig.requestsPerMinute ||
            effectiveConfig.authenticated.requestsPerMinute;
        const ttl = pathConfig.ttl || effectiveConfig.cache.ttl;
        const authenticatedRateLimiter = new AuthenticatedUserRateLimiter(
            cache,
            limit,
            ttl
        );
        if (authenticatedRateLimiter.isRateLimited(userId, ip)) {
            return NextResponse.json(
                { error: "Too Many Requests" },
                { status: 429 }
            );
        }
    } else {
        // Anonymous user
        const limit =
            pathConfig.requestsPerMinute ||
            effectiveConfig.anonymous.requestsPerMinute;
        const ttl = pathConfig.ttl || effectiveConfig.cache.ttl;
        const anonymousRateLimiter = new AnonymousUserRateLimiter(
            cache,
            limit,
            ttl,
            detector
        );
        if (anonymousRateLimiter.isRateLimited(fingerprint, ip)) {
            return NextResponse.json(
                { error: "Too Many Requests" },
                { status: 429 }
            );
        }
    }

    return NextResponse.next();
}

// Initialize cache and other dependencies
const cache = new LRUCacheAdapter(
    defaultConfig.cache.maxSize,
    defaultConfig.cache.ttl
);
const fingerprinter = new Fingerprinter();
export const detector = new SuspiciousBehaviorDetector(
    defaultConfig.anonymous.suspiciousIpChangeLimit
);

export {
    fingerprinter,
    cache,
    AuthenticatedUserRateLimiter,
    AnonymousUserRateLimiter,
    SuspiciousBehaviorDetector,
    defaultConfig as rateLimitConfig,
};
