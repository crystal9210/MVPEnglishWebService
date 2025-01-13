/* eslint-disable no-unused-vars */
import { LRUCache } from "lru-cache";

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
export interface Cache {
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
