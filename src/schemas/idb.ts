import { DBSchema } from "idb";
import { Memo } from "./app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "./activity/clientSide/activitySessionHistoryItemSchema";

export interface MyIDB extends DBSchema {
    memoList: {
        key: string;
        value: Memo;
        indexes: {
            "by-createdAt": Date;
            "by-tags": string[];
        };
    };
    trashedMemoList: {
        key: string;
        value: Memo;
        indexes: {
            "by-deletedAt": Date;
        };
    };
    activitySessions: {
        key: number;
        value: ClientActivitySession;
    };
    history: {
        key: number;
        value: {
            id?: number;
            sessionId: string;
            historyItem: IActivitySessionHistoryItem;
        };
        indexes: {
            "by-sessionId": string;
        };
    }
}
