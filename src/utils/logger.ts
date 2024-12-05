// src/utils/logger.ts

import { createLogger, transports, format, Logger as WinstonLogger } from "winston";
import { Loggly } from "winston-loggly-bulk";

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
    ...(process.env.LOGGLY_TOKEN
        ? [
            new Loggly({
            token: process.env.LOGGLY_TOKEN,
            subdomain: process.env.LOGGLY_SUBDOMAIN,
            tags: ["Winston-NodeJS"],
            json: true,
            }),
        ]
        : []),
];

export const Logger: WinstonLogger = createLogger({
    level: logLevel,
    format: logFormat,
    transports: loggerTransports,
    exceptionHandlers: [
        new transports.File({ filename: "logs/exceptions.log" }),
    ],
    exitOnError: false, // 例外発生時にプロセスを終了しない
});
