import { ClientActivitySessionSchema, ClientActivitySessionType } from "@/schemas/activity/clientSide/clientActivitySessionSchema";
import { ClientActivitySessionHistoryItem } from "./activitySessionHistoryItem";
import { ProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

export class ClientActivitySession implements ClientActivitySessionType {
    sessionId: string;
    startedAt: Date;
    endedAt: Date;
    history: ClientActivitySessionHistoryItem[];
    problemSet: ProblemSet;

    constructor(data: ClientActivitySessionType) {
        const parseResult = ClientActivitySessionSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid ClientActivitySession data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.sessionId = parseResult.data.sessionId;
        this.startedAt = new Date(parseResult.data.startedAt);
        this.endedAt = new Date(parseResult.data.endedAt);
        this.history = parseResult.data.history;
        this.problemSet = parseResult.data.problemSet;
    }

    addHistoryItem(item: ClientActivitySessionHistoryItem) {
        this.history.push(item);
    }

    endSession(endTime: string) {
        this.endedAt = new Date(endTime);
    }

    // TODO
    isSessionEnded(): boolean {
        return this.endedAt !== new Date(0);
    }

}
