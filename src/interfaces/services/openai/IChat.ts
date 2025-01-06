/* eslint-disable no-unused-vars */
import type {
    ChatCompletionsCreateParams,
    ChatCompletionsCreateResponse,
} from "@/lib/openai/resources/completions";

/**
 * IChat Interface
 * - Defines methods for generating a chat.
 */
export interface IChat {
    /**
     * CreateChatCompletion
     * - Generates responses of a chat format.
     * @param params parameters required for generation of a chat.
     * @returns response of the result of generating a chat from the openai api.
     */
    createChatCompletion(
        params: ChatCompletionsCreateParams
    ): Promise<ChatCompletionsCreateResponse>;
}
