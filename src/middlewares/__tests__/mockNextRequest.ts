/* eslint-disable no-unused-vars */
import { DomainLocale } from "next/dist/server/config";
import { NextURL } from "next/dist/server/web/next-url";
import type { OutgoingHttpHeaders } from "http";
import type { I18NProvider } from "next/dist/server/lib/i18n-provider";
import { I18NConfig } from "next/dist/server/config-shared";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

type HeadersInit = Headers | [string, string][] | Record<string, string>;

interface BaseIterator<T> extends Iterator<T> {
    [Symbol.iterator](): BaseIterator<T>;
    [Symbol.toStringTag]: string;
    [Symbol.dispose](): void;
    map<U>(callbackfn: (value: T, index: number) => U): BaseIterator<U>;
    filter(callbackfn: (value: T, index: number) => boolean): BaseIterator<T>;
    flatMap<U>(callbackfn: (value: T, index: number) => U[]): BaseIterator<U>;
    reduce: {
        (
            callbackfn: (
                previousValue: T,
                currentValue: T,
                currentIndex: number
            ) => T
        ): T;
        <U>(
            callbackfn: (
                previousValue: U,
                currentValue: T,
                currentIndex: number
            ) => U,
            initialValue: U
        ): U;
    };
    some(callbackfn: (value: T, index: number) => boolean): boolean;
    find(callbackfn: (value: T, index: number) => boolean): T | undefined;
    every(callbackfn: (value: T, index: number) => boolean): boolean;
    findIndex(callbackfn: (value: T, index: number) => boolean): number;
    take(limit: number): BaseIterator<T>;
    drop(limit: number): BaseIterator<T>;
    toArray(): T[];
    forEach(callbackfn: (value: T, index: number) => void): void;
}

/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface IteratorObject<T, TReturn = undefined, TNext = undefined>
    extends BaseIterator<T> {
    /** Identifies this as an IteratorObject instance */
    readonly _type: "IteratorObject";
}
/* eslint-enable @typescript-eslint/no-empty-interface */
/* eslint-enable @typescript-eslint/no-unused-vars */

interface HeadersIterator<T> extends Iterator<T> {
    [Symbol.iterator](): HeadersIterator<T>;
    [Symbol.toStringTag]: string;
    [Symbol.dispose](): void;
    map<U>(callbackfn: (value: T, index: number) => U): HeadersIterator<U>;
    filter(
        callbackfn: (value: T, index: number) => boolean
    ): HeadersIterator<T>;
    flatMap<U>(
        callbackfn: (value: T, index: number) => U[]
    ): HeadersIterator<U>;
    reduce<U>(
        callbackfn: (previousValue: U, currentValue: T) => U,
        initialValue: U
    ): U;
    some(callbackfn: (value: T) => boolean): boolean;
    find(callbackfn: (value: T) => boolean): T | undefined;
    every(callbackfn: (value: T) => boolean): boolean;
    findIndex(callbackfn: (value: T) => boolean): number;
    take(limit: number): HeadersIterator<T>;
    drop(limit: number): HeadersIterator<T>;
    toArray(): T[];
    forEach(callbackfn: (value: T, index: number) => void): void;
}

// Headers のモック
class MockHeaders implements Headers {
    private headerMap: Map<string, string>;

    constructor(init?: HeadersInit) {
        this.headerMap = new Map<string, string>();
        if (init) {
            if (init instanceof Headers) {
                init.forEach((value, key) => {
                    this.headerMap.set(key.toLowerCase(), value);
                });
            } else if (Array.isArray(init)) {
                init.forEach(([key, value]) => {
                    this.headerMap.set(key.toLowerCase(), value);
                });
            } else {
                Object.entries(init).forEach(([key, value]) => {
                    this.headerMap.set(key.toLowerCase(), value);
                });
            }
        }
    }

    append(key: string, value: string): void {
        const existing = this.headerMap.get(key.toLowerCase());
        this.headerMap.set(
            key.toLowerCase(),
            existing ? `${existing}, ${value}` : value
        );
    }

    delete(key: string): void {
        this.headerMap.delete(key.toLowerCase());
    }

    get(key: string): string | null {
        return this.headerMap.get(key.toLowerCase()) || null;
    }

    has(key: string): boolean {
        return this.headerMap.has(key.toLowerCase());
    }

    set(key: string, value: string): void {
        this.headerMap.set(key.toLowerCase(), value);
    }

    entries(): IteratorObject<[string, string], undefined, undefined> {
        return this.createHeadersIterator(this.headerMap.entries());
    }

    keys(): IteratorObject<string, undefined, undefined> {
        return this.createHeadersIterator(this.headerMap.keys());
    }

