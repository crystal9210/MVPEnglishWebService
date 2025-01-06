import { injectable, inject } from "tsyringe";
import { APIClient } from "./core";
import { Chat, Embeddings } from "./resources/index";
import type { LLMServiceOptions } from "@/domain/services/serverSide/LLMService";
import type { IOpenAIClient } from "@/interfaces/services/openai/IOpenAIClient";
import type { IChat } from "@/interfaces/services/openai/IChat";
import type { IEmbeddings } from "@/interfaces/services/openai/IEmbeddings";

@injectable()
export class OpenAI extends APIClient implements IOpenAIClient {
    chat: IChat;
    embeddings: IEmbeddings;

    constructor(@inject("LLMServiceOptions") opts: LLMServiceOptions) {
        if (!opts.openai?.apiKey) {
            throw new Error("OpenAI API key is required.");
        }
        // const baseURL = opts.useAzure
        //     ? opts.azure!.endpoint
        //     : "https://api.openai.com/v1";

        super({
            baseURL: "https://api.openai.com/v1/",
            apiKey: opts.openai.apiKey,
            fetch: undefined, // >> configure custom fetch if needed.
        });

        this.chat = new Chat(this);
        this.embeddings = new Embeddings(this);
    }
}
