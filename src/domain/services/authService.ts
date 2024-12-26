/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthService } from "@/interfaces/services/IAuthService";
import type { IAccountRepository } from "@/interfaces/repositories/IAccountRepository";
import { AdapterAccount } from "next-auth/adapters";
import { FirebaseError } from "firebase-admin";

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService,
        @inject("IAccountRepository") private readonly accountRepository: IAccountRepository
    ) {}

    async createAccountEntry(uid: string, accountData: AdapterAccount): Promise<void> {
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

            const missingFields = requiredFields.filter((field) => !(field in accountData));
            if (missingFields.length > 0) {
                throw new Error(`Missing required account data fields: ${missingFields.join(", ")}`);
            }

            const { userId, ...accountDataWithoutUserId } = accountData; // TODO userId handling

            // AccountRepositoryを介してDB操作
            await this.accountRepository.createAccountEntry(uid, {
                userId: uid,
                ...accountDataWithoutUserId,
            });
        } catch (error) {
            this.logger.error(`Failed to create account entry for userId: ${uid}`, { error });
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            this.logger.info(`Fetching user for email: ${email}`);
            const userRecord = await this.firebaseAdmin.getAuth().getUserByEmail(email);
            this.logger.info(`User record found: ${JSON.stringify(userRecord, null, 2)}`);
            return userRecord;
        } catch (error) {
            const errorCode = (error as FirebaseError).code;
            this.logger.error(`Error code: ${errorCode}, Error message: ${(error as FirebaseError).message}`);

            if (errorCode === "auth/user-not-found") {
                this.logger.warn(`User not found for email: ${email}`);
                return undefined;
            }

            throw error;
        }
    }

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
            this.logger.error(`Failed to create user with email: ${email}`, { error });
            throw error;
        }
    }

    async deleteUser(uid: string): Promise<void> {
        try {
            await this.firebaseAdmin.getAuth().deleteUser(uid);
            this.logger.info(`Firebase Authentication user deleted: ${uid}`);
        } catch (error) {
            this.logger.error(`Failed to delete Firebase Authentication user: ${uid}`, { error });
            throw error;
        }
    }

}
