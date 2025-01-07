import { inject, injectable } from "tsyringe";
import { IAuthenticatorRepository } from "@/interfaces/repositories/IAuthenticatorRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { AdapterAuthenticator } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthenticatorRepository implements IAuthenticatorRepository {
    constructor(
        @inject(TSYRINGE_TOKENS.IFirebaseAdmin)
        private firebaseAdmin: IFirebaseAdmin
    ) {}

    /**
     * Retrieve Firestore's “authenticators” collection.
     * @returns Firestore collection reference.
     */
    private get collection() {
        return this.firebaseAdmin.getFirestore().collection("authenticators");
    }

    /**
     * Retrieves an authenticator by its credentialID.
     * @param credentialID - The credential ID.
     * @returns The authenticator or null if not found.
     */
    async getAuthenticator(
        credentialID: string
    ): Promise<AdapterAuthenticator | null> {
        try {
            const doc = await this.collection.doc(credentialID).get();
            if (!doc.exists) return null;
            return doc.data() as AdapterAuthenticator;
        } catch (error) {
            throw new Error(
                `Failed to get authenticator with ID ${credentialID}: ${error}`
            );
        }
    }

    /**
     * Creates a new authenticator.
     * @param authenticator - The authenticator data to create.
     * @returns The created authenticator.
     */
    async createAuthenticator(
        authenticator: Omit<AdapterAuthenticator, "userId"> & { userId: string } // TODO handling of a field, "userId".
    ): Promise<AdapterAuthenticator> {
        try {
            const docRef = this.collection.doc(); // >> automatically generated ID is set as a value.
            const data: AdapterAuthenticator = {
                userId: authenticator.userId,
                providerAccountId: authenticator.providerAccountId,
                counter: authenticator.counter,
                credentialBackedUp: authenticator.credentialBackedUp,
                credentialID: docRef.id,
                credentialPublicKey: authenticator.credentialPublicKey,
                transports: authenticator.transports || null,
                credentialDeviceType: authenticator.credentialDeviceType,
            };
            await docRef.set({
                ...data,
                createdAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
                updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
            });
            return data;
        } catch (error) {
            throw new Error(`Failed to create authenticator: ${error}`);
        }
    }

    /**
     * Lists all authenticators associated with a user ID.
     * @param userId - The user ID.
     * @returns An array of authenticators.
     */
    async listAuthenticatorsByUserId(
        userId: string
    ): Promise<AdapterAuthenticator[]> {
        try {
            const querySnapshot = await this.collection
                .where("userId", "==", userId)
                .get();
            return querySnapshot.docs.map(
                (doc) => doc.data() as AdapterAuthenticator
            );
        } catch (error) {
            throw new Error(
                `Failed to list authenticators for user ID ${userId}: ${error}`
            );
        }
    }

    /**
     * Updates an authenticator's counter.
     * @param credentialID - The credential ID.
     * @param newCounter - The new counter value.
     * @returns The updated authenticator or null if not found.
     */
    async updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<AdapterAuthenticator> {
        const authDocRef = this.collection.doc(credentialID);
        await authDocRef.update({
            counter: newCounter,
            updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
        });
        const updatedDoc = await authDocRef.get();
        if (!updatedDoc.exists) {
            throw new Error(
                `Authenticator with ID ${credentialID} does not exist.`
            );
        }
        const data = updatedDoc.data()!;
        return {
            credentialID: updatedDoc.id,
            userId: data.userId,
            type: data.type,
            providerAccountId: data.providerAccountId,
            credentialPublicKey: data.credentialPublicKey,
            counter: data.counter,
            transports: data.transports || [],
            credentialBackedUp: data.credentialBackedUp || false,
            credentialDeviceType: data.credentialDeviceType || "",
        } as AdapterAuthenticator;
    }
}
