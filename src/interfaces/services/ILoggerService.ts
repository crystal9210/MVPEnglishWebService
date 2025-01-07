/* eslint-disable no-unused-vars */

/**
 * Defines the contract for LoggerService.
 */
export interface ILoggerService {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
