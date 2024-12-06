// src/services/userHistoryService.ts

import { FirebaseAdmin } from "./firebaseAdmin";
import { Firestore } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { UserHistoryItemSchema, UserHistoryItem } from "../schemas/userSchemas";
import { Logger } from "@/services/loggerService";

@injectable()
export class UserHistoryService {
    private firestore: Firestore;

    constructor(@inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin) {
        this.firestore = this.firebaseAdmin.firestore;
    }

    async getUserHistory(uid: string): Promise<UserHistoryItem[]> {
        try {
        const historyRef = this.firestore.collection("users").doc(uid).collection("history");
        const querySnapshot = await historyRef.get();

        const history: UserHistoryItem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const parsed = UserHistoryItemSchema.safeParse(data);
            if (parsed.success) {
            history.push(parsed.data);
            } else {
            Logger.warn(`Invalid history data for UID: ${uid}`);
            }
        });
        return history;
        } catch (error) {
        Logger.error(`Failed to get history for UID: ${uid}`, error);
        throw error;
        }
    }

    async recordUserHistory(uid: string, historyItem: UserHistoryItem): Promise<void> {
        try {
        const historyRef = this.firestore.collection("users").doc(uid).collection("history").doc(historyItem.problemId);
        await historyRef.set(historyItem, { merge: true });
        Logger.info(`User history recorded for UID: ${uid}, Problem ID: ${historyItem.problemId}`);
        } catch (error) {
        Logger.error(`Failed to record history for UID: ${uid}`, error);
        throw error;
        }
    }
}
