// src/repositories/userRepository.ts
import { Firestore, DocumentData } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { User, UserSchema } from "@/schemas/userSchemas";
import { BatchOperations } from "@/utils/batchOperations";
import { LoggerService } from "@/services/loggerService";
import { IUserRepository } from "@/interfaces/repositories/IUserRepository";

@injectable()
export class UserRepository implements IUserRepository {
    private readonly collectionName = "users";
    private readonly firestore: Firestore;
    private readonly logger: LoggerService;
    private readonly batchOperations: BatchOperations;

    constructor(
        @inject("Firestore") firestore: Firestore,
        @inject(LoggerService) logger: LoggerService,
        @inject(BatchOperations) batchOperations: BatchOperations
    ) {
        this.firestore = firestore;
        this.logger = logger;
        this.batchOperations = batchOperations;
    }

    /**
     * ユーザーをIDで検索
     * @param uid ユーザーID
     * @returns User | null
     */
    async findUserById(uid: string): Promise<User | null> {
        try {
            const userDoc = await this.firestore.collection(this.collectionName).doc(uid).get();
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
        } catch (error) {
            this.logger.error(`Failed to find user with UID: ${uid}`, { error });
            throw error;
        }
    }

    /**
     * ユーザーを作成
     * @param user Userオブジェクト
     */
    async createUser(user: User): Promise<void> {
        try {
            // Firestoreに保存
            await this.batchOperations.batchSet<User>(this.collectionName, [{ id: user.uid, data: user }]);

            this.logger.info(`User created: UID = ${user.uid}`);
        } catch (error) {
            this.logger.error(`Failed to create user: UID = ${user.uid}`, { error });
            throw error;
        }
    }

    /**
     * ユーザーを更新
     * @param user Partial<User> & { uid: string }
     */
    async updateUser(user: Partial<User> & { uid: string }): Promise<void> {
        try {
            // Firestoreに更新
            await this.batchOperations.batchUpdate<Partial<User>>(this.collectionName, [{ id: user.uid, data: user }]);

            this.logger.info(`User updated: UID = ${user.uid}`);
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
            // Firestoreから削除
            await this.batchOperations.batchDelete(this.collectionName, [uid]);

            this.logger.info(`User deleted: UID = ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to delete user: UID = ${uid}`, { error });
            throw error;
        }
    }
}