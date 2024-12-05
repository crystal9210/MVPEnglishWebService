// src/services/authService.ts

import { injectable, inject } from "tsyringe";
import { FirebaseAdmin } from "./firebaseAdmin";
import { FirebaseError } from "firebase-admin";
import { Logger } from "@/utils/logger";
import { AdapterAccount } from "next-auth/adapters";

@injectable()
export class AuthService {
    constructor(
        @inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin
    ) {}

    async createAccountEntry(uid: string, accountData: AdapterAccount) {
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
            `Missing required account data fields: ${missingFields.join(", ")}`
            );
        }

        const { userId: _, ...accountDataWithoutUserId } = accountData; // TODO

        const accountsCollection = this.firebaseAdmin.firestore.collection(
            "accounts"
        );
        const accountDocRef = accountsCollection.doc(uid);

        // TODO uidの扱いはどうなる？
        await accountDocRef.set({
            userId: uid,
            ...accountDataWithoutUserId,
        });

        Logger.info(`Account entry created/updated in Firestore for userId: ${uid}`);
        } catch (error) {
        Logger.error(`Failed to create account entry for userId: ${uid}`, error);
        throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
        Logger.info(`Fetching user for email: ${email}`);
        const userRecord = await this.firebaseAdmin.auth.getUserByEmail(email);
        Logger.info(`User record found: ${JSON.stringify(userRecord, null, 2)}`);
        return userRecord;
        } catch (error) {
        const errorCode = (error as FirebaseError).code;
        Logger.error(`Error code: ${errorCode}, Error message: ${(error as FirebaseError).message}`);

        if (errorCode === "auth/user-not-found") {
            Logger.warn(`User not found for email: ${email}`);
            return undefined;
        }

        throw error;
        }
    }

    async createUser(email: string, name?: string, photoURL?: string) {
        try {
        const userRecord = await this.firebaseAdmin.auth.createUser({
            email,
            displayName: name,
            photoURL,
            emailVerified: false,
        });
        Logger.info(`User created: ${userRecord.uid}`);
        return userRecord;
        } catch (error) {
        Logger.error(`Failed to create user with email: ${email}`, error);
        throw error;
        }
    }

    async deleteUser(uid: string): Promise<void> {
        try {
        await this.firebaseAdmin.auth.deleteUser(uid);
        Logger.info(`Firebase Authentication user deleted: ${uid}`);
        } catch (error) {
        Logger.error(`Failed to delete Firebase Authentication user: ${uid}`, error);
        throw error;
        }
    }
}