    values(): IteratorObject<string, undefined, undefined> {
        return this.createHeadersIterator(this.headerMap.values());
    }

    [Symbol.iterator](): IteratorObject<
        [string, string],
        undefined,
        undefined
    > {
        return this.entries();
    }

    forEach(
        callback: (value: string, key: string, parent: Headers) => void,
        thisArg?: unknown
    ): void {
        const headersThis = this as unknown as Headers;
        for (const [key, value] of this.headerMap.entries()) {
            callback.call(thisArg, value, key, headersThis);
        }
    }

    getSetCookie(): string[] {
        return [];
    }

    private createHeadersIterator<T>(
        iterator: IterableIterator<T>
    ): IteratorObject<T, undefined, undefined> {
        const values = Array.from(iterator);
        let currentPosition = 0;
        const createNewIterator = <V>(
            array: V[]
        ): IteratorObject<V, undefined, undefined> => {
            return this.createHeadersIterator(array.values());
        };

        return {
            next(): IteratorResult<T, undefined> {
                if (currentPosition >= values.length) {
                    return { done: true, value: undefined };
                }
                return { done: false, value: values[currentPosition++] };
            },

            [Symbol.iterator]() {
                return this;
            },
            [Symbol.toStringTag]: "HeadersIterator",
            _type: "IteratorObject" as const,
            [Symbol.dispose](): void {},

            map<U>(
                callbackfn: (value: T, index: number) => U
            ): IteratorObject<U, undefined, undefined> {
                return createNewIterator(values.map(callbackfn));
            },

            filter(
                callbackfn: (value: T, index: number) => boolean
            ): IteratorObject<T, undefined, undefined> {
                return createNewIterator(values.filter(callbackfn));
            },

            flatMap<U>(
                callbackfn: (value: T, index: number) => U[]
            ): IteratorObject<U, undefined, undefined> {
                return createNewIterator(values.flatMap(callbackfn));
            },

            reduce<U>(
                callbackfn: (
                    previousValue: U | T,
                    currentValue: T,
                    currentIndex: number
                ) => U | T,
                initialValue?: U
            ): U | T {
                if (initialValue !== undefined) {
                    return values.reduce<U>(
                        (prev, curr, idx) => callbackfn(prev, curr, idx) as U,
                        initialValue
                    );
                }
                // 初期値なしの場合、配列が空でないことを確認
                if (values.length === 0) {
                    throw new TypeError(
                        "Reduce of empty array with no initial value"
                    );
                }
                // 最初の要素を初期値として使用
                const [first, ...rest] = values;
                return rest.reduce<T>(
                    (prev, curr, idx) => callbackfn(prev, curr, idx) as T,
                    first
                );
            },

            some(callbackfn: (value: T, index: number) => boolean): boolean {
                return values.some(callbackfn);
            },

            find(
                callbackfn: (value: T, index: number) => boolean
            ): T | undefined {
                return values.find(callbackfn);
            },

            every(callbackfn: (value: T, index: number) => boolean): boolean {
                return values.every(callbackfn);
            },

            findIndex(
                callbackfn: (value: T, index: number) => boolean
            ): number {
                return values.findIndex(callbackfn);
            },

            take(limit: number): IteratorObject<T, undefined, undefined> {
                return createNewIterator(values.slice(0, limit));
            },

            drop(limit: number): IteratorObject<T, undefined, undefined> {
                return createNewIterator(values.slice(limit));
            },

            toArray(): T[] {
                return [...values];
            },

            forEach(callbackfn: (value: T, index: number) => void): void {
                values.forEach(callbackfn);
            },
        };
    }
}

interface Options {
    base?: string | URL;
    headers?: OutgoingHttpHeaders;
    forceLocale?: boolean;
    nextConfig?: {
        basePath?: string;
        i18n?: I18NConfig | null;
        trailingSlash?: boolean;
    };
    i18nProvider?: I18NProvider;
}

const Internal: unique symbol = Symbol.for("Internal");
const INTERNALS: unique symbol = Symbol.for("INTERNALS");

interface InternalType {
    url: URL;
    options: {
        basePath: string;
        buildId?: string;
        locale?: string;
        defaultLocale?: string;
        domainLocale?: DomainLocale;
        trailingSlash?: boolean;
    };
}

class MockNextURL extends URL implements Omit<NextURL, typeof Internal> {
    declare readonly [Internal]: InternalType;

