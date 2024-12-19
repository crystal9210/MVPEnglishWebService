import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "@/schemas/activity/serverSide/activitySessionHistoryItemSchema";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";

// オブジェクトストア命名
export const IDB_OBJECT_STORES = {
    MEMO_LIST: "memoList",
    TRASHED_MEMO_LIST: "trashedMemoList",
    ACTIVITY_SESSIONS: "activitySessions",
    HISTORY: "history",
} as const;


export type IdbObjectStoreName = typeof IDB_OBJECT_STORES[keyof typeof IDB_OBJECT_STORES];

export interface IndexConfig<
    Value,
    Index extends PropertyKey = keyof Value,
> {
    name: `by-${string & Index}`;
    keyPath: Index;
    options?: IDBIndexParameters;
}
// --- index example ---
// {
//     name: "by-createdAt",
//     keyPath: "createdAt"
// }


export type SimpleValue = string | number | Date | boolean | null | undefined;
export type IndexableValue = SimpleValue | Array<SimpleValue>;

export type BaseValue =
    | ClientActivitySession
    | Memo
    | ClientActivitySessionHistoryItem;

type GetPrimaryKey<ValueType extends Record<string, unknown>> =
    keyof ValueType extends infer K
        ? K extends "id" | "sessionId"
            ? K | K[]
            :never
        :never;
// >> keyPath: "id" | "sessionId" | ("id" | "sessionId")[]
// --- NOTE ---
// type Example = keyof "memoList"; // >> never

export interface IdbObjectStoreConfig<
    StoreName extends IdbObjectStoreName = IdbObjectStoreName,
    ValueType extends BaseValue = BaseValue,
    Index extends Record<string, IndexableValue> = Record<string, IndexableValue>,
    Indexes extends IndexConfig<ValueType, keyof Index>[] = IndexConfig<ValueType, keyof Index>[]
> {
    name: StoreName;
    options: {
        keyPath: GetPrimaryKey<ValueType>;
        autoIncrement?: boolean;
    } & IDBObjectStoreParameters;
    indexes?: Indexes;
}

const MemoListConfig: IdbObjectStoreConfig<"memoList", Memo, {
    createdAt: Date;
    lastUpdatedAt: Date;
    deleted: boolean;
    tags: string[];
}, [
    IndexConfig<Memo, "createdAt">,
    IndexConfig<Memo, "lastUpdatedAt">,
    IndexConfig<Memo, "tags">
]> = {
    name: IDB_OBJECT_STORES.MEMO_LIST,
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
} as const;

const TrashedMemoListConfig: IdbObjectStoreConfig<"trashedMemoList", Memo,{
    deletedAt: Date;
}, [
    IndexConfig<Memo, "deletedAt">
]> = {
    name: IDB_OBJECT_STORES.TRASHED_MEMO_LIST,
    options: { keyPath: "id" },
    indexes: [
        {
            name: "by-deletedAt",
            keyPath: "deletedAt"
        }
    ]
} as const;

const ActivitySessionsConfig: IdbObjectStoreConfig<"activitySessions", ClientActivitySession> = {
    name: IDB_OBJECT_STORES.ACTIVITY_SESSIONS,
    options: { keyPath: "sessionId" },
    indexes: [],
} as const;

const HistoryConfig: IdbObjectStoreConfig<"history", {
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
    name: IDB_OBJECT_STORES.HISTORY,
    options: { keyPath: "id", autoIncrement: true },
    indexes: [
        { name: "by-sessionId", keyPath: "sessionId" }, // セッションIDで検索・フィルタリングすることを想定
    ],
} as const;


export type IdbObjectStoreConfigs = readonly [
    IdbObjectStoreConfig<"memoList", Memo, {
        createdAt: Date;
        lastUpdatedAt: Date;
        deleted: boolean;
        tags: string[];
    }, [
        IndexConfig<Memo, "createdAt">,
        IndexConfig<Memo, "lastUpdatedAt">,
        IndexConfig<Memo, "tags">
    ]>,
    IdbObjectStoreConfig<"trashedMemoList", Memo, {
        deletedAt: Date;
    }, [
        IndexConfig<Memo, "deletedAt">
    ]>,
    IdbObjectStoreConfig<"activitySessions", ClientActivitySession>,
    IdbObjectStoreConfig<"history", {
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
    ]>
];

export const IDB_OBJECT_STORE_CONFIGS: IdbObjectStoreConfigs = [
    MemoListConfig,
    TrashedMemoListConfig,
    ActivitySessionsConfig,
    HistoryConfig
] as const;

// --- NOTE ---
// type StoreNames = typeof OBJECT_STORE_CONFIGS[number]["name"];
// >> "memoList" | "trashedMemoList" | "activitySessions" | "history"

// --- Readonly utility example ---
// interface Example {
//     a: number;
//     b: number;
// }

// const obj: Readonly<Example> = { a: 1, b: 2 };
// obj.a = 3; // エラー
