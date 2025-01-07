/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthService } from "@/interfaces/services/IAuthService";
import type { IAuthAccountRepository } from "@/interfaces/repositories/IAuthAccountRepository";
import { AdapterAccount } from "next-auth/adapters";
import { FirebaseError } from "firebase-admin";

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject("IFirebaseAdmin")
        private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService,
        @inject("IAuthAccountRepository")
        private readonly accountRepository: IAuthAccountRepository
    ) {}

    /**
     * Creates an account entry in the authentication system.
     * @param uid - The unique identifier for the user.
     * @param accountData - The account data to be stored.
     */
    async createAccountEntry(
        uid: string,
        accountData: AdapterAccount
    ): Promise<void> {
        try {
            const requiredFields: (keyof AdapterAccount)[] = [
                "provider",
                "providerAccountId",
                "access_token",
                "refresh_token",
                "id_token",
                "token_type",
                "scope",
                "expires_at",
                "type",
            ];

            const missingFields = requiredFields.filter(
                (field) => !(field in accountData)
            );
            if (missingFields.length > 0) {
                throw new Error(
                    `Missing required account data fields: ${missingFields.join(
                        ", "
                    )}`
                );
            }

            const { userId, ...accountDataWithoutUserId } = accountData;
            if (!userId) {
                throw new Error("userId is required in accountData.");
            }

            await this.accountRepository.createAccount({
                userId: uid,
                ...accountDataWithoutUserId,
            });
        } catch (error) {
            this.logger.error(
                `Failed to create account entry for userId: ${uid}`,
                { error }
            );
            throw error;
        }
    }

    /**
     * Retrieves a user by their email from Firebase Authentication.
     * @param email - The user's email.
     * @returns The Firebase user or undefined if not found.
     */
    async getUserByEmail(email: string) {
        try {
            this.logger.info(`Fetching user for email: ${email}`);
            const userRecord = await this.firebaseAdmin
                .getAuth()
                .getUserByEmail(email);
            this.logger.info(
                `User record found: ${JSON.stringify(userRecord, null, 2)}`
            );
            return userRecord;
        } catch (error) {
            const errorCode = (error as FirebaseError).code;
            this.logger.error(
                `Error code: ${errorCode}, Error message: ${
                    (error as FirebaseError).message
                }`
            );

            if (errorCode === "auth/user-not-found") {
                this.logger.warn(`User not found for email: ${email}`);
                return undefined;
            }

            throw error;
        }
    }

    /**
     * Creates a user in Firebase Authentication.
     * @param email - The user's email.
     * @param name - The user's name.
     * @param photoURL - The user's image (photo) URL.
     * @returns The created Firebase user.
     */
    async createUser(email: string, name?: string, photoURL?: string) {
        try {
            const userRecord = await this.firebaseAdmin.getAuth().createUser({
                email,
                displayName: name,
                photoURL,
                emailVerified: false,
            });
            this.logger.info(`User created: ${userRecord.uid}`);
            return userRecord;
        } catch (error) {
            this.logger.error(`Failed to create user with email: ${email}`, {
                error,
            });
            throw error;
        }
    }

    /**
     * Deletes a user from Firebase Authentication.
     * @param uid - The user ID.
     */
    async deleteUser(uid: string): Promise<void> {
        try {
            await this.firebaseAdmin.getAuth().deleteUser(uid);
            this.logger.info(`Firebase Authentication user deleted: ${uid}`);
        } catch (error) {
            this.logger.error(
                `Failed to delete Firebase Authentication user: ${uid}`,
                { error }
            );
            throw error;
        }
    }
}
