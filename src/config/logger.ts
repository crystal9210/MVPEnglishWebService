import { promises as fsPromises } from "fs";
import path from "path";

/**
 * Supported log levels.
 */
type LogLevel = "info" | "error" | "debug";

/**
 * Log message structure.
 */
interface LogMessage {
    level: LogLevel; // The severity level of the log message
    message: string; // The log message itself
    timestamp: string; // ISO-formatted timestamp of when the log was created
    [key: string]: any; // Optional additional metadata for the log
}

/**
 * Logger class for handling logging operations.
 * Supports logging to both console and files, with conditional file writing
 * depending on the runtime environment.
 */
class Logger {
    level: LogLevel; // Current log level
    private fileWriteStream?: fsPromises.FileHandle; // File handle for log file (if applicable)

    /**
     * Initializes the logger.
     * @param level - The log level to determine which messages are logged.
     */
    constructor(level: LogLevel) {
        this.level = level;

        // File logging is only supported in Node.js (non-Edge Runtime environments)
        if (
            typeof window === "undefined" &&
            process.env.NEXT_RUNTIME !== "edge"
        ) {
            const isProduction = process.env.NODE_ENV === "production";
            const logFilename = isProduction
                ? "logs/error.log" // File for error-level logs in production
                : "logs/combined.log"; // File for all logs in non-production

            // Ensure the log directory exists and open the log file
            fsPromises
                .mkdir(path.dirname(logFilename), { recursive: true })
                .then(() => {
                    fsPromises
                        .open(logFilename, "a") // Open file in append mode
                        .then((fileHandle) => {
                            this.fileWriteStream = fileHandle; // Store the file handle
                        })
                        .catch((error) => {
                            console.error("Failed to open log file:", error);
                        });
                })
                .catch((error) => {
                    console.error("Failed to create logs directory:", error);
                });
        }
    }

    /**
     * Logs a message to the file.
     * @param log - The log message object to write.
     * @private
     */
    private async logToFile(log: LogMessage) {
        if (this.fileWriteStream) {
            try {
                // Write the log message as a JSON string followed by a newline
                await this.fileWriteStream.appendFile(
                    JSON.stringify(log) + "\n"
                );
            } catch (error) {
                console.error("Failed to write to log file:", error);
            }
        }
    }

    /**
     * Logs an informational message.
     * @param message - The log message string.
     * @param meta - Optional additional metadata.
     */
    async info(message: string, meta?: any) {
        if (["info", "debug"].includes(this.level)) {
            const log: LogMessage = {
                level: "info",
                message,
                timestamp: new Date().toISOString(),
                ...meta,
            };
            console.log(JSON.stringify(log)); // Output to the console
            await this.logToFile(log); // Optionally write to a file
        }
    }

    /**
     * Logs an error message.
     * @param message - The error message string.
     * @param meta - Optional additional metadata.
     */
    async error(message: string, meta?: any) {
        const log: LogMessage = {
            level: "error",
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };
        console.error(JSON.stringify(log)); // Output to the console
        await this.logToFile(log); // Optionally write to a file
    }

    /**
     * Logs a debug message (only when the log level is "debug").
     * @param message - The debug message string.
     * @param meta - Optional additional metadata.
     */
    async debug(message: string, meta?: any) {
        if (this.level === "debug") {
            const log: LogMessage = {
                level: "debug",
                message,
                timestamp: new Date().toISOString(),
                ...meta,
            };
            console.debug(JSON.stringify(log)); // Output to the console
            await this.logToFile(log); // Optionally write to a file
        }
    }

    /**
     * Closes the file handle, if open.
     * Should be called when the application shuts down to ensure logs are saved properly.
     */
    async close() {
        if (this.fileWriteStream) {
            try {
                await this.fileWriteStream.close(); // Close the file handle
            } catch (error) {
                console.error("Failed to close log file:", error);
            }
        }
    }
}

// Determine the default log level based on the environment
const isProduction = process.env.NODE_ENV === "production";
const level: LogLevel = isProduction ? "error" : "info";

/**
 * Singleton instance of the Logger.
 * Logs to the console and optionally to files based on environment settings.
 */
export const logger = new Logger(level);

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
