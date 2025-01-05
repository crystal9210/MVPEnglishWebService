import { ILLMService } from "@/interfaces/services/ILLMService";
import { OpenAI, AzureOpenAI, type OpenAIClient } from "@/lib/openai";
import { injectable, inject } from "tsyringe";

// ユーザー
//    |
//    | (1) 問題選択と質問入力
//    v
// UIコンポーネント（React）
//    |
//    | (2) POST /api/ask { question, problemId }
//    v
// サーバーサイド（Next.js API Route）
//    |
//    | (3) データバリデーション
//    | (4) 問題取得
//    | (5) 埋め込み確認
//    | (6) コンテキスト生成
//    | (7) RAGServiceで関連文書検索
//    | (8) LLMServiceで回答生成
//    |
//    v
// サーバーサイド
//    |
//    | (9) レスポンス送信 { answer }
//    v
// ユーザー

/**
 * LLMServiceOptions:
 *   - Configuration options for LLMService.
 */
export interface LLMServiceOptions {
    useAzure?: boolean;
    azure?: {
        endpoint?: string;
        deployment?: string;
        apiKey?: string;
        apiVersion?: string;
    };
    openai?: {
        apiKey?: string;
    };
}

/**
 *   - Wraps the OpenAI or AzureOpenAI client.
 *   - Provides methods to generate completions and retrieve embeddings.
 */
@injectable()
export class LLMService implements ILLMService {
    private client: OpenAIClient;

    /**
     * Constructor:
     *   - Injects OpenAI or AzureOpenAI client based on configuration.
     * @param opts - Configuration options.
     */
    constructor(@inject("LLMServiceOptions") opts: LLMServiceOptions) {
        if (opts.useAzure) {
            if (
                !opts.azure?.apiKey ||
                !opts.azure?.endpoint ||
                !opts.azure?.deployment ||
                !opts.azure?.apiVersion
            ) {
                throw new Error("Azure OpenAI configuration is incomplete.");
            }
            // Initialize AzureOpenAI client
            this.client = new AzureOpenAI({
                endpoint: opts.azure.endpoint,
                apiKey: opts.azure.apiKey,
                apiVersion: opts.azure.apiVersion,
                deployment: opts.azure.deployment,
                dangerouslyAllowBrowser: false, // Set as per security requirements
            });
        } else {
            if (!opts.openai?.apiKey) {
                throw new Error("OpenAI API key is required.");
            }
            // Initialize OpenAI client
            this.client = new OpenAI({
                apiKey: opts.openai.apiKey,
                dangerouslyAllowBrowser: false, // Set as per security requirements
            });
        }
    }

    /**
     * chatCompletion:
     *   - Generates a chat completion based on the provided prompt.
     * @param prompt - The input prompt.
     * @param model - The model to use (default: 'gpt-3.5-turbo').
     * @returns The generated completion text.
     */
    async chatCompletion(
        prompt: string,
        model: string = "gpt-3.5-turbo"
    ): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800,
            });

            return response.choices[0]?.message?.content ?? "";
        } catch (error) {
            // TODO
            // Log error or handle accordingly
            throw new Error(
                `Chat completion failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    /**
     * generateCompletion:
     *   - Alias for chatCompletion.
     * @param prompt - The input prompt.
     * @param model - The model to use.
     * @returns The generated completion text.
     */
    async generateCompletion(
        prompt: string,
        model: string = "gpt-3.5-turbo"
    ): Promise<string> {
        return this.chatCompletion(prompt, model);
    }

    /**
     * getEmbedding:
     *   - Retrieves the embedding vector for a given text.
     * @param text - The input text.
     * @param model - The embedding model to use (default: 'text-embedding-ada-002').
     * @returns The embedding vector.
     */
    async getEmbedding(
        text: string,
        model: string = "text-embedding-ada-002"
    ): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model,
                input: text,
            });

            // Assuming response.data is an array with at least one element
            if (response.data.length > 0 && response.data[0].embedding) {
                return response.data[0].embedding;
            } else {
                throw new Error("Failed to get embedding.");
            }
        } catch (error) {
            // Log error or handle accordingly
            throw new Error(
                `Get embedding failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
}
