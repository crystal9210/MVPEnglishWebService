import { inject, injectable } from "tsyringe";
import { IAuthVerificationTokenRepository } from "@/interfaces/repositories/IAuthVerificationTokenRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { VerificationToken } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthVerificationTokenRepository
    implements IAuthVerificationTokenRepository
{
    constructor(
        @inject(TSYRINGE_TOKENS.IFirebaseAdmin)
        private firebaseAdmin: IFirebaseAdmin
    ) {}

    /**
     * Retrieve the "verification_tokens" collection in Firestore.
     * @returns Firestore collection reference.
     */
    private get collection() {
        return this.firebaseAdmin
            .getFirestore()
            .collection("verification_tokens");
    }

    /**
     * Creates a new verification token in the database.
     * @param verificationToken - The verification token data to create.
     */
    async createToken(verificationToken: VerificationToken): Promise<void> {
        try {
            const docId = `${verificationToken.identifier}-${verificationToken.token}`;
            await this.collection.doc(docId).set({
                identifier: verificationToken.identifier,
                token: verificationToken.token,
                expires: verificationToken.expires
                    ? (this.firebaseAdmin
                          .getFieldValue()
                          .serverTimestamp() as any)
                    : null,
                createdAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
                updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
            });
        } catch (error) {
            throw new Error(`Failed to create verification token: ${error}`);
        }
    }

    /**
     * Finds a verification token by identifier and token.
     * @param identifier - The identifier associated with the token.
     * @param token - The token string.
     * @returns The verification token or null if not found.
     */
    async findToken(
        identifier: string,
        token: string
    ): Promise<VerificationToken | null> {
        try {
            const docId = `${identifier}-${token}`;
            const doc = await this.collection.doc(docId).get();
            if (!doc.exists) return null;
            const data = doc.data();
            return data
                ? {
                      identifier: data.identifier,
                      token: data.token,
                      expires: data.expires.toDate(),
                  }
                : null;
        } catch (error) {
            throw new Error(`Failed to find verification token: ${error}`);
        }
    }

    /**
     * Deletes a verification token by identifier and token.
     * @param identifier - The identifier associated with the token.
     * @param token - The token string.
     */
    async deleteToken(identifier: string, token: string): Promise<void> {
        try {
            const docId = `${identifier}-${token}`;
            await this.collection.doc(docId).delete();
        } catch (error) {
            throw new Error(`Failed to delete verification token: ${error}`);
        }
    }
}
