import { ActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { UserHistoryItem } from "@/domain/entities/userHistoryItem";

export interface ActivityServiceInterface {
    createSession(session: ActivitySession): Promise<void>;
    endSession(sessionId: string): Promise<void>;
    getSession(sessionId: string): Promise<ActivitySession | null>;
    submitAnswer(sessionId: string, historyItem: UserHistoryItem): Promise<void>;
}
