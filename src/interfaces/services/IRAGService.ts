/* eslint-disable no-unused-vars */
/**
 * Interface for RAGService.
 */
export interface IRAGService {
    /**
     * Retrieves relevant documents based on the query and generates an answer.
     * @param query - The user's search query.
     * @param userContext - Additional context or request from the user.
     * @returns The generated answer.
     */
    retrieveAndGenerate(query: string, userContext: string): Promise<string>;
}
