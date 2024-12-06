/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IAccountRepository } from "@/interfaces/repositories/IAccountRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { AdapterAccount } from "next-auth/adapters";

@injectable()
export class AccountRepository implements IAccountRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async createAccountEntry(uid: string, accountData: Omit<AdapterAccount, "userId"> & { userId: string }): Promise<void> {
        const firestore = this.firebaseAdmin.getFirestore();
        const accountsCollection = firestore.collection("accounts");
        const accountDocRef = accountsCollection.doc(uid);
        await accountDocRef.set(accountData);
        this.logger.info(`Account entry created/updated in Firestore for userId: ${uid}`);
    }
}
