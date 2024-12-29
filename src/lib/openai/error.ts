export class OpenAIError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "OpenAIError";
    }
}

// 他にも APIError, AuthenticationError... と多種あるが最低限だけ
