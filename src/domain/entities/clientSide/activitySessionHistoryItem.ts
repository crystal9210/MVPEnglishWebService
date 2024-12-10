import { ActivitySessionHistoryItemSchema, ActivitySessionHistoryItemType } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";

export interface ClientActivitySessionHistoryItem {
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number;
    lastAttemptAt: string; // ISO string
    notes?: string;
}

export class ClientActivitySessionHistoryClass implements ClientActivitySessionHistoryItem {
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number;
    lastAttemptAt: string;
    notes?: string;

    constructor(data: ActivitySessionHistoryItemType) {
        const parseResult = ActivitySessionHistoryItemSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid UserHistoryItem data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.problemId = parseResult.data.problemId;
        this.result = parseResult.data.result;
        this.attempts = parseResult.data.attempts;
        this.lastAttemptAt = parseResult.data.lastAttemptAt;
        this.notes = parseResult.data.notes;
    }

    // TODO メソッド追加・調整
}
