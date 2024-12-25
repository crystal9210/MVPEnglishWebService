import { UserHistoryItemSchema, UserHistoryItem as UserHistoryItemType } from "@/schemas/activity/problemHistorySchemas";

export interface UserHistoryItem {
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number;
    lastAttemptAt: string; // ISO string
    notes?: string;
}

export class UserHistoryItemClass implements UserHistoryItem {
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number; // TODO 設計に合わせ調整
    lastAttemptAt: string;
    notes?: string;

    constructor(data: UserHistoryItemType) {
        const parseResult = UserHistoryItemSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid UserHistoryItem data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.problemId = parseResult.data.problemId;
        this.result = parseResult.data.result;
        this.attempts = parseResult.data.attempts;
        this.lastAttemptAt = parseResult.data.lastAttemptAt instanceof Date
            ? parseResult.data.lastAttemptAt.toISOString()
            : parseResult.data.lastAttemptAt;
        this.notes = parseResult.data.notes;
    }
}
