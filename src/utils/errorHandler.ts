// TODO nextFunctionを入れる必要があるか
import {  Request, Response } from "express";
import { Logger } from "../services/loggerService";
import { CustomError } from "./customError";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
) {
    // デフォルト値の設定
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err instanceof CustomError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
        // 予期しないエラーの処理
        Logger.error(`Unexpected error: ${err.message}`, err);
    }

    Logger.error(
        `Error occurred during processing ${req.method} ${req.url}: ${message}`,
        err
    );

    res.status(statusCode).json({
        success: false,
        message,
    });
}

// --- use case ---
// -- 例:src/controllers/userController.ts --
// import { Request, Response, NextFunction } from "express";
// import { CustomError } from "../utils/customError";
// export async function getUser(req: Request, res: Response, next: NextFunction) {
//     try {
//         const user = await userService.getUserById(req.params.id);
//         if (!user) {
//         throw new CustomError("User not found", 404);
//         }
//         res.json(user);
//     } catch (error) {
//         next(error);
//     }
// }
