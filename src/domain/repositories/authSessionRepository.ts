import { inject, injectable } from "tsyringe";
import { IAuthSessionRepository } from "@/interfaces/repositories/IAuthSessionRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { AdapterSession } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthSessionRepository implements IAuthSessionRepository {
    constructor(
        @inject(TSYRINGE_TOKENS.IFirebaseAdmin)
        private firebaseAdmin: IFirebaseAdmin
    ) {}

    private get collection() {
        return this.firebaseAdmin.getFirestore().collection("sessions");
    }

    /**
     * Creates a new session in the database.
     * @param session - The session data to create.
     */
    async createSession(session: AdapterSession): Promise<void> {
        await this.collection.doc(session.sessionToken).set({
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires,
            createdAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
            updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
        });
    }

    /**
     * Finds a session by its sessionToken.
     * @param sessionToken - The session token.
     * @returns The session or null if not found.
     */
    async findSession(sessionToken: string): Promise<AdapterSession | null> {
        const doc = await this.collection.doc(sessionToken).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return data
            ? {
                  sessionToken: data.sessionToken,
                  userId: data.userId,
                  expires: data.expires.toDate(),
              }
            : null;
    }

    /**
     * Updates a session's data.
     * @param sessionToken - The session token.
     * @param session - The session data to update.
     * @returns The updated session or null if not found.
     */
    async updateSession(
        sessionToken: string,
        session: Partial<AdapterSession>
    ): Promise<AdapterSession | null> {
        const docRef = this.collection.doc(sessionToken);
        const doc = await docRef.get();
        if (!doc.exists) return null;
        await docRef.update({
            ...session,
            updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
        });
        const updatedDoc = await docRef.get();
        const data = updatedDoc.data();
        return data
            ? {
                  sessionToken: data.sessionToken,
                  userId: data.userId,
                  expires: data.expires.toDate(),
              }
            : null;
    }

    /**
     * Deletes a session by its sessionToken and returns the deleted session.
     * @param sessionToken - The session token to delete.
     * @returns The deleted session or null if not found.
     */
    async deleteSession(sessionToken: string): Promise<AdapterSession | null> {
        const docRef = this.collection.doc(sessionToken);
        const doc = await docRef.get();
        if (!doc.exists) return null;
        const data = doc.data();
        await docRef.delete();
        return data
            ? {
                  sessionToken: data.sessionToken,
                  userId: data.userId,
                  expires: data.expires.toDate(),
              }
            : null;
    }
}
