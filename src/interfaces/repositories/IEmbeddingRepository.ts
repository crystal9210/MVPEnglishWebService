/* eslint-disable no-unused-vars */
import { EmbeddingDoc } from "@/schemas/embeddingSchemas";

/**
 * Interface for EmbeddingRepository.
 */
export interface IEmbeddingRepository {
    /**
     * Retrieves embedding by problem ID.
     * @param problemId The ID of the problem.
     * @returns The corresponding EmbeddingDoc or undefined if not found.
     */
    getEmbeddingByProblemId(problemId: string): EmbeddingDoc | undefined;

    /**
     * Retrieves all embeddings.
     * @returns An array of EmbeddingDoc.
     */
    getAllEmbeddingDocs(): EmbeddingDoc[];

    /**
     * Updates embedding for a specific problem.
     * @param problemId The ID of the problem.
     * @param embedding The embedding vector.
     */
    updateEmbedding(problemId: string, embedding: number[]): void;
}
