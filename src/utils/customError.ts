export class CustomError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode = 500, isOperational: true) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // TODO プロトタイプ汚染または他のスコープへの影響調査
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}
