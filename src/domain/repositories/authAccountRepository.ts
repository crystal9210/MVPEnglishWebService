import { inject, injectable } from "tsyringe";
import { IAuthAccountRepository } from "@/interfaces/repositories/IAuthAccountRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { AdapterAccount } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthAccountRepository implements IAuthAccountRepository {
    constructor(
        @inject(TSYRINGE_TOKENS.IFirebaseAdmin)
        private firebaseAdmin: IFirebaseAdmin
    ) {}

    /**
     * Retrieve the "accounts" collection in Firestore.
     * @returns Firestore collection reference.
     */
    private get collection() {
        return this.firebaseAdmin.getFirestore().collection("accounts");
    }

    /**
     * Creates a new account in the database.
     * @param account - The account data to create.
     */
    async createAccount(account: AdapterAccount): Promise<void> {
        try {
            const docId = `${account.provider}-${account.providerAccountId}`;
            await this.collection.doc(docId).set({
                userId: account.userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token || null,
                refresh_token: account.refresh_token || null,
                expires_at: account.expires_at || null,
                token_type: account.token_type || null,
                scope: account.scope || null,
                id_token: account.id_token || null,
                session_state: account.session_state || null,
                createdAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
                updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
            });
        } catch (error) {
            throw new Error(`Failed to create account: ${error}`);
        }
    }

    /**
     * Finds an account by provider and providerAccountId.
     * @param provider - The provider name.
     * @param providerAccountId - The provider account ID.
     * @returns The account or null if not found.
     */
    async findAccount(
        provider: AdapterAccount["provider"],
        providerAccountId: AdapterAccount["providerAccountId"]
    ): Promise<AdapterAccount | null> {
        try {
            const docId = `${provider}-${providerAccountId}`;
            const doc = await this.collection.doc(docId).get();
            if (!doc.exists) return null;
            return doc.data() as AdapterAccount;
        } catch (error) {
            throw new Error(
                `Failed to find account for provider ${provider} and providerAccountId ${providerAccountId}: ${error}`
            );
        }
    }

    /**
     * Deletes an account by provider and providerAccountId.
     * @param provider - The provider name.
     * @param providerAccountId - The provider account ID.
     */
    async deleteAccount(
        provider: AdapterAccount["provider"],
        providerAccountId: AdapterAccount["providerAccountId"]
    ): Promise<void> {
        try {
            const docId = `${provider}-${providerAccountId}`;
            await this.collection.doc(docId).delete();
        } catch (error) {
            throw new Error(
                `Failed to delete account for provider ${provider} and providerAccountId ${providerAccountId}: ${error}`
            );
        }
    }
}
