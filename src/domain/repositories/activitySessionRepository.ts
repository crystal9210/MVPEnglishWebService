import { injectable, inject } from "tsyringe";
import { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";
import { ServerActivitySession } from "@/domain/entities/serverSide/activitySession";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";

@injectable()
export class ActivitySessionRepository implements IActivitySessionRepository {
    private firestore: FirebaseFirestore.Firestore;

    constructor(
        @inject("IFirebaseAdmin") private firebaseAdmin: IFirebaseAdmin
    ) {
        this.firestore = this.firebaseAdmin.getFirestore();
    }

    async saveActivitySession(session: ServerActivitySession): Promise<void> {
        try {
            const sessionRef = this.firestore.collection("activitySessions").doc(session.sessionId);
            const sessionData = {
                sessionId: session.sessionId,
                startedAt: session.startedAt,
                history: session.history.map(item => ({
                    problemId: item.problemId,
                    result: item.result,
                    attempts: item.attempts,
                    lastAttemptAt: item.lastAttemptAt,
                    notes: item.notes || null,
                })),
                // 必要に応じ他のプロパティ追加
            };
            await sessionRef.set(sessionData, { merge: true });
        } catch (error) {
            throw new Error(`Failed to save activity session: ${error}`);
        }
    }

}
