import { promises as fs } from "fs";

/**
 * Supported log levels.
 */
type LogLevel = "info" | "error" | "debug";

/**
 * Log message structure.
 */
interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: string;
    [key: string]: any;
}

/**
 * Logger class for local and edge environments.
 */
class Logger {
    private level: LogLevel;
    private logs: LogMessage[] = []; // Mock storage for Edge environments

    constructor(level: LogLevel) {
        this.level = level;
    }

    /**
     * Writes a log message to the file or local storage.
     */
    private async logToFile(log: LogMessage) {
        const isEdgeRuntime = process.env.NEXT_RUNTIME === "edge";

        if (isEdgeRuntime) {
            // Edge Runtime: Store logs in memory or send to an external service
            this.logs.push(log);
            console.log("[Edge Logger] Log stored in memory:", log);
        } else {
            // Node.js Runtime: Save logs to a file
            const logFile = `./logs/${log.level}.log`;
            try {
                await fs.mkdir("./logs", { recursive: true });
                await fs.appendFile(logFile, JSON.stringify(log) + "\n");
                console.log(`[File Logger] Log written to ${logFile}:`, log);
            } catch (error) {
                console.error("Failed to write log to file:", error);
            }
        }
    }

    async info(message: string, meta?: any) {
        const log: LogMessage = {
            level: "info",
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };
        console.log(JSON.stringify(log));
        await this.logToFile(log);
    }

    async error(message: string, meta?: any) {
        const log: LogMessage = {
            level: "error",
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };
        console.error(JSON.stringify(log));
        await this.logToFile(log);
    }

    async debug(message: string, meta?: any) {
        if (this.level === "debug") {
            const log: LogMessage = {
                level: "debug",
                message,
                timestamp: new Date().toISOString(),
                ...meta,
            };
            console.debug(JSON.stringify(log));
            await this.logToFile(log);
        }
    }
}

// Determine the default log level based on the environment
const isProduction = process.env.NODE_ENV === "production";
const logLevel: LogLevel = isProduction ? "error" : "info";

/**
 * Export singleton instance of Logger.
 */
export const logger = new Logger(logLevel);

// import { createLogger, format, transports, Logger } from "winston";
// import TransportStream from "winston-transport"; // 追加

// const { combine, timestamp, printf, json } = format;

// // Custom log format for Console
// const consoleFormat = combine(
//     timestamp(),
//     printf(({ level, message, timestamp, ...meta }) => {
//         const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
//         return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
//     })
// );

// // Logger configuration
// const isProduction = process.env.NODE_ENV === "production";

// // Define transportList with correct type
// const transportList: TransportStream[] = [
//     new transports.Console({
//         format: consoleFormat,
//     }),
// ];

// // In production, use File transport for error logging (if not Edge Runtime)
// if (
//     isProduction &&
//     typeof window === "undefined" &&
//     process.env.NEXT_RUNTIME !== "edge"
// ) {
//     transportList.push(
//         new transports.File({
//             filename: "logs/error.log",
//             level: "error",
//         })
//     );
// } else if (
//     !isProduction &&
//     typeof window === "undefined" &&
//     process.env.NEXT_RUNTIME !== "edge"
// ) {
//     // Use combined.log in non-production environments (e.g., development)
//     transportList.push(
//         new transports.File({
//             filename: "logs/combined.log",
//         })
//     );
// }

// // Create the Winston logger instance
// export const logger: Logger = createLogger({
//     level: isProduction ? "error" : "info",
//     format: combine(timestamp(), json()), // Use JSON format for structured logs
//     transports: transportList,
// });
