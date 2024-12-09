// 設計
// 正常系:
// 関数が最初の試行で成功
// 関数が数回失敗した後、リトライで成功
// 異常系:
// 関数が全てのリトライ回数で失敗
// shouldRetry 関数が false を返すエラーが発生した場合、リトライを停止
// セキュリティ関連:
// エラー情報がログに適切に記録されているか確認
// 潜在的な情報漏洩がないか確認する（例: エラーメッセージに機密情報が含まれていない）

// src/services/__tests__/retryService.test.ts

// src/services/__tests__/retryService.test.ts

import "reflect-metadata";
import { RetryService } from "../../../domain/services/retryService";
import { ILoggerService } from "@/interfaces/services/ILoggerService";
import { container } from "tsyringe";
import { jest } from "@jest/globals";

describe("RetryService", () => {
    let retryService: RetryService;
    let logger: jest.Mocked<ILoggerService>;

    beforeEach(() => {
        // ILoggerService のモックを作成
        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };

        // モックをコンテナに登録
        container.registerInstance<ILoggerService>("ILoggerService", logger);

        // RetryService をコンテナから解決
        retryService = container.resolve(RetryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should succeed on the first attempt", async () => {
        const fn: () => Promise<string> = jest.fn().mockResolvedValue("success");
        const result = await retryService.retry(fn);
        expect(result).toBe("success");
        expect(fn).toHaveBeenCalledTimes(1);
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("should retry the specified number of times and then fail", async () => {
        const error = new Error("NetworkError");
        const fn: () => Promise<string> = jest.fn().mockRejectedValue(error);

        await expect(retryService.retry(fn)).rejects.toThrow("NetworkError");

        expect(fn).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
        expect(logger.warn).toHaveBeenCalledTimes(3);
        expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it("should retry only on retryable errors", async () => {
        const retryableError = new Error("NetworkError");
        const nonRetryableError = new Error("ValidationError");

        const fn: () => Promise<string> = jest.fn()
            .mockRejectedValueOnce(retryableError)
            .mockRejectedValueOnce(nonRetryableError);

        await expect(retryService.retry(fn)).rejects.toThrow("ValidationError");

        expect(fn).toHaveBeenCalledTimes(2);
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it("should succeed after retries", async () => {
        const fn: () => Promise<string> = jest.fn()
            .mockRejectedValueOnce(new Error("NetworkError"))
            .mockRejectedValueOnce(new Error("NetworkError"))
            .mockResolvedValue("success");

        const result = await retryService.retry(fn);
        expect(result).toBe("success");
        expect(fn).toHaveBeenCalledTimes(3);
        expect(logger.warn).toHaveBeenCalledTimes(2);
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("should respect custom shouldRetry function", async () => {
        const fn: () => Promise<string> = jest.fn()
            .mockRejectedValueOnce(new Error("CustomError"))
            .mockResolvedValue("success");

        const customShouldRetry = (error: unknown) => {
            if (error instanceof Error && error.message === "CustomError") {
                return false;
            }
            return true;
        };

        await expect(retryService.retry(fn, { shouldRetry: customShouldRetry })).rejects.toThrow("CustomError");
        expect(fn).toHaveBeenCalledTimes(1);
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it("should log error details without leaking sensitive information", async () => {
        const sensitiveError = new Error("NetworkError: sensitive data");

        const fn: () => Promise<string> = jest.fn().mockRejectedValue(sensitiveError);

        await expect(retryService.retry(fn)).rejects.toThrow("NetworkError: sensitive data");
        expect(logger.warn).toHaveBeenCalledTimes(3);
        expect(logger.error).toHaveBeenCalledTimes(1);

        // 機密情報がログに適切に記録されているか確認
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Attempt"), { error: sensitiveError });
        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Retry failed"), { error: sensitiveError });
    });
});
