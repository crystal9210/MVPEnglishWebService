/* eslint-disable no-unused-vars */

/**
 * Defines the contract for LoggerService.
 */
export interface ILoggerService {
    /**
     * Logs an informational message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    info(message: string, meta?: Record<string, unknown>): void;

    /**
     * Logs a warning message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    warn(message: string, meta?: Record<string, unknown>): void;

    /**
     * Logs an error message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    error(message: string, meta?: Record<string, unknown>): void;

    /**
     * Logs a debug message.
     *
     * @param message - The message to log.
     * @param meta - Optional metadata to include with the log.
     */
    debug(message: string, meta?: Record<string, unknown>): void;
}
