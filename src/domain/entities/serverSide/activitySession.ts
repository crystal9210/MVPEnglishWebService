import { ActivitySessionSchema, ActivitySessionType } from "@/schemas/activity/serverSide/activitySessionSchema";
import { ServerActivitySessionHistoryItemClass } from "./activitySessionHistoryItem";

export interface ServerActivitySession {
    sessionId: string;
    startedAt: string; // ISO string
    history: ServerActivitySessionHistoryItemClass[];
    // TODO バイパス対策用のフィールド実装(？)
}

export class ServerActivitySessionClass implements ServerActivitySession {
    sessionId: string;
    startedAt: string;
    history: ServerActivitySessionHistoryItemClass[];

    constructor(data: ActivitySessionType) {
        const parseResult = ActivitySessionSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid ActivitySession data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.sessionId = parseResult.data.sessionId;
        this.startedAt = parseResult.data.startedAt;
        this.history = parseResult.data.history.map(item => new ServerActivitySessionHistoryItemClass(item));
    }

    addHistoryItem(item: ServerActivitySessionHistoryItemClass) {
        this.history.push(item);
    }


}
