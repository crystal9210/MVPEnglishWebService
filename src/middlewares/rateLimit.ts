/**
 * Middleware for rate limiting and spoofing detection.
 * - Uses a combination of IP, user ID, and fingerprint for caching.
 * - Detects suspicious patterns like rapid changes in IPs or fingerprints.
 */
import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { createHash } from "crypto";

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
 * Represents an entry in the cache.
 */
export type CacheEntry = {
    /** Number of requests made. */
    count: number;
    /** Timestamp of the first request. */
    firstSeen: number;
    /** Set of IP addresses associated with the entry. */
    history: Set<string>;
};

/**
 * Interface for a cache.
 */
interface Cache {
    /**
     * Retrieves an entry from the cache.
     * @param key - The key of the entry.
     * @returns The cached entry, or undefined if not found.
     */
    get(key: string): CacheEntry | undefined;
    /**
     * Adds or updates an entry in the cache.
     * @param key - The key of the entry.
     * @param value - The value of the entry.
     */
    set(key: string, value: CacheEntry): void;
    /**
     * Checks if an entry exists in the cache.
     * @param key - The key of the entry.
     * @returns True if the entry exists, false otherwise.
     */
    has(key: string): boolean;
    /**
     * Clears all entries from the cache.
     */
    clear(): void;
}

/**
 * Implements an LRU (Least Recently Used) cache.
 */
export class LRUCacheAdapter implements Cache {
    private cache: LRUCache<string, CacheEntry>;

    /**
     * Creates an instance of LRUCacheAdapter.
     * @param maxSize - The maximum number of entries in the cache.
     * @param ttl - The time-to-live (TTL) for cache entries in milliseconds.
     */
    constructor(maxSize: number, ttl: number) {
        this.cache = new LRUCache<string, CacheEntry>({
            max: maxSize,
            ttl: ttl,
        });
    }

    /**
     * Retrieves an entry from the cache.
     * @param key - The key of the entry.
     * @returns The cached entry, or undefined if not found.
     */
    get(key: string): CacheEntry | undefined {
        return this.cache.get(key);
    }

    /**
     * Adds or updates an entry in the cache.
     * @param key - The key of the entry.
     * @param value - The value of the entry.
     */
    set(key: string, value: CacheEntry): void {
        this.cache.set(key, value);
    }

    /**
     * Checks if an entry exists in the cache.
     * @param key - The key of the entry.
     * @returns True if the entry exists, false otherwise.
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Clears all entries from the cache.
     */
    clear(): void {
        this.cache.clear();
    }
}

/**
 * Generates a fingerprint for a given request.
 */
class Fingerprinter {
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

/**
 * Detects suspicious behavior based on IP history.
 */
class SuspiciousBehaviorDetector {
    private ipHistoryLimit: number;

    /**
     * Creates an instance of SuspiciousBehaviorDetector.
     * @param ipHistoryLimit - The maximum number of unique IP addresses allowed for a given fingerprint.
     */
    constructor(ipHistoryLimit: number) {
        this.ipHistoryLimit = ipHistoryLimit;
    }

    /**
     * Checks if the current IP address is suspicious based on the history.
     * @param history - The set of IP addresses associated with a fingerprint.
     * @param currentIp - The current IP address.
     * @returns True if the behavior is suspicious, false otherwise.
     */
    isSuspicious(history: Set<string>, currentIp: string): boolean {
        if (!history.has(currentIp)) {
            history.add(currentIp);
            if (history.size > this.ipHistoryLimit) {
                return true; // Too many different IPs for the same fingerprint
            }
        }
        return false;
    }
}

/**
 * Abstract class for rate limiting.
 */
abstract class RateLimiter {
    protected cache: Cache;
    protected limit: number;
    protected ttl: number;
    protected detector: SuspiciousBehaviorDetector | null;