    constructor(input: string | URL, baseOrOpts?: string | URL | Options) {
        const base =
            baseOrOpts instanceof URL || typeof baseOrOpts === "string"
                ? baseOrOpts
                : undefined;
        super(input, base);

        const options =
            baseOrOpts &&
            !(baseOrOpts instanceof URL) &&
            typeof baseOrOpts !== "string"
                ? baseOrOpts
                : {};

        Object.defineProperty(this, Internal, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {
                url: new URL(input, base),
                options: {
                    basePath: options.nextConfig?.basePath || "",
                    locale: options.nextConfig?.i18n?.defaultLocale,
                    trailingSlash: options.nextConfig?.trailingSlash || false,
                },
            },
        });
    }

    private analyze(): void {}

    private formatPathname(): string {
        return this.pathname;
    }

    private formatSearch(): string {
        return this.search;
    }

    get buildId(): string | undefined {
        return this[Internal].options.buildId;
    }

    set buildId(buildId: string | undefined) {
        this[Internal].options.buildId = buildId;
    }

    get locale(): string {
        return this[Internal].options.locale || "";
    }

    set locale(locale: string) {
        this[Internal].options.locale = locale;
    }

    get defaultLocale(): string | undefined {
        return this[Internal].options.defaultLocale;
    }

    get domainLocale(): DomainLocale | undefined {
        return this[Internal].options.domainLocale;
    }

    get searchParams(): URLSearchParams {
        return this[Internal].url.searchParams;
    }

    get host(): string {
        return this[Internal].url.host;
    }

    set host(value: string) {
        this[Internal].url.host = value;
    }

    get hostname(): string {
        return this[Internal].url.hostname;
    }

    set hostname(value: string) {
        this[Internal].url.hostname = value;
    }

    get port(): string {
        return this[Internal].url.port;
    }

    set port(value: string) {
        this[Internal].url.port = value;
    }

    get protocol(): string {
        return this[Internal].url.protocol;
    }

    set protocol(value: string) {
        this[Internal].url.protocol = value;
    }

    get href(): string {
        return this[Internal].url.href;
    }

    set href(url: string) {
        this[Internal].url = new URL(url);
    }

    get origin(): string {
        return this[Internal].url.origin;
    }

    get pathname(): string {
        return this[Internal].url.pathname;
    }

    set pathname(value: string) {
        this[Internal].url.pathname = value;
    }

    get hash(): string {
        return this[Internal].url.hash;
    }

    set hash(value: string) {
        this[Internal].url.hash = value;
    }

    get search(): string {
        return this[Internal].url.search;
    }

    set search(value: string) {
        this[Internal].url.search = value;
    }

    get password(): string {
        return this[Internal].url.password;
    }

    set password(value: string) {
        this[Internal].url.password = value;
    }

    get username(): string {
        return this[Internal].url.username;
    }

    set username(value: string) {
        this[Internal].url.username = value;
    }

    get basePath(): string {
        return this[Internal].options.basePath || "";
    }

    set basePath(value: string) {
        this[Internal].options.basePath = value;
    }

    toString(): string {
        return this[Internal].url.toString();
    }

    toJSON(): string {
        return this.toString();
    }

    clone(): NextURL {
        const cloned = Object.create(MockNextURL.prototype);
        URL.call(cloned, this.href);

        Object.defineProperty(cloned, Internal, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {
                url: new URL(this.href),
                options: { ...this[Internal].options },
            },
        });

        return cloned as NextURL;
    }
}

interface NextRequestInit extends RequestInit {
    nextConfig?: {
        basePath?: string;
        i18n?: I18NConfig | null;
        trailingSlash?: boolean;
    };
}

class MockNextRequest extends Request {
    // INTERNALSプロパティを public として定義（readonlyは不要）
    declare readonly [INTERNALS]: {
        cookies: RequestCookies;
        url: string;
        nextUrl: NextURL;
    };

    constructor(input: URL | RequestInfo, init?: NextRequestInit) {
        super(input, init);
        const url = new URL(
            input instanceof Request ? input.url : input.toString()
        );

        const mockNextUrl = new MockNextURL(url, {
            nextConfig: init?.nextConfig,
        }) as unknown as NextURL;

        Object.defineProperty(this, INTERNALS, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {
                cookies: new RequestCookies(this.headers),
                url: url.toString(),
                nextUrl: mockNextUrl,
            },
        });
    }

    get cookies(): RequestCookies {
        return this[INTERNALS].cookies;
    }

    get nextUrl(): NextURL {
        return this[INTERNALS].nextUrl;
    }

    get url(): string {
        return this[INTERNALS].url;
    }

    get page(): void {
        console.warn("`page` has been deprecated in favour of `URLPattern`");
        return undefined;
    }

    get ua(): void {
        console.warn("`ua` has been removed in favour of `userAgent` function");
        return undefined;
    }
}
export { MockHeaders, MockNextURL, MockNextRequest };
