import { injectable, inject } from "tsyringe";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import retryConfig from "@/constants/retryConfig";
import { isRetryableError } from "@/utils/isRetryableError";

/**
 * リトライオプションのインターフェース
 */
interface RetryOptions {
    retries?: number;
    delay?: number; // ミリ秒単位
    factor?: number; // 遅延時間を増加させるための係数
    // eslint-disable-next-line no-unused-vars
    shouldRetry?: (error: unknown) => boolean;
}

@injectable()
export class RetryService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject("ILoggerService") private logger: ILoggerService
    ) {}

    /**
     * リトライ機能を提供する汎用メソッド
     * @param fn リトライ対象の非同期関数
     * @param options リトライオプション
     * @returns 関数の実行結果
     */
    async retry<T>(
        fn: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const {
            retries = retryConfig.defaultRetries,
            delay = retryConfig.defaultDelay,
            factor = retryConfig.defaultFactor,
            shouldRetry = isRetryableError
        } = options;
        let attempt = 0;
        let currentDelay = delay;

        while (attempt <= retries) {
            try {
                return await fn();
            } catch (error: unknown) {
                // リトライすべきエラーか確認
                if (!shouldRetry(error)) {
                    this.logger.error(`Non-retriable error encountered:`, { error });
                    throw error;
                }

                if (attempt === retries) {
                    this.logger.error(`Retry failed after ${retries + 1} attempts`, { error });
                    throw error;
                }

                this.logger.warn(`Attempt ${attempt + 1} failed. Retrying in ${currentDelay}ms...`, { error });
                await new Promise((res) => setTimeout(res, currentDelay));
                attempt++;
                currentDelay *= factor; // 遅延時間を増加
            }
        }

        // このコードには到達しないが、型のために必要
        throw new Error("Retry failed");
    }
}
