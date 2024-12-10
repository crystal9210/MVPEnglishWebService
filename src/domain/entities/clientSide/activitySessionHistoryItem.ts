import { ActivitySessionHistoryItemSchema, IActivitySessionHistoryItem } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";

export class ClientActivitySessionHistoryItem implements IActivitySessionHistoryItem {
    // TODO TSの変数のスコープ・アクセス制御・ライフサイクルなどの仕様調査・アクセス修飾子調整
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number;
    lastAttemptAt: string;
    notes?: string;

    constructor(data: IActivitySessionHistoryItem) {
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
}
