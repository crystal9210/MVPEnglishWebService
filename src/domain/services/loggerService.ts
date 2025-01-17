import {
    createLogger,
    transports,
    format,
    Logger as WinstonLogger,
} from "winston";
import { Loggly } from "winston-loggly-bulk";
import { injectable } from "tsyringe";
import dotenv from "dotenv";
import { ILoggerService } from "@/interfaces/services/ILoggerService";

dotenv.config();

/**
 * LoggerService implements ILoggerService using Winston.
 * Provides logging capabilities with support for console, file, and Loggly transports.
 */
@injectable()
export class LoggerService implements ILoggerService {
    private logger: WinstonLogger;

    /**
     * Initializes the LoggerService with configured transports and formats.
     */
    constructor() {
        const logLevel = process.env.LOG_LEVEL || "info";
        const logFormat = format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        );

        const loggerTransports = [
            new transports.Console({
                level: logLevel,
                format: format.combine(format.colorize(), format.simple()),
            }),
            // Conditional file logging based on environment variable
            ...(process.env.LOG_TO_FILE === "true"
                ? [
                      new transports.File({
                          filename: "logs/error.log",
                          level: "error",
                      }),
                      new transports.File({ filename: "logs/combined.log" }),
                  ]
                : []),
            // Conditional Loggly logging based on environment variables
            ...(process.env.LOGGLY_TOKEN && process.env.LOGGLY_SUBDOMAIN
                ? [
                      new Loggly({
                          token: process.env.LOGGLY_TOKEN!,
                          subdomain: process.env.LOGGLY_SUBDOMAIN!,
                          tags: ["Winston-NodeJS"],
                          json: true,
                      }),
                  ]
                : []),
        ];

        this.logger = createLogger({
            level: logLevel,
            format: logFormat,
            transports: loggerTransports,
            exceptionHandlers: [
                new transports.File({ filename: "logs/exceptions.log" }),
            ],
            exitOnError: false, // Do not exit on handled exceptions
        });
    }

    /**
     * Logs an informational message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    info(message: string, meta?: Record<string, unknown>) {
        this.logger.info(message, meta);
    }

    /**
     * Logs a warning message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    warn(message: string, meta?: Record<string, unknown>) {
        this.logger.warn(message, meta);
    }

    /**
     * Logs an error message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    error(message: string, meta?: Record<string, unknown>) {
        this.logger.error(message, meta);
    }

    /**
     * Logs a debug message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    debug(message: string, meta?: Record<string, unknown>) {
        this.logger.debug(message, meta);
    }
}

// --- a sample code for upgrades ---
// import { createLogger, format, transports } from 'winston';
// import 'winston-loggly-bulk';
// import { DatadogTransport } from 'winston-datadog-logs';
// import { injectable } from 'tsyringe';
// import dotenv from 'dotenv';
// dotenv.config();

// @injectable()
// export class LoggerService {
//     public logger;

//     constructor() {
//         // ログフォーマットの設定
//         const logFormat = format.combine(
//             format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//             format.printf(({ timestamp, level, message, ...meta }) => {
//                 return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
//             })
//         );

//         // Logglyトランスポートの設定
//         const logglyTransport = new transports.Loggly({
//             token: process.env.LOGGLY_TOKEN!,
//             subdomain: process.env.LOGGLY_SUBDOMAIN!,
//             tags: ['Winston-NodeJS'],
//             json: true,
//         });

//         // Datadogトランスポートの設定
//         const datadogTransport = new DatadogTransport({
//             api_key: process.env.DATADOG_API_KEY!,
//             hostname: 'my-hostname',
//             service: 'my-service',
//             ddsource: 'nodejs',
//             ddtags: 'env:production,version:1.0.0',
//             json: true,
//         });

//         // ロガーの作成
//         this.logger = createLogger({
//             level: 'info',
//             format: logFormat,
//             transports: [
//                 new transports.Console(),
//                 logglyTransport,
//                 datadogTransport,
//             ],
//             exitOnError: false,
//         });
//     }

//     info(message: string, meta?: any) {
//         this.logger.info(message, meta);
//     }

//     warn(message: string, meta?: any) {
//         this.logger.warn(message, meta);
//     }

//     error(message: string, meta?: any) {
//         this.logger.error(message, meta);
//     }

//     debug(message: string, meta?: any) {
//         this.logger.debug(message, meta);
//     }
// }

// // DIコンテナでシングルトンとして登録
// import { container } from 'tsyringe';
// container.registerSingleton(LoggerService);
