export interface RequestOptions {
    path?: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    query?: Record<string, unknown>;
}

export type Fetch = typeof fetch;

/**
 * APIClient:
 * - Basic HTTP client with JSON body handling.
 * - Not specific to OpenAI; can be re-used for any REST calls.
 */
export class APIClient {
    baseURL: string;
    fetch: Fetch;
    private apiKey: string;

    constructor(opts: { baseURL: string; fetch?: Fetch; apiKey: string }) {
        this.baseURL = opts.baseURL.endsWith("/")
            ? opts.baseURL
            : `${opts.baseURL}/`;
        this.fetch = opts.fetch ?? (globalThis.fetch as Fetch);
        this.apiKey = opts.apiKey;
    }

    async request<T = unknown>(options: RequestOptions): Promise<T> {
        const url = new URL(options.path ?? "", this.baseURL);
        if (options.query) {
            Object.entries(options.query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const response = await this.fetch(url.toString(), {
            method: options.method ?? "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
                ...(options.headers ?? {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `API request failed: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return response.json();
    }
}
