import type { AdapterAccount, AdapterUser } from "next-auth/adapters";

export interface IAuthAccountService {
    /**
     * Links an external account to a user.
     * @param account - The account information to link.
     */
    linkAccount(account: AdapterAccount): Promise<void>;

    /**
     * Unlinks an external account from a user.
     * @param providerAccountId - The provider and account ID.
     */
    unlinkAccount(
        providerAccountId: Pick<
            AdapterAccount,
            "provider" | "providerAccountId"
        >
    ): Promise<void>;

    /**
     * Retrieves a user by their external account information.
     * @param providerAccountId - The provider and account ID.
     * @returns The user or null if not found.
     */
    getUserByAccount(
        providerAccountId: Pick<
            AdapterAccount,
            "provider" | "providerAccountId"
        >
    ): Promise<AdapterUser | null>;

    /**
     * Retrieves an account by provider and account ID.
     * @param provider - The provider name.
     * @param providerAccountId - The provider account ID.
     * @returns The account or null if not found.
     */
    getAccount(
        provider: AdapterAccount["provider"],
        providerAccountId: AdapterAccount["providerAccountId"]
    ): Promise<AdapterAccount | null>;
}
