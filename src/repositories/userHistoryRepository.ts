import { injectable, inject } from "tsyringe";
import type { IUserHistoryRepository } from "@/interfaces/repositories/IUserHistoryRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { UserHistoryItem } from "@/schemas/userSchemas";
import { UserHistoryItemSchema } from "@/schemas/userSchemas";

@injectable()
export class UserHistoryRepository implements IUserHistoryRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async getUserHistory(userId: string): Promise<UserHistoryItem[]> {
        const firestore = this.firebaseAdmin.getFirestore();
        const historyRef = firestore.collection("users").doc(userId).collection("history");
        const querySnapshot = await historyRef.get();

        const history: UserHistoryItem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const parsed = UserHistoryItemSchema.safeParse(data);
            if (parsed.success) {
                history.push(parsed.data);
            } else {
                this.logger.warn(`Invalid history data for UID=${userId}`, { errors: parsed.error.errors });
            }
        });
        this.logger.info(`User history fetched from repository: UID=${userId}, Count=${history.length}`);
        return history;
    }

    async recordUserHistory(userId: string, historyItem: UserHistoryItem): Promise<void> {
        const firestore = this.firebaseAdmin.getFirestore();
        const parsed = UserHistoryItemSchema.safeParse(historyItem);
        if (!parsed.success) {
            this.logger.warn(`Invalid history item for UID=${userId}`, { errors: parsed.error.errors });
            throw new Error("Invalid history data");
        }

        const historyRef = firestore.collection("users").doc(userId).collection("history").doc(parsed.data.problemId);
        await historyRef.set(parsed.data, { merge: true });
        this.logger.info(`User history recorded in repository: UID=${userId}, ProblemID=${parsed.data.problemId}`);
    }
}
