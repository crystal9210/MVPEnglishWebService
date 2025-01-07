/* eslint-disable no-unused-vars */
import type { AdapterAccount } from "next-auth/adapters";

export interface IAuthAccountRepository {
    /**
     * Creates a new account.
     * @param account - The account data to create.
     */
    createAccount(account: AdapterAccount): Promise<void>;

    /**
     * Finds an account by provider and providerAccountId.
     * @param provider - The provider name.
     * @param providerAccountId - The provider account ID.
     * @returns The account or null if not found.
     */
    findAccount(
        provider: AdapterAccount["provider"],
        providerAccountId: AdapterAccount["providerAccountId"]
    ): Promise<AdapterAccount | null>;

    /**
     * Deletes an account by provider and providerAccountId.
     * @param provider - The provider name.
     * @param providerAccountId - The provider account ID.
     */
    deleteAccount(
        provider: AdapterAccount["provider"],
        providerAccountId: AdapterAccount["providerAccountId"]
    ): Promise<void>;
}
