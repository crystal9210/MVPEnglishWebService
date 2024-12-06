/* eslint-disable no-unused-vars */
import { UserHistoryItem } from "@/schemas/userSchemas";

export interface IUserHistoryService {
    getUserHistory(uid: string): Promise<UserHistoryItem[]>;
    recordUserHistory(uid: string, historyItem: UserHistoryItem): Promise<void>;
}
