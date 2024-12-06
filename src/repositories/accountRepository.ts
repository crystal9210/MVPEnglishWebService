import { injectable, inject } from "tsyringe";
import type { IAccountRepository } from "@/interfaces/repositories/IAccountRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { AdapterAccount } from "next-auth/adapters";
import { Firestore } from "firebase-admin/firestore";

@injectable()
export class AccountRepository implements IAccountRepository {
    private readonly firestore: Firestore;

    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {
        this.firestore = this.firebaseAdmin.getFirestore();
    }

    async createAccountEntry(uid: string, accountData: Omit<AdapterAccount, "userId"> & { userId: string }): Promise<void> {
        const accountsCollection = this.firestore.collection("accounts");
        const accountDocRef = accountsCollection.doc(uid);
        await accountDocRef.set(accountData);
        this.logger.info(`Account entry created/updated in Firestore for userId: ${uid}`);
    }
}
