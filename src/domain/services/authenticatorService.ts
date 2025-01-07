import { injectable } from "tsyringe";
import {
    IAuthenticatorService,
    IAuthenticator,
} from "@/interfaces/services/IAuthenticatorService";
import { firestore } from "@/lib/firebaseAdmin"; // TODO >> ensure this exports the initialized Firestore
import { FieldValue } from "firebase-admin/firestore";

@injectable()
export class AuthenticatorService implements IAuthenticatorService {
    /**
     * Retrieves an authenticator by its credential ID.
     * @param credentialID The credential ID.
     * @returns The IAuthenticator or null if not found.
     */
    async getAuthenticator(
        credentialID: string
    ): Promise<IAuthenticator | null> {
        const authDoc = await firestore
            .collection("authenticators")
            .doc(credentialID)
            .get();
        if (!authDoc.exists) return null;

        return {
            id: authDoc.id,
            ...(authDoc.data() as Omit<IAuthenticator, "id">),
        } as IAuthenticator;
    }

    /**
     * Creates a new authenticator.
     * @param authenticator The authenticator to create (excluding id).
     * @returns The created IAuthenticator.
     */
    async createAuthenticator(
        authenticator: Omit<IAuthenticator, "id">
    ): Promise<IAuthenticator> {
        const authDocRef = firestore.collection("authenticators").doc();
        await authDocRef.set({
            ...authenticator,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        const createdDoc = await authDocRef.get();
        return {
            id: createdDoc.id,
            ...(createdDoc.data() as Omit<IAuthenticator, "id">),
        } as IAuthenticator;
    }

    /**
     * Lists all authenticators associated with a user ID.
     * @param userId The user ID.
     * @returns An array of IAuthenticator.
     */
    async listAuthenticatorsByUserId(
        userId: string
    ): Promise<IAuthenticator[]> {
        const authQuerySnapshot = await firestore
            .collection("authenticators")
            .where("userId", "==", userId)
            .get();
        return authQuerySnapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...(doc.data() as Omit<IAuthenticator, "id">),
                } as IAuthenticator)
        );
    }

    /**
     * Updates the counter for a specific authenticator.
     * @param credentialID The credential ID.
     * @param newCounter The new counter value.
     * @returns The updated IAuthenticator or null if not found.
     */
    async updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<IAuthenticator | null> {
        const authDocRef = firestore
            .collection("authenticators")
            .doc(credentialID);
        await authDocRef.update({
            counter: newCounter,
            updatedAt: FieldValue.serverTimestamp(),
        });

        const updatedDoc = await authDocRef.get();
        if (!updatedDoc.exists) return null;

        return {
            id: updatedDoc.id,
            ...(updatedDoc.data() as Omit<IAuthenticator, "id">),
        } as IAuthenticator;
    }
}
