import { ClientActivitySessionSchema, IClientActivitySession } from "@/schemas/activity/clientSide/clientActivitySessionSchema";
import { ClientActivitySessionHistoryItem } from "./activitySessionHistoryItem";
import { IProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

export class ClientActivitySession implements IClientActivitySession {
    sessionId: string;
    startedAt: string;
    // TODO classかitemかI...か、命名規則決定・調整
    history: ClientActivitySessionHistoryItem[];
    problemSet: IProblemSet;

    constructor(data: IClientActivitySession) {
        const parseResult = ClientActivitySessionSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid ClientActivitySession data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.sessionId = parseResult.data.sessionId as string;
        this.startedAt = parseResult.data.startedAt as string;
        this.history = parseResult.data.history as ClientActivitySessionHistoryItem[];
        this.problemSet = parseResult.data.problemSet;
    }

    // クライアントサイド専用のメソッドを追加
    addHistoryItem(item: ClientActivitySessionHistoryItem) {
        this.history.push(item);
    }

    // endSession(endTime: string) {
    //     // セッション終了時の処理を追加
    //     // 例: セッション終了時刻の設定など
    //     // クライアントサイド専用のプロパティがあれば追加
    // }

    // その他必要なメソッドを追加
}
