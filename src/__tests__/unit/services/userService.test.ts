// 設計
// モックのサービス:
// UserRepository, ProblemResultRepository, ILoggerService, RetryService をモック化し、UserService の依存関係を制御
// 正常系テスト:
// ユーザーの作成、取得、更新、削除が正常に行われるケース。
// 全ての問題結果が正常に保存されるケース
// 異常系テスト:
// リトライ可能なエラー（例: NetworkError）でリトライが行われ、最終的に失敗するケース
// リトライ不可能なエラー（例: ValidationError）で即座に失敗するケース
// ユーザーが存在しない場合の処理
// 不明な問題タイプが存在する場合の処理
// 任意の問題結果の保存が失敗した場合の処理
// セキュリティ関連テスト:

// エラーメッセージに機密情報が含まれていないか、ログに適切に記録されているかを確認

// src/services/__tests__/userService.test.ts

import "reflect-metadata";
import { UserService } from "../userService"; // UserService のインポートを確認してください
import { UserRepository } from "@/domain/repositories/userRepository";
import { ProblemResultRepository } from "@/domain/repositories/problemResultRepository";
import { ILoggerService } from "@/interfaces/services/ILoggerService";
import { RetryService } from "@/domain/services/retryService";
import { User, UserSchema } from "@/schemas/userSchemas";
import { ProblemResult } from "@/schemas/userHistorySchemas";
import { container } from "tsyringe";
import { jest } from "@jest/globals";
import { isRetryableError } from "@/utils/isRetryableError";

// モックのインターフェース
jest.mock("@/repositories/userRepository");
jest.mock("@/repositories/problemResultRepository");
jest.mock("@/services/retryService");

