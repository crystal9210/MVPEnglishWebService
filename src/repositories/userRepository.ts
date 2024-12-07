// TODO 依存関係周りリファクタ
/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { User, UserSchema } from "@/schemas/userSchemas";
import { BatchOperations } from "@/utils/batchOperations";
import { IUserRepository } from "@/interfaces/repositories/IUserRepository";
import type { DocumentData } from "firebase-admin/firestore";
import { RetryService } from "@/services/retryService";
import { isRetryableError } from "@/utils/isRetryableError";

@injectable()
export class UserRepository implements IUserRepository {
    private readonly collectionName = "users";

    constructor(
        @inject("IFirebaseAdmin") private firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private logger: ILoggerService,
        @inject(BatchOperations) private batchOperations: BatchOperations,
        @inject(RetryService) private retryService: RetryService
    ) {}

    /**
     * ユーザーID検索
     * @param uid ユーザーID
     * @returns User | null
     */
    async findUserById(uid: string): Promise<User | null> {
        return this.retryService.retry(async () => {
            const userDoc = await this.firebaseAdmin.getFirestore().collection(this.collectionName).doc(uid).get();
            if (userDoc.exists) {
                const data = userDoc.data() as DocumentData;

                // バリデーション
                const parsed = UserSchema.safeParse(data);
                if (parsed.success) {
                    const user = parsed.data;

                    this.logger.info(`User found: UID = ${uid}`);
                    return user;
                } else {
                    this.logger.warn(`Invalid user data in Firestore: UID = ${uid}`, { errors: parsed.error.errors });
                    return null;
                }
            }
            this.logger.warn(`User not found in Firestore: UID = ${uid}`);
            return null;
        }, {
            retries: 3,
            delay: 1000,
            factor: 2,
            shouldRetry: isRetryableError
        });
    }

    /**
     * ユーザー作成
     * @param user Userオブジェクト
     */
    async createUser(user: User): Promise<void> {
        await this.retryService.retry(async () => {
            // Firestoreに保存
            await this.batchOperations.batchSet<User>(this.collectionName, [{ id: user.uid, data: user }]);

            this.logger.info(`User created: UID = ${user.uid}`);
        }, {
            retries: 3,
            delay: 1000,
            factor: 2,
            shouldRetry: isRetryableError
        });
    }

    /**
     * ユーザー更新
     * @param user Partial<User> & { uid: string }
     */
    async updateUser(user: Partial<User> & { uid: string }): Promise<void> {
        await this.retryService.retry(async () => {
            // Firestoreに更新
            await this.batchOperations.batchUpdate<Partial<User>>(this.collectionName, [{ id: user.uid, data: user }]);

            this.logger.info(`User updated: UID = ${user.uid}`);
        }, {
            retries: 3,
            delay: 1000,
            factor: 2,
            shouldRetry: isRetryableError
        });
    }

    /**
     * ユーザー削除
     * @param uid ユーザーID
     */
    async deleteUser(uid: string): Promise<void> {
        await this.retryService.retry(async () => {
            // Firestoreから削除
            await this.batchOperations.batchDelete(this.collectionName, [uid]);

            this.logger.info(`User deleted: UID = ${uid}`);
        }, {
            retries: 3,
            delay: 1000,
            factor: 2,
            shouldRetry: isRetryableError
        });
    }
}
