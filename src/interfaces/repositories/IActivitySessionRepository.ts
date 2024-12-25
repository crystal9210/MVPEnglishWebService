import {
    ActivitySession,
    GoalActivitySessionSchema,
    ServiceActivitySessionSchema,

} from "@/schemas/activitySessionSchema";

export interface IActivitySessionRepository {
    addSession(session: ActivitySession): Promise<void>;
    updateSession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void>;
    addHistoryItem(historyItem: ActivitySessionHistoryItem): Promise<void>;
    getHistoryBySessionId(sessionId: string): Promise<ActivitySessionHistoryItem[]>;
    getAllSessions(): Promise<ActivitySession[]>;
    deleteSession(sessionId: string): Promise<void>;
    getAllHistory(): Promise<ActivitySessionHistoryItem[]>;
    deleteHistoryItem(id: number): Promise<void>;
    updateHistoryItem(id: number, updatedHistoryItem: Partial<ActivitySessionHistoryItem>): Promise<void>;
}
