import { injectable, inject } from "tsyringe";
import type { IAuthAccountService } from "@/interfaces/services/IAuthAccountService";
import type { IAuthAccountRepository } from "@/interfaces/repositories/IAuthAccountRepository";
import type { IAuthUserService } from "@/interfaces/services/IAuthUserService";
import type { AdapterAccount, AdapterUser } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthAccountService implements IAuthAccountService {
    constructor(
        @inject(TSYRINGE_TOKENS.IAuthAccountRepository)
        private accountRepository: IAuthAccountRepository,
        @inject(TSYRINGE_TOKENS.IAuthUserService)
        private authUserService: IAuthUserService
    ) {}

    /**
     * Links an external account to a user.
     * @param account - The account information to link.
     */
    async linkAccount(account: AdapterAccount): Promise<void> {
        try {
            await this.accountRepository.createAccount(account);
        } catch (error) {
            throw new Error(`Failed to link account: ${error}`);
        }
    }

    /**
     * Unlinks an external account from a user.
     * @param providerAccountId - The provider and account ID.
     */
    async unlinkAccount(
        providerAccountId: Pick<
            AdapterAccount,
            "provider" | "providerAccountId"
        >
    ): Promise<void> {
        const { provider, providerAccountId: accountId } = providerAccountId;
        try {
            await this.accountRepository.deleteAccount(provider, accountId);
        } catch (error) {
            throw new Error(`Failed to unlink account: ${error}`);
        }
    }

    /**
     * Retrieves a user by their external account information.
     * @param providerAccountId - The provider and account ID.
     * @returns The user or null if not found.
     */
    async getUserByAccount(
        providerAccountId: Pick<
            AdapterAccount,
            "provider" | "providerAccountId"
        >
    ): Promise<AdapterUser | null> {
        const { provider, providerAccountId: accountId } = providerAccountId;
        try {
            const account = await this.accountRepository.findAccount(
                provider,
                accountId
            );
            if (!account) return null;
            const user = await this.authUserService.getUserById(account.userId);
            return user;
        } catch (error) {
            throw new Error(`Failed to get user by account: ${error}`);
        }
    }

    /**
     * Retrieves an account by provider and account ID.
     * @param provider - The provider name.
     * @param providerAccountId - The provider account ID.
     * @returns The account or null if not found.
     */
    async getAccount(
        provider: AdapterAccount["provider"],
        providerAccountId: AdapterAccount["providerAccountId"]
    ): Promise<AdapterAccount | null> {
        try {
            return await this.accountRepository.findAccount(
                provider,
                providerAccountId
            );
        } catch (error) {
            throw new Error(`Failed to get account: ${error}`);
        }
    }
}
