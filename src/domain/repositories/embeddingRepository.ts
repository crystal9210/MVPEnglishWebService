import { EmbeddingDoc } from "@/schemas/embeddingSchemas";

export class EmbeddingRepository {
    private embeddings: Map<string, EmbeddingDoc> = new Map();

    constructor(initialEmbeddings: EmbeddingDoc[]) {
        initialEmbeddings.forEach((doc) => {
            this.embeddings.set(doc.id, doc);
        });
    }

    /**
     * Retrieves embedding by problem ID.
     * @param problemId The ID of the problem.
     * @returns The corresponding EmbeddingDoc or undefined if not found.
     */
    getEmbeddingByProblemId(problemId: string): EmbeddingDoc | undefined {
        return this.embeddings.get(problemId);
    }

    /**
     * Retrieves all embeddings.
     * @returns An array of EmbeddingDoc.
     */
    getAllEmbeddingDocs(): EmbeddingDoc[] {
        return Array.from(this.embeddings.values());
    }

    /**
     * Updates embedding for a specific problem.
     * @param problemId The ID of the problem.
     * @param embedding The embedding vector.
     */
    updateEmbedding(problemId: string, embedding: number[]): void {
        const doc = this.embeddings.get(problemId);
        if (doc) {
            doc.embedding = embedding;
        }
    }
}
