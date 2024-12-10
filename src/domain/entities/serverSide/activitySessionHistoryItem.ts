import { ActivitySessionHistoryItemSchema, IActivitySessionHistoryItem } from "@/schemas/activity/serverSide/activitySessionHistoryItemSchema";

export class ServerActivitySessionHistoryItemClass implements IActivitySessionHistoryItem {
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number;
    lastAttemptAt: string;
    notes?: string;

    constructor(data: IActivitySessionHistoryItem) {
        const parseResult = ActivitySessionHistoryItemSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid ActivitySessionHistoryItem data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.problemId = parseResult.data.problemId;
        this.result = parseResult.data.result;
        this.attempts = parseResult.data.attempts;
        this.lastAttemptAt = parseResult.data.lastAttemptAt;
        this.notes = parseResult.data.notes;
    }

    // 必要に応じ追加
}
