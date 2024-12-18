import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "@/schemas/activity/serverSide/activitySessionHistoryItemSchema";

export const OBJECT_STORES = {
    MEMO_LIST: "memoList",
    TRASHED_MEMO_LIST: "trashedMemoList",
    ACTIVITY_SESSIONS: "activitySessions",
    HISTORY: "history",
} as const;

export type ObjectStoreName = typeof OBJECT_STORES[keyof typeof OBJECT_STORES]; // TODO

export interface IndexConfig<
    Value,
    Index extends PropertyKey = keyof Value,
> {
    name: `by-${string & Index}`;
    keyPath: Index;
    options?: IDBIndexParameters;
}

export type SimpleValue = string | number | Date | boolean | null | undefined;
export type IndexableValue = SimpleValue | Array<SimpleValue>;

export type BaseValue =
    | {
        [key: string]: unknown | Date | number | string | boolean | null | undefined | BaseValue | BaseValue[];
        }
    | ClientActivitySession
    | Memo
    | {
        id?: number;
        sessionId: string;
        historyItem: IActivitySessionHistoryItem;
    };

export interface ObjectStoreConfig<
    T extends ObjectStoreName = ObjectStoreName,
    Value = any,
    Index extends Record<string, IndexableValue> = Record<string, IndexableValue>,
    Indexes extends IndexConfig<Value, keyof Index>[] = IndexConfig<Value, keyof Index>[]
> {
    name: T;
    options: {
        keyPath: keyof Value;
        autoIncrement?: boolean;
    } & IDBObjectStoreParameters;
    indexes?: Indexes;
}

const MemoListConfig: ObjectStoreConfig<"memoList", Memo, {
    createdAt: Date;
    lastUpdatedAt: Date;
    deleted: boolean;
    tags: string[];
}, [
    IndexConfig<Memo, "createdAt">,
    IndexConfig<Memo, "lastUpdatedAt">,
    IndexConfig<Memo, "tags">
]> = {
    name: OBJECT_STORES.MEMO_LIST,
    options: { keyPath: "id" },
    indexes: [
        {
            name: "by-createdAt",
            keyPath: "createdAt"
        },
        {
            name: "by-lastUpdatedAt", // メモを最終更新日時でソート・フィルタリングすることを想定
            keyPath: "lastUpdatedAt"
        },
        {
            name: "by-tags",
            keyPath: "tags",
            options: { multiEntry: true }
        }
    ],
}

const TrashedMemoListConfig: ObjectStoreConfig<"trashedMemoList", Memo,{
    deletedAt: Date;
}, [
    IndexConfig<Memo, "deletedAt">
]> = {
    name: OBJECT_STORES.TRASHED_MEMO_LIST,
    options: { keyPath: "id" },
    indexes: [
        {
            name: "by-deletedAt",
            keyPath: "deletedAt"
        }
    ]
}

// ActivitySessionsConfigの定義
const ActivitySessionsConfig: ObjectStoreConfig<"activitySessions", ClientActivitySession> = {
    name: "activitySessions",
    options: { keyPath: "sessionId" },
    indexes: [],
};

const HistoryConfig: ObjectStoreConfig<"history", {
    id?: number;
    sessionId: string;
    historyItem: IActivitySessionHistoryItem;
}, {
    sessionId: string;
}, [
    IndexConfig<{
        id?: number;
        sessionId: string;
        historyItem: IActivitySessionHistoryItem;
    }, "sessionId">
]> = {
    name: OBJECT_STORES.HISTORY,
    options: { keyPath: "id", autoIncrement: true },
    indexes: [
        { name: "by-sessionId", keyPath: "sessionId" }, // セッションIDで検索・フィルタリングすることを想定
    ],
};


export const OBJECT_STORE_CONFIGS: readonly ObjectStoreConfig[] = [
    MemoListConfig,
    TrashedMemoListConfig,
    ActivitySessionsConfig,
    HistoryConfig
] as const;

export type ObjectStoreConfigs = typeof OBJECT_STORE_CONFIGS;

// --- NOTE ---
// type StoreNames = typeof OBJECT_STORE_CONFIGS[number]["name"];
// >> "memoList" | "trashedMemoList" | "activitySessions" | "history"
