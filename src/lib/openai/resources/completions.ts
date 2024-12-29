import { APIClient } from "../core";
interface ChatCompletionChoice {
    message?: {
        role: string;
        content?: string;
    };
}

interface ChatCompletionsCreateResponse {
    choices: ChatCompletionChoice[];
}

// Minimal shape for "create" param
interface ChatCompletionsCreateParams {
    model: string;
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
    max_tokens?: number;
}

/**
 * Completions Resource
 * - For text completions or chat completions
 * - Here, we do "chat.completions" mocking
 */
export class Completions {
    private client: APIClient;

    constructor(client: APIClient) {
        this.client = client;
    }

    // TODO: The "create" method for chat completions
    async create(
        params: ChatCompletionsCreateParams
    ): Promise<ChatCompletionsCreateResponse> {
        // In real code, you'd do something like:
        // return this.client.request<ChatCompletionsCreateResponse>({
        //   path: `/chat/completions`,
        //   method: 'post',
        //   body: params,
        // });
        // For now, mock a simple response:
        return {
            choices: [
                {
                    message: {
                        role: "assistant",
                        content:
                            "Hello! This is a mock chat completion response!",
                    },
                },
            ],
        };
    }
}
