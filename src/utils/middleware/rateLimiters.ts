import { Cache, CacheEntry } from "./cacheAdapter";
import { SuspiciousBehaviorDetector } from "./suspiciousBehaviorDetector";

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
export class AuthenticatedUserRateLimiter extends RateLimiter {
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
export class AnonymousUserRateLimiter extends RateLimiter {
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
