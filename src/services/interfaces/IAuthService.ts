import { AdapterAccount } from "next-auth/adapters";
import { FirebaseAdmin } from "../firebaseAdmin";

export interface IAuthService {
    createAccountEntry(uid: string, accountData: AdapterAccount): Promise<void>;
    getUserByEmail(email: string): Promise<FirebaseAdmin.auth.UserRecord | undefined>;
    createUser(email: string, name?: string, photoURL?: string): Promise<FirebaseAdmin.auth.UserRecord>;
    deleteUser(uid: string): Promise<void>;
}
