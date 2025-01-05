/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import { LLMService } from "./LLMService";
import { ragSearchEmbeddings } from "@/utils/ai/ragRetriever";
// import { EmbeddingDoc } from "@/utils/ai/ragRetriever";
import type { IEmbeddingRepository } from "@/interfaces/repositories/IEmbeddingRepository";
import { IRAGService } from "@/interfaces/services/IRAGService";

/**
 * RAGService:
 *   - Retrieves relevant documents based on a query.
 *   - Generates an answer using LLMService with the retrieved context.
 */
@injectable()
export class RAGService implements IRAGService {
    /**
     * Constructor:
     *   - Injects LLMService and IEmbeddingRepository.
     * @param llmService - Instance of LLMService.
     * @param embeddingRepo - Instance of IEmbeddingRepository.
     */
    constructor(
        @inject("LLMService") private llmService: LLMService,
        @inject("IEmbeddingRepository")
        private embeddingRepo: IEmbeddingRepository
    ) {}

    /**
     * retrieveAndGenerate:
     *   - Retrieves relevant documents based on the query.
     *   - Generates an answer using the LLM with the retrieved context.
     * @param query - The user's search query.
     * @param userContext - Additional context or request from the user.
     * @returns The generated answer.
     */
    async retrieveAndGenerate(
        query: string,
        userContext: string
    ): Promise<string> {
        try {
            // (1) 類似文書の取得
            const embeddingDocs =
                await this.embeddingRepo.getAllEmbeddingDocs();
            const relevantDocs = await ragSearchEmbeddings(
                this.llmService,
                query,
                3,
                embeddingDocs
            );
            const contextSnippet = relevantDocs.map((d) => d.text).join("\n\n");

            // (2) LLM にプロンプト注入
            const prompt = `Context:\n${contextSnippet}\nUserRequest:\n${userContext}\nAnswer:`;
            const answer = await this.llmService.generateCompletion(
                prompt,
                "gpt-3.5-turbo"
            );
            return answer;
        } catch (error) {
            throw new Error(
                `RAG retrieve and generate failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
}
