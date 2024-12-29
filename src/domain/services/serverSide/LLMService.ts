import { OpenAI, AzureOpenAI, type OpenAIClient } from '@/lib/openai';

export interface LLMServiceOptions {
    useAzure?: boolean;
    azure?: {
        endpoint?: string;
        deployment?: string;
        apiKey?: string;
        apiVersion?: string;
    };
    openai?: {
        apiKey?: string;
    };
}

/**
 * LLMService:
 *   - wraps the Stainless-generated `OpenAI` or `AzureOpenAI` client
 *   - provides methods to run chat completions and get embeddings
 */
export class LLMService {
    private client: OpenAIClient;

    constructor(opts: LLMServiceOptions) {
        if (opts.useAzure) {
        // AzureOpenAI
        this.client = new AzureOpenAI({
            endpoint: opts.azure?.endpoint,
            apiKey: opts.azure?.apiKey,
            apiVersion: opts.azure?.apiVersion,
            deployment: opts.azure?.deployment,
            dangerouslyAllowBrowser: false, // or true if needed
        });
        } else {
        // normal OpenAI
        this.client = new OpenAI({
            apiKey: opts.openai?.apiKey,
            dangerouslyAllowBrowser: false,
        });
        }
    }

    /**
     * chatCompletion: use the `chat.completions.create` from the stainless client
     */
    async chatCompletion(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
        const response = await this.client.chat.completions.create({
        model,
        messages: [
            { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        });

        return response.choices[0]?.message?.content ?? '';
    }

    /**
     * getEmbedding: Get the embedding vector for a given text
     */
    async getEmbedding(text: string, model = 'text-embedding-ada-002'): Promise<number[]> {
        const response = await this.client.embeddings.create({
        model,
        input: text,
        });

        // Assuming response.data is an array with at least one element
        if (response.data.length > 0 && response.data[0].embedding) {
        return response.data[0].embedding;
        } else {
        throw new Error('Failed to get embedding');
        }
    }

    /**
     * (Optional) generateCompletion:
     *   If you prefer text completions endpoint, you might do:
     *     this.client.completions.create(...)
     *   But this example focuses on chat endpoints.
     */
    async generateCompletion(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
        return this.chatCompletion(prompt, model);
    }
}
