/**
 * ChatCompletionChoice Interface
 * - Defines the format of each option in the chat-generated response.
 */
export interface ChatCompletionChoice {
    message?: {
        role: string;
        content?: string;
    };
}

/**
 * ChatCompletionsCreateResponse Interface
 * - Defines the overall format of the chat generated response.
 */
export interface ChatCompletionsCreateResponse {
    choices: ChatCompletionChoice[];
}

/**
 * ChatCompletionsCreateParams Interface
 * - Defines the parameter format for chat creation requests.
 */
export interface ChatCompletionsCreateParams {
    model: string;
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
    max_tokens?: number;
}
