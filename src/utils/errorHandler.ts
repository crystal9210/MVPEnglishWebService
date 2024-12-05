// TODO 調整
import { NextFunction, Request, Response } from "express";
import { Logger } from "./logger";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    Logger.error(`Error occurred during processing ${req.method} ${req.url}`, err);

    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        success: false,
        message,
    });
}
