import { ILLMService } from "@/interfaces/services/ILLMService";
import type { IOpenAIClient } from "@/interfaces/services/openai/IOpenAIClient";
import { ChatCompletionsCreateParams } from "@/lib/openai/resources/completions";
import { EmbeddingsCreateParams } from "@/lib/openai/resources/embeddings";
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
 * - Simplified version for only OpenAI usage (no Azure).
 */
export interface LLMServiceOptions {
    openai: {
        apiKey: string;
    };
}

/**
 * LLMService implements ILLMService with OpenAI client only.
 */
@injectable()
export class LLMService implements ILLMService {
    private openai: IOpenAIClient;

    /**
     * Constructor:
     * - Injects IOpenAIClient from DI container.
     * @param openai - The OpenAI client instance.
     */
    constructor(@inject("IOpenAIClient") openai: IOpenAIClient) {
        this.openai = openai;
    }

    /**
     * chatCompletion:
     * - Generates chat completions using OpenAI's Chat API.
     * @param prompt - User's input prompt.
     * @param model - Model to use (default: 'gpt-3.5-turbo').
     * @returns Generated answer.
     */
    async chatCompletion(
        prompt: string,
        model: string = "gpt-3.5-turbo"
    ): Promise<string> {
        try {
            const params: ChatCompletionsCreateParams = {
                model,
                messages: [{ role: "user" as const, content: prompt }],
                max_tokens: 800,
            };
            const response = await this.openai.chat.createChatCompletion(
                params
            );
            return response.choices[0]?.message?.content ?? "";
        } catch (error) {
            throw new Error(
                `Chat completion failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    /**
     * generateCompletion:
     * - Alias to chatCompletion for convenience.
     * @param prompt - User's input prompt.
     * @param model - Model to use.
     * @returns Generated answer.
     */
    async generateCompletion(
        prompt: string,
        model: string = "gpt-3.5-turbo"
    ): Promise<string> {
        return this.chatCompletion(prompt, model);
    }

    /**
     * getEmbedding:
     * - Retrieves embeddings for the given text.
     * @param text - Text to retrieve embedding for.
     * @param model - Embedding model to use (default: 'text-embedding-ada-002').
     * @returns Embedding vector.
     */
    async getEmbedding(
        text: string,
        model: string = "text-embedding-ada-002"
    ): Promise<number[]> {
        try {
            const params: EmbeddingsCreateParams = {
                model,
                input: text,
            };
            const response = await this.openai.embeddings.create(params);
            if (response.data.length > 0 && response.data[0].embedding) {
                return response.data[0].embedding;
            } else {
                throw new Error("Failed to get embedding: empty result.");
            }
        } catch (error) {
            throw new Error(
                `Get embedding failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
}
