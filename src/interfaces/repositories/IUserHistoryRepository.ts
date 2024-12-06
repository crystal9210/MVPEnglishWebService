import type { UserHistoryItem } from "@/schemas/userSchemas";

export interface IUserHistoryRepository {
    getUserHistory(userId: string): Promise<UserHistoryItem[]>;
    recordUserHistory(userId: string, historyItem: UserHistoryItem): Promise<void>;
}
