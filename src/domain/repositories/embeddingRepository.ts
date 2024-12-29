/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import { IEmbeddingRepository } from "@/interfaces/repositories/IEmbeddingRepository";
import { EmbeddingDoc } from "@/utils/ai/ragRetriever";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";

/**
 * EmbeddingRepository:
 *   - Implements IEmbeddingRepository.
 *   - Manages access to EmbeddingDoc entities.
 */
@injectable()
export class EmbeddingRepository implements IEmbeddingRepository {
    private readonly embeddingsCollection: FirebaseFirestore.CollectionReference;

    /**
     * Constructor:
     *   - Injects FirebaseAdmin and LoggerService.
     *   - Initializes the Firestore collection reference.
     * @param firebaseAdmin - Instance of IFirebaseAdmin.
     * @param logger - Instance of ILoggerService.
     */
    constructor(
        @inject("IFirebaseAdmin")
        private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {
        this.embeddingsCollection = this.firebaseAdmin
            .getFirestore()
            .collection("embeddings");
    }

    /**
     * Retrieves all embedding documents.
     * @returns An array of EmbeddingDoc objects.
     */
    async getAllEmbeddingDocs(): Promise<EmbeddingDoc[]> {
        try {
            const querySnap = await this.embeddingsCollection.get();

            return querySnap.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: data.id as string,
                    text: data.text as string,
                    embedding: data.embedding as number[],
                } as EmbeddingDoc;
            });
        } catch (error) {
            this.logger.error("Failed to retrieve embedding documents", {
                error,
            });
            throw error;
        }
    }
}
