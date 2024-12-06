import { AdapterAccount } from "next-auth/adapters";

export interface IAccountRepository {
    createAccountEntry(uid: string, accountData: Omit<AdapterAccount, "userId"> & { userId: string }): Promise<void>;
}
