import { ClientActivitySessionSchema, ClientActivitySessionType } from "@/schemas/clientSide/clientActivitySessionSchema";
import { ClientActivitySessionHistoryClass } from "./activitySessionHistoryItem";

export interface ClientActivitySession {
    sessionId: string;
    startedAt: string; // ISO string
    history: ClientActivitySessionHistoryClass[];
    // 必要に応じてクライアントサイド専用のプロパティを追加
}

export class ClientActivitySessionClass implements ClientActivitySession {
    sessionId: string;
    startedAt: string;
    history: ClientActivitySessionHistoryClass[];

    constructor(data: ClientActivitySessionType) {
        const parseResult = ClientActivitySessionSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid ClientActivitySession data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        this.sessionId = parseResult.data.sessionId;
        this.startedAt = parseResult.data.startedAt;
        this.history = parseResult.data.history.map(item => new ClientActivitySessionHistoryClass(item));
    }

    // クライアントサイド専用のメソッドを追加
    addHistoryItem(item: ClientActivitySessionHistoryClass) {
        this.history.push(item);
    }

    // endSession(endTime: string) {
    //     // セッション終了時の処理を追加
    //     // 例: セッション終了時刻の設定など
    //     // クライアントサイド専用のプロパティがあれば追加
    // }

    // その他必要なメソッドを追加
}
