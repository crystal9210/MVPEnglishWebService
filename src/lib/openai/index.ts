import { APIClient } from "./core";
import * as Errors from "./error";
import * as API from "./resources/index";

export type OpenAIClient = OpenAI | AzureOpenAI;

/**
 * OpenAI Options
 */
export interface OpenAIOptions {
    apiKey?: string;
    baseURL?: string;
    fetch?: typeof fetch;
    dangerouslyAllowBrowser?: boolean;
}

/**
 * OpenAI Client
 */
export class OpenAI extends APIClient {
    chat: API.Chat;
    completions: API.Completions;
    embeddings: API.Embeddings;

    constructor(opts: OpenAIOptions = {}) {
        const baseURL = opts.baseURL ?? "https://api.openai.com/v1";

        super({
            baseURL,
            fetch: opts.fetch,
        });

        this.chat = new API.Chat(this);
        this.completions = new API.Completions(this);
        this.embeddings = new API.Embeddings(this);
    }
}

/**
 * Azure OpenAI Options
 */
export interface AzureOpenAIOptions extends OpenAIOptions {
    endpoint?: string;
    deployment?: string;
    apiVersion?: string;
}

/**
 * AzureOpenAI Client
 */
export class AzureOpenAI extends OpenAI {
    private _deployment: string | undefined;
    apiVersion: string = "";

    constructor(opts: AzureOpenAIOptions = {}) {
        if (!opts.endpoint || !opts.deployment || !opts.apiVersion) {
            throw new Error(
                "AzureOpenAI requires endpoint, deployment, and apiVersion."
            );
        }

        const baseURL = opts.baseURL ?? `${opts.endpoint}/openai`;

        super({
            ...opts,
            baseURL,
        });

        this._deployment = opts.deployment;
        this.apiVersion = opts.apiVersion;
    }

    // 必要に応じてデプロイメント固有のメソッドのオーバーライド
}

// エラークラスのエクスポート
export { Errors };