describe("UserService", () => {
    let userService: UserService;
    let userRepository: jest.Mocked<UserRepository>;
    let problemResultRepository: jest.Mocked<ProblemResultRepository>;
    let logger: jest.Mocked<ILoggerService>;
    let retryService: jest.Mocked<RetryService>;

    beforeEach(() => {
        // モックのインスタンスを作成
        userRepository = new UserRepository() as jest.Mocked<UserRepository>;
        problemResultRepository = new ProblemResultRepository() as jest.Mocked<ProblemResultRepository>;
        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        retryService = new RetryService(logger) as jest.Mocked<RetryService>;

        // tsyringe コンテナにモックを登録
        container.registerInstance<UserRepository>(UserRepository, userRepository);
        container.registerInstance<ProblemResultRepository>(ProblemResultRepository, problemResultRepository);
        container.registerInstance<ILoggerService>("ILoggerService", logger);
        container.registerInstance<RetryService>(RetryService, retryService);

        // UserService をコンテナから解決
        userService = container.resolve(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        it("should create a user successfully", async () => {
            const user: User = { uid: "user123", name: "John Doe" };
            retryService.retry.mockResolvedValue(undefined);

            await userService.createUser(user);

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(retryService.retry).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
                retries: 3,
                delay: 1000,
                factor: 2,
                shouldRetry: isRetryableError
            }));
            expect(userRepository.createUser).toHaveBeenCalledWith(user);
            expect(logger.info).toHaveBeenCalledWith(`User created successfully: UID = user123`);
        });

        it("should log and throw an error when creating a user fails", async () => {
            const user: User = { uid: "user123", name: "John Doe" };
            const error = new Error("NetworkError");
            retryService.retry.mockRejectedValue(error);

            await expect(userService.createUser(user)).rejects.toThrow("NetworkError");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(userRepository.createUser).toHaveBeenCalledWith(user);
            expect(logger.error).toHaveBeenCalledWith(`Failed to create user: UID = user123`, { error });
        });
    });

    describe("getUserById", () => {
        it("should retrieve a user successfully", async () => {
            const user: User = { uid: "user123", name: "John Doe" };
            retryService.retry.mockResolvedValue(user);

            const result = await userService.getUserById("user123");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(retryService.retry).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
                retries: 3,
                delay: 1000,
                factor: 2,
                shouldRetry: isRetryableError
            }));
            expect(userRepository.findUserById).toHaveBeenCalledWith("user123");
            expect(logger.info).toHaveBeenCalledWith(`User retrieved successfully: UID = user123`);
            expect(result).toEqual(user);
        });

        it("should return null and log a warning when user is not found", async () => {
            retryService.retry.mockResolvedValue(null);

            const result = await userService.getUserById("nonexistent");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(userRepository.findUserById).toHaveBeenCalledWith("nonexistent");
            expect(logger.warn).toHaveBeenCalledWith(`User not found: UID = nonexistent`);
            expect(result).toBeNull();
        });

        it("should log and throw an error when retrieving a user fails", async () => {
            const error = new Error("NetworkError");
            retryService.retry.mockRejectedValue(error);

            await expect(userService.getUserById("user123")).rejects.toThrow("NetworkError");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(userRepository.findUserById).toHaveBeenCalledWith("user123");
            expect(logger.error).toHaveBeenCalledWith(`Failed to retrieve user: UID = user123`, { error });
        });
    });

    describe("updateUser", () => {
        it("should update a user successfully", async () => {
            const user: Partial<User> & { uid: string } = { uid: "user123", name: "Jane Doe" };
            retryService.retry.mockResolvedValue(undefined);

            await userService.updateUser(user);

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(retryService.retry).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
                retries: 3,
                delay: 1000,
                factor: 2,
                shouldRetry: isRetryableError
            }));
            expect(userRepository.updateUser).toHaveBeenCalledWith(user);
            expect(logger.info).toHaveBeenCalledWith(`User updated successfully: UID = user123`);
        });

        it("should log and throw an error when updating a user fails", async () => {
            const user: Partial<User> & { uid: string } = { uid: "user123", name: "Jane Doe" };
            const error = new Error("NetworkError");
            retryService.retry.mockRejectedValue(error);

            await expect(userService.updateUser(user)).rejects.toThrow("NetworkError");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(userRepository.updateUser).toHaveBeenCalledWith(user);
            expect(logger.error).toHaveBeenCalledWith(`Failed to update user: UID = user123`, { error });
        });
    });

    describe("deleteUser", () => {
        it("should delete a user successfully", async () => {
            const uid = "user123";
            retryService.retry.mockResolvedValue(undefined);

            await userService.deleteUser(uid);

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(retryService.retry).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
                retries: 3,
                delay: 1000,
                factor: 2,
                shouldRetry: isRetryableError
            }));
            expect(userRepository.deleteUser).toHaveBeenCalledWith(uid);
            expect(logger.info).toHaveBeenCalledWith(`User deleted successfully: UID = user123`);
        });

        it("should log and throw an error when deleting a user fails", async () => {
            const uid = "user123";
            const error = new Error("NetworkError");
            retryService.retry.mockRejectedValue(error);

            await expect(userService.deleteUser(uid)).rejects.toThrow("NetworkError");

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(userRepository.deleteUser).toHaveBeenCalledWith(uid);
            expect(logger.error).toHaveBeenCalledWith(`Failed to delete user: UID = user123`, { error });
        });
    });

    describe("saveAllProblemResults", () => {
        it("should save all problem results successfully", async () => {
            const userId = "user123";
            const problemResults: ProblemResult[] = [
                { problemId: "A_001", score: 95 },
                { problemId: "B_002", score: 88 }
            ];
            const user: User = { uid: "user123", name: "John Doe" };

            retryService.retry
                .mockResolvedValueOnce(user) // findUserById
                .mockResolvedValueOnce(undefined) // saveProblemResult for A_001
                .mockResolvedValueOnce(undefined); // saveProblemResult for B_002

            await userService.saveAllProblemResults(userId, problemResults);

            expect(retryService.retry).toHaveBeenCalledTimes(3);
            expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
            expect(problemResultRepository.saveProblemResult).toHaveBeenCalledWith("TypeA", userId, problemResults[0]);
            expect(problemResultRepository.saveProblemResult).toHaveBeenCalledWith("TypeB", userId, problemResults[1]);
            expect(logger.info).toHaveBeenCalledWith(`All problem results saved successfully for user: UID = ${userId}`);
        });

        it("should throw an error if user is not found", async () => {
            const userId = "user123";
            const problemResults: ProblemResult[] = [
                { problemId: "A_001", score: 95 },
                { problemId: "B_002", score: 88 }
            ];

            retryService.retry
                .mockResolvedValueOnce(null); // findUserById

            await expect(userService.saveAllProblemResults(userId, problemResults)).rejects.toThrow(`User not found: UID = ${userId}`);

            expect(retryService.retry).toHaveBeenCalledTimes(1);
            expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
            expect(logger.warn).toHaveBeenCalledWith(`User not found: UID = ${userId}`);
        });

        it("should skip saving problem results with unknown problem types", async () => {
            const userId = "user123";
            const problemResults: ProblemResult[] = [
                { problemId: "A_001", score: 95 },
                { problemId: "C_003", score: 70 } // Unknown problem type
            ];
            const user: User = { uid: "user123", name: "John Doe" };

            retryService.retry
                .mockResolvedValueOnce(user) // findUserById
                .mockResolvedValueOnce(undefined) // saveProblemResult for A_001
                .mockResolvedValueOnce(undefined); // saveProblemResult for C_003 (skipped)

            await userService.saveAllProblemResults(userId, problemResults);

            expect(retryService.retry).toHaveBeenCalledTimes(3);
            expect(problemResultRepository.saveProblemResult).toHaveBeenCalledTimes(1);
            expect(problemResultRepository.saveProblemResult).toHaveBeenCalledWith("TypeA", userId, problemResults[0]);
            expect(logger.warn).toHaveBeenCalledWith(`Unknown problem type for problemId: C_003`);
            expect(logger.info).toHaveBeenCalledWith(`All problem results saved successfully for user: UID = ${userId}`);
        });

        it("should throw an error if saving any problem result fails", async () => {
            const userId = "user123";
            const problemResults: ProblemResult[] = [
                { problemId: "A_001", score: 95 },
                { problemId: "B_002", score: 88 }
            ];
            const user: User = { uid: "user123", name: "John Doe" };
            const error = new Error("NetworkError");

            retryService.retry
                .mockResolvedValueOnce(user) // findUserById
                .mockRejectedValueOnce(error); // saveProblemResult for A_001

            await expect(userService.saveAllProblemResults(userId, problemResults)).rejects.toThrow("NetworkError");

            expect(retryService.retry).toHaveBeenCalledTimes(2);
            expect(problemResultRepository.saveProblemResult).toHaveBeenCalledTimes(1);
            expect(problemResultRepository.saveProblemResult).toHaveBeenCalledWith("TypeA", userId, problemResults[0]);
            expect(logger.error).toHaveBeenCalledWith(`Failed to save all problem results for user: UID = ${userId}`, { error });
        });
    });
});
