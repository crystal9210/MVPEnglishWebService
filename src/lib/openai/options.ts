/**
 * Basic definition for OpenAI initialization.
 */
export interface OpenAIOptions {
    apiKey?: string;
    baseURL?: string; // default: "https://api.openai.com/v1"
    fetch?: typeof fetch;
    dangerouslyAllowBrowser?: boolean; // e.g. if you want to use fetch in client
}
