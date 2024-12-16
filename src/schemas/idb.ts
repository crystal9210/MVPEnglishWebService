// TODO インターフェース @/interfaces/clientSide/memo/idbが依存するようにリファクタ、ここはzodスキーマを定義する場所
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


// --- sample datas ---

//  -- memoList --
// {
//     "id": "memo1",
//     "content": "encrypted-This is a test memo.",
//     "createdAt": "2024-01-01T10:00:00Z",
//     "lastUpdatedAt": "2024-01-01T10:00:00Z",
//     "tags": ["work", "urgent"],
//     "deleted": false,
//     "deletedAt": "1970-01-01T00:00:00Z"
// }

// -- trashedMemoList --
// {
//     "id": "memo2",
//     "content": "encrypted-This memo is trashed.",
//     "createdAt": "2024-01-02T11:00:00Z",
//     "lastUpdatedAt": "2024-01-02T11:30:00Z",
//     "tags": ["personal"],
//     "deleted": true,
//     "deletedAt": "2024-01-05T12:00:00Z"
// }

//  -- activitySession --
// {
//     "sessionId": 1,
//     "userId": "user123",
//     "startedAt": "2024-01-10T09:00:00Z",
//     "endedAt": "2024-01-10T17:00:00Z",
//     "activities": [
//         // content of the activity(?)
//     ]
// }

// -- history --
// {
//     "id": 1,
//     "sessionId": "session123",
//     "historyItem": {
//         "action": "add_memo",
//         "timestamp": "2024-01-10T09:15:00Z",
//         "details": {
//             "memoId": "memo1"
//         }
//     }
// }
