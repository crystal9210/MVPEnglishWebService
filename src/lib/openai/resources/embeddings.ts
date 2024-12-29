import { APIClient } from "../core";

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
interface EmbeddingResponse {
    data: EmbeddingData[];
    model: string;
}

/**
 * Embeddings Create Params
 */
interface EmbeddingsCreateParams {
    model: string;
    input: string | string[];
}

/**
 * Embeddings Resource
 */
export class Embeddings {
    private client: APIClient;

    constructor(client: APIClient) {
        this.client = client;
    }

    async create(params: EmbeddingsCreateParams): Promise<EmbeddingResponse> {
        return this.client.request<EmbeddingResponse>({
            path: "/embeddings",
            method: "POST",
            body: params,
        });
    }
}
