import { ActivitySession } from "@/domain/entities/ActivitySession";
import { UserHistoryItem } from "@/domain/entities/userHistoryItem";

export interface ActivityManagerInterface {
  startSession(session: ActivitySession): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  getCurrentSession(): ActivitySession | null;
  submitAnswer(sessionId: string, historyItem: UserHistoryItem): Promise<void>;
  subscribe(listener: (session: ActivitySession | null) => void): () => void; // メソッド変更
}
