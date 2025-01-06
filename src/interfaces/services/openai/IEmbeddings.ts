/* eslint-disable no-unused-vars */
import type {
    EmbeddingsCreateParams,
    EmbeddingResponse,
} from "@/lib/openai/resources/embeddings";

/**
 * IEmbeddings Interface
 * - Define methods for text embedding.
 */
export interface IEmbeddings {
    /**
     * Create
     * - Generate a text embedding vector.
     * @param params Parameters for embedding generation.
     * @returns Response of embedding generation.
     */
    create(params: EmbeddingsCreateParams): Promise<EmbeddingResponse>;
}
