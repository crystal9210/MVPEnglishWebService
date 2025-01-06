/* eslint-disable no-unused-vars */
import type { IChat } from "@/interfaces/services/openai/IChat";
import type {
    ChatCompletionsCreateParams,
    ChatCompletionsCreateResponse,
} from "./completions";
import { APIClient, RequestOptions } from "../core";

/**
 * Chat Class
 * - Implements IChat to handle chat completions.
 */
export class Chat implements IChat {
    constructor(private client: APIClient) {}

    /**
     * createChatCompletion:
     * - Creates a chat completion.
     * @param params - Parameters for chat completion.
     * @returns The chat completion response.
     */
    async createChatCompletion(
        params: ChatCompletionsCreateParams
    ): Promise<ChatCompletionsCreateResponse> {
        const options: RequestOptions = {
            path: "chat/completions",
            method: "POST",
            body: params,
        };
        return this.client.request<ChatCompletionsCreateResponse>(options);
    }
}
