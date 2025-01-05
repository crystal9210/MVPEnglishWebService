/* eslint-disable no-unused-vars */
/**
 * Interface for LLMService.
 */
export interface ILLMService {
    /**
     * Generates a chat completion based on the provided prompt.
     * @param prompt - The input prompt.
     * @param model - The model to use (default: 'gpt-3.5-turbo').
     * @returns The generated completion text.
     */
    chatCompletion(prompt: string, model?: string): Promise<string>;

    /**
     * Alias for chatCompletion.
     * @param prompt - The input prompt.
     * @param model - The model to use.
     * @returns The generated completion text.
     */
    generateCompletion(prompt: string, model?: string): Promise<string>;

    /**
     * Retrieves the embedding vector for a given text.
     * @param text - The input text.
     * @param model - The embedding model to use (default: 'text-embedding-ada-002').
     * @returns The embedding vector.
     */
    getEmbedding(text: string, model?: string): Promise<number[]>;
}
