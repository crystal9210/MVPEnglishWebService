import { ActivitySessionHistoryItemSchema, IActivitySessionHistoryItem } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";

export class ClientActivitySessionHistoryItem implements IActivitySessionHistoryItem {
    id: string;
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

        this.id = parseResult.data.id;
        this.problemId = parseResult.data.problemId;
        this.result = parseResult.data.result;
        this.attempts = parseResult.data.attempts;
        this.lastAttemptAt = parseResult.data.lastAttemptAt;
        this.notes = parseResult.data.notes;
    }
}
