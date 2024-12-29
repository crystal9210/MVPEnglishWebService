import { EmbeddingDoc } from "@/utils/ai/ragRetriever";

/**
 * IEmbeddingRepository:
 *   - Interface for EmbeddingRepository.
 *   - Defines methods for accessing EmbeddingDoc entities.
 */
export interface IEmbeddingRepository {
    /**
     * Retrieves all embedding documents.
     * @returns An array of EmbeddingDoc objects.
     */
    getAllEmbeddingDocs(): Promise<EmbeddingDoc[]>;
}
