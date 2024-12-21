// TODO インターフェース @/interfaces/clientSide/memo/idbが依存するようにリファクタ、ここはzodスキーマを定義する場所
import { Schema, z } from "zod";
import { DBSchema } from "idb";
import { Memo } from "./app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "./activity/clientSide/activitySessionHistoryItemSchema";
import { BaseValue } from "@/constants/clientSide/idb/objectStores";
import { IdbObjectStoreName, IDB_OBJECT_STORES } from "@/constants/clientSide/idb/objectStores";
import { scheduler } from "timers/promises";

// interface IndexConfig<Value> {
//     name: string;
//     keyPath: keyof Value | (keyof Value)[];
//     options?: IDBIndexParameters;
// };

// interface IdbObjectStoreConfig<
//     StoreName extends IdbObjectStoreName,
//     ValueType extends BaseValue,
//     Schema extends z.ZodType<ValueType>,
//     KeyType extends keyof ValueType | (keyof ValueType)[]
// > {
//     name: StoreName;
//     schema: Schema;
//     options: {
//         keyPath: KeyType;
//         autoIncrement?: boolean;
//     } & IDBObjectStoreParameters;
//     indexes?: IndexConfig<ValueType>[]; // the index can be multiple. (union?)
//     getKey: KeyType extends (keyof ValueType) // TODO これなんのための機能だっけ
//         ? (value: ValueType) => ValueType[KeyType]
//         : KeyType extends (keyof ValueType)[]
//         ?(value: ValueType) => (ValueType[KeyType[number]])[]
//         : never;
// };
// --- sample code of implementation using IdbObjectStoreConfig.getKey ---
// interface User {
//   firstName: string;
//   lastName: string;
//   age: number;
// }

// const UserConfig: IdbObjectStoreConfig<"users", User, ["firstName", "lastName"]> = {
//   name: "users",
//   schema: z.object({ /* ... */ }),
//   options: { keyPath: ["firstName", "lastName"] },
//   indexes: [],
//   getKey: (value) => [value.firstName, value.lastName],
// };

// const MemoListConfig: IdbObjectStoreConfig<"memoList", Memo, "id"> = {
//     name: IDB_OBJECT_STORES.MEMO_LIST,
//     schema: Schema,
//     options: { keyPath: "id" },
//     indexes: [
//         { name: "by-createdAt", keyPath: "createdAt" },
//         { name: "by-tags", keyPath: "tags", options: { multiEntry: true } },
//         { name: "by-deletedAt", keyPath: "deletedAt" },
//     ],
//     getKey: (value) => value.id,
// };



// const MemoSchema = z.object({
//     id: z.string(),
//     createdAt: DateSchema,
//     lastUpdatedAt: DateSchema,
//     deleted: z.boolean().default(false),
//     tags: z.array(z.string()), // TODO tagの仕様・設計まだできてない
//     deletedAt: OptionalDateSchema, // TrashedMemoSchemaを統合して管理した方が色々都合が良さそうなので
// });


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
