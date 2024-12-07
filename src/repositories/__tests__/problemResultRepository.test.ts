import "reflect-metadata";
import { ProblemResultRepository } from "../problemResultRepository";
import { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { ILoggerService } from "@/interfaces/services/ILoggerService";
import { BatchOperations } from "@/utils/batchOperations";
import { RetryService } from "@/services/retryService";
import { container } from "tsyringe";
import { jest } from "@jest/globals";
import { isRetryableError } from "@/utils/isRetryableError";

type MockFirebaseAdmin = jest.Mocked<IFirebaseAdmin>;
type MockLoggerService = jest.Mocked<ILoggerService>;
type MockBatchOperations = jest.Mocked<BatchOperations>;
type MockRetryService = jest.Mocked<RetryService>;

describe("ProblemResultRepository", () => {
    let problemResultRepository: ProblemResultRepository;
    let firebaseAdmin: MockFirebaseAdmin;
    let logger: MockLoggerService;
    let batchOperations: MockBatchOperations;
    let retryService: MockRetryService;

    beforeEach(() => {
        // モックの作成
        firebaseAdmin = {
            getFirestore: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnThis(),
                doc: jest.fn().mockReturnThis(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            }),
        } as unknown as MockFirebaseAdmin;

        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };

        batchOperations = {
            batchSet: jest.fn(),
            batchUpdate: jest.fn(),
            batchDelete: jest.fn(),
        } as unknown as MockBatchOperations;

        retryService = {
            retry: jest.fn(),
        } as unknown as MockRetryService;

        // モックをコンテナに登録
        container.registerInstance<IFirebaseAdmin>("IFirebaseAdmin", firebaseAdmin);
        container.registerInstance<ILoggerService>("ILoggerService", logger);
        container.registerInstance<BatchOperations>(BatchOperations, batchOperations);
        container.registerInstance<RetryService>(RetryService, retryService);

        // ProblemResultRepository をコンテナから解決
        problemResultRepository = container.resolve(ProblemResultRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("saveProblemResult", () => {
        it("should save a problem result successfully", async () => {
            const problemType = "TypeA";
            const userId = "user123";
            const result = {
                uid: "user123",
                categoryId: "TypeA",
                problemId: "A_001",
                latestAttemptAt: new Date(),
                timeSpent: 300,
                result: "correct" as const,
                notes: []
            };

            batchOperations.batchSet.mockResolvedValue();

            retryService.retry.mockResolvedValue(undefined);

            await problemResultRepository.saveProblemResult(problemType, userId, result);

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(retryService.retry).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
                retries: 3,
                delay: 1000,
                factor: 2,
                shouldRetry: isRetryableError
            }));
            expect(batchOperations.batchSet).toHaveBeenCalledWith("problemResults_TypeA", [{ id: "user123_A_001", data: result }]);
            expect(logger.info).toHaveBeenCalledWith(`Problem result saved: UserID = user123, ProblemID = A_001`);
        });

        it("should throw an error when batchSet fails with a retryable error", async () => {
            const problemType = "TypeA";
            const userId = "user123";
            const result = {
                uid: "user123",
                categoryId: "TypeA",
                problemId: "A_001",
                latestAttemptAt: new Date(),
                timeSpent: 300,
                result: "correct" as const,
                notes: []
            };
            const error = new Error("NetworkError");

            batchOperations.batchSet.mockRejectedValue(error);
            retryService.retry.mockRejectedValue(error);

            await expect(problemResultRepository.saveProblemResult(problemType, userId, result)).rejects.toThrow("NetworkError");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(batchOperations.batchSet).toHaveBeenCalledWith("problemResults_TypeA", [{ id: "user123_A_001", data: result }]);
            expect(logger.error).toHaveBeenCalledWith(`Failed to save problem result: UserID = user123, ProblemID = A_001`, { error });
        });

        it("should throw an error when batchSet fails with a non-retryable error", async () => {
            const problemType = "TypeA";
            const userId = "user123";
            const result = {
                uid: "user123",
                categoryId: "TypeA",
                problemId: "A_001",
                latestAttemptAt: new Date(),
                timeSpent: 300,
                result: "correct" as const,
                notes: []
            };
            const error = new Error("ValidationError");

            batchOperations.batchSet.mockRejectedValue(error);
            retryService.retry.mockRejectedValue(error);

            await expect(problemResultRepository.saveProblemResult(problemType, userId, result)).rejects.toThrow("ValidationError");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(batchOperations.batchSet).toHaveBeenCalledWith("problemResults_TypeA", [{ id: "user123_A_001", data: result }]);
            expect(logger.error).toHaveBeenCalledWith(`Failed to save problem result: UserID = user123, ProblemID = A_001`, { error });
        });
    });

    // 他のメソッドについても同様にテストを実装
});