    /**
     * Creates an instance of RateLimiter.
     * @param cache - The cache to use for storing rate limit data.
     * @param limit - The maximum number of requests allowed.
     * @param ttl - The time-to-live (TTL) for cache entries in milliseconds.
     * @param detector - Optional. The SuspiciousBehaviorDetector to use.
     */
    constructor(
        cache: Cache,
        limit: number,
        ttl: number,
        detector?: SuspiciousBehaviorDetector
    ) {
        this.cache = cache;
        this.limit = limit;
        this.ttl = ttl;
        this.detector = detector || null;
    }

    /**
     * Checks if a request is rate limited.
     * @param key - The key to use for rate limiting.
     * @param ip - The IP address of the request.
     * @returns True if the request is rate limited, false otherwise.
     */
    isRateLimited(key: string, ip: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            this.cache.set(key, {
                count: 1,
                firstSeen: Date.now(),
                history: new Set([ip]),
            });
            return false;
        }

        if (this.detector && this.isSuspiciousBehavior(entry, ip)) {
            return true;
        }

        if (entry.count >= this.limit) {
            return true; // Rate limit exceeded
        }

        entry.count++;
        this.cache.set(key, entry); // Update cache with incremented count
        return false;
    }

    /**
     * Checks if the behavior is suspicious based on the cache entry and current IP.
     * @param entry - The cache entry.
     * @param ip - The current IP address.
     * @returns True if the behavior is suspicious, false otherwise.
     */
    protected isSuspiciousBehavior(entry: CacheEntry, ip: string): boolean {
        if (!this.detector) {
            return false;
        }
        return this.detector.isSuspicious(entry.history, ip);
    }

    /**
     * Clears the cache.
     */
    clearCache(): void {
        this.cache.clear();
    }
}

/**
 * Rate limiter for authenticated users.
 */
class AuthenticatedUserRateLimiter extends RateLimiter {
    /**
     * Creates an instance of AuthenticatedUserRateLimiter.
     * @param cache - The cache to use for storing rate limit data.
     * @param limit - The maximum number of requests allowed.
     * @param ttl - The time-to-live (TTL) for cache entries in milliseconds.
     */
    constructor(cache: Cache, limit: number, ttl: number) {
        super(cache, limit, ttl);
    }

    /**
     * Checks if a request from an authenticated user is rate limited.
     * @param userId - The ID of the authenticated user.
     * @param ip - The IP address of the request.
     * @returns True if the request is rate limited, false otherwise.
     */
    isRateLimited(userId: string, ip: string): boolean {
        const key = `user:${userId}`;
        return super.isRateLimited(key, ip);
    }
}

/**
 * Rate limiter for anonymous users.
 */
class AnonymousUserRateLimiter extends RateLimiter {
    /**
     * Creates an instance of AnonymousUserRateLimiter.
     * @param cache - The cache to use for storing rate limit data.
     * @param limit - The maximum number of requests allowed.
     * @param ttl - The time-to-live (TTL) for cache entries in milliseconds.
     * @param detector - The SuspiciousBehaviorDetector to use.
     */
    constructor(
        cache: Cache,
        limit: number,
        ttl: number,
        detector: SuspiciousBehaviorDetector
    ) {
        super(cache, limit, ttl, detector);
    }

    /**
     * Checks if a request from an anonymous user is rate limited.
     * @param fingerprint - The fingerprint of the user.
     * @param ip - The IP address of the request.
     * @returns True if the request is rate limited, false otherwise.
     */
    isRateLimited(fingerprint: string, ip: string): boolean {
        const key = `fp:${fingerprint}:ip:${ip}`;
        return super.isRateLimited(key, ip);
    }
}

/**
 * Utility function to get client IP from request headers.
 *
 * This function extracts the client's IP address by first checking the "x-forwarded-for"
 * header, which may contain a list of IPs if the request has passed through proxies.
 * If "x-forwarded-for" is not present, it falls back to the "x-real-ip" header.
 * If neither header is available, it returns "unknown".
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {string} - The client's IP address, or "unknown" if not found.
 */
const getClientIp = (req: NextRequest): string => {
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");

    if (xForwardedFor) {
        const ips = xForwardedFor.split(",");
        return ips[0].trim();
    } else if (xRealIp) {
        return xRealIp.trim();
    }

    return "unknown";
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
