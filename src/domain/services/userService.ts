import { injectable, inject } from "tsyringe";
import { UserRepository } from "@/domain/repositories/userRepository";
import { ProblemResultRepository } from "@/domain/repositories/problemResultRepository";
import { User } from "@/schemas/userSchemas";
import { ProblemResult } from "@/schemas/activity/problemHistorySchemas";
import { LoggerService } from "@/domain/services/loggerService";
import { IUserService } from "@/interfaces/services/IUserService";

@injectable()
export class UserService implements IUserService {
    private readonly userRepository: UserRepository;
    private readonly problemResultRepository: ProblemResultRepository;
    private readonly logger: LoggerService;

    constructor(
        @inject(UserRepository) userRepository: UserRepository,
        @inject(ProblemResultRepository) problemResultRepository: ProblemResultRepository,
        @inject(LoggerService) logger: LoggerService
    ) {
        this.userRepository = userRepository;
        this.problemResultRepository = problemResultRepository;
        this.logger = logger;
    }

    /**
     * ユーザーを作成
     * @param user Userオブジェクト
     */
    async createUser(user: User): Promise<void> {
        try {
            await this.userRepository.createUser(user);
            this.logger.info(`User created successfully: UID = ${user.uid}`);
        } catch (error) {
            this.logger.error(`Failed to create user: UID = ${user.uid}`, { error });
            throw error;
        }
    }

    /**
     * ユーザーを取得
     * @param uid ユーザーID
     * @returns User | null
     */
    async getUserById(uid: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findUserById(uid);
            if (user) {
                this.logger.info(`User retrieved successfully: UID = ${uid}`);
            } else {
                this.logger.warn(`User not found: UID = ${uid}`);
            }
            return user;
        } catch (error) {
            this.logger.error(`Failed to retrieve user: UID = ${uid}`, { error });
            throw error;
        }
    }

    /**
     * ユーザーを更新
     * @param user Partial<User> & { uid: string }
     */
    async updateUser(user: Partial<User> & { uid: string }): Promise<void> {
        try {
            await this.userRepository.updateUser(user);
            this.logger.info(`User updated successfully: UID = ${user.uid}`);
        } catch (error) {
            this.logger.error(`Failed to update user: UID = ${user.uid}`, { error });
            throw error;
        }
    }

    /**
     * ユーザーを削除
     * @param uid ユーザーID
     */
    async deleteUser(uid: string): Promise<void> {
        try {
            await this.userRepository.deleteUser(uid);
            this.logger.info(`User deleted successfully: UID = ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to delete user: UID = ${uid}`, { error });
            throw error;
        }
    }

    /**
     * ユーザーが全ての問題に取り組み終わった後の結果保存
     * @param userId ユーザーID
     * @param problemResults 問題ごとの結果データ
     */
    async saveAllProblemResults(userId: string, problemResults: ProblemResult[]): Promise<void> {
        try {
            // ユーザーが存在することを確認
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                this.logger.warn(`User not found: UID = ${userId}`);
                throw new Error(`User not found: UID = ${userId}`);
            }

            for (const result of problemResults) {
                // 問題形態の特定（問題IDのプレフィックスやその他のロジックで判定）
                const problemType = this.getProblemType(result.problemId);
                if (!problemType) {
                    this.logger.warn(`Unknown problem type for problemId: ${result.problemId}`);
                    continue; // またはエラーを投げる
                }

                // 問題結果を保存
                await this.problemResultRepository.saveProblemResult(problemType, userId, result);
            }

            this.logger.info(`All problem results saved successfully for user: UID = ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to save all problem results for user: UID = ${userId}`, { error });
            throw error;
        }
    }

    /**
     * 問題IDから問題形態を判定する関数
     * @param problemId 問題ID
     * @returns 問題形態の文字列
     */
    private getProblemType(problemId: string): string | null {
        // ここでは例として問題IDのプレフィックスで問題形態を判定
        if (problemId.startsWith('A_')) {
            return 'TypeA';
        } else if (problemId.startsWith('B_')) {
            return 'TypeB';
        }
        // 他の問題形態を追加
        return null;
    }
}
