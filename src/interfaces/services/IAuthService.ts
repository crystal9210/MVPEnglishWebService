import { AdapterAccount } from "next-auth/adapters";
import type { UserRecord } from "firebase-admin/auth";
// TODO
export interface IAuthService {
    createAccountEntry(uid: string, accountData: AdapterAccount): Promise<void>;
    getUserByEmail(email: string): Promise<UserRecord | undefined>;
    createUser(email: string, name?: string, photoURL?: string): Promise<UserRecord>;
    deleteUser(uid: string): Promise<void>;
}
