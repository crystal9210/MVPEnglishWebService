/* eslint-disable no-unused-vars */
import { APIClient } from "../core";
import type { IEmbeddings } from "@/interfaces/services/openai/IEmbeddings";
import { injectable } from "tsyringe";
import { RequestOptions } from "../core";

/**
 * EmbeddingData
 */
interface EmbeddingData {
    object: string;
    index: number;
    embedding: number[];
    model: string;
}

/**
 * EmbeddingResponse
 */
export interface EmbeddingResponse {
    data: EmbeddingData[];
    model: string;
}

/**
 * Embeddings Create Params
 */
export interface EmbeddingsCreateParams {
    model: string;
    input: string | string[];
}

/**
 * Embeddings Class
 * - Implement requests to OpenAI's embedding-related endpoints.
 */
@injectable()
export class Embeddings implements IEmbeddings {
    constructor(private client: APIClient) {}

    /**
     * Create Method
     * - Generate a text embedding vector.
     * @param params Parameters for embedding generation.
     * @returns Response of embedding generation.
     */
    async create(params: EmbeddingsCreateParams): Promise<EmbeddingResponse> {
        const options: RequestOptions = {
            path: "embeddings",
            method: "POST",
            body: params,
        };
        return this.client.request<EmbeddingResponse>(options);
    }
}
