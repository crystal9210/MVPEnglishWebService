// ok
import { createLogger, transports, format, Logger as WinstonLogger } from "winston";
import { Loggly } from "winston-loggly-bulk";
import { injectable } from 'tsyringe';
import dotenv from 'dotenv';
import { ILoggerService } from "@/interfaces/services/ILoggerService";
dotenv.config();

@injectable()
export class LoggerService implements ILoggerService {
    private logger: WinstonLogger;

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
                format: format.combine(
                    format.colorize(),
                    format.simple()
                ),
            }),
            // ファイルへのログ出力を環境変数で制御
            ...(process.env.LOG_TO_FILE === "true"
                ? [
                    new transports.File({ filename: "logs/error.log", level: "error" }),
                    new transports.File({ filename: "logs/combined.log" }),
                ]
                : []),
            // Logglyなどの外部サービスへのログ出力
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
            exitOnError: false, // 例外発生時にプロセスを終了しない
        });
    }

    info(message: string, meta?: Record<string, unknown>) {
        this.logger.info(message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>) {
        this.logger.warn(message, meta);
    }

    error(message: string, meta?: Record<string, unknown>) {
        this.logger.error(message, meta);
    }

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
