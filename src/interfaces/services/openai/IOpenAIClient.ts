import type { IChat } from "@/interfaces/services/openai/IChat";
import type { IEmbeddings } from "@/interfaces/services/openai/IEmbeddings";

/**
 * OpenAIClient's Interface
 * - Defines access to resources (Chat, Embeddings) provided by OpenAI clients.
 */
export interface IOpenAIClient {
    chat: IChat;
    embeddings: IEmbeddings;
}
