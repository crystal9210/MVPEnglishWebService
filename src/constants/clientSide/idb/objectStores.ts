// IDBの基底ファイルモジュール

// 本ファイルモジュール要求定義
// TODO オブジェクト名に応じてオブジェクトストアに格納するデータバリューの型情報が正確に取得してアクセスできる
// TODO オブジェクト名に応じてキー(プライマリキー;主キー)が正確に取得でき、それによりアクセスパスを取得し、かつidとなる情報からデータの整合性等を保証できる
import { Memo, MemoSchema } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem, ActivitySessionHistoryItemSchema } from "@/schemas/activity/serverSide/activitySessionHistoryItemSchema";
import { z } from "zod";
import { ClientActivitySessionSchema } from "@/schemas/activity/clientSide/clientActivitySessionSchema";

// List of the idb object store literals.
export const IDB_OBJECT_STORES = {
    MEMO_LIST: "memoList",
    TRASHED_MEMO_LIST: "trashedMemoList",
    ACTIVITY_SESSIONS: "activitySessions",
    HISTORY: "history",
} as const;

// union type of the list; IDB_OBJECT_STORES
export type IdbObjectStoreName = typeof IDB_OBJECT_STORES[keyof typeof IDB_OBJECT_STORES];

export type ObjectStoreConfig<
    StoreName extends IdbObjectStoreName,
    ItemSchema extends z.ZodTypeAny,
    FirestorePath extends string, // TODO 適当にセットを取ってくる
    KeyType extends string | string[], // TODO 厳密化
> = {
    name: StoreName;
    schema: ItemSchema
    firestorePath: FirestorePath;
    options: IDBObjectStoreParameters & { keyPath: KeyType } // options includes "keyPath" field.
};

export const IDB_OBJECT_STORE_CONFIGS = [
    {
        name: "memoList",
        firestorePath: "memos", // 例: Firestore のパス
        schema: MemoSchema,
        options: { keyPath: "id" }
    } satisfies ObjectStoreConfig<"memoList", typeof MemoSchema, "memos", "id">, // TODO "id"などのキーを@/constants/..に配置・統合管理
    {
        name: "trashedMemoList",
        firestorePath: "trashedMemos",
        schema: MemoSchema,
        options: { keyPath: "id" }
    } satisfies ObjectStoreConfig<"trashedMemoList", typeof MemoSchema, "trashedMemos", "id">,
    {
        name: "activitySessions",
        firestorePath: "activity_sessions",
        schema: ClientActivitySessionSchema,
        options: { keyPath: "sessionId" }
    } satisfies ObjectStoreConfig<"activitySessions", typeof ClientActivitySessionSchema, "activity_sessions", "sessionId">,
    {
        name: "history",
        firestorePath: "history_items",
        schema: z.object({ // インラインでスキーマを定義することも可能
            id: z.number().optional(),
            sessionId: z.string(),
            historyItem: ActivitySessionHistoryItemSchema,
        }),
        options: { keyPath: "id" }
    } satisfies ObjectStoreConfig<"history", z.ZodObject<{
        id: z.ZodOptional<z.ZodNumber>;
        sessionId: z.ZodString;
        historyItem: typeof ActivitySessionHistoryItemSchema;
    }>, "history_items", "id">,
] as const;

export type IdbObjectStoreConfigs = typeof IDB_OBJECT_STORE_CONFIGS;

// --- use case sample of "getObjectStoreConfig" func---
// const memoListConfig = getObjectStoreConfig(IDB_OBJECT_STORES.MEMO_LIST);
// if (memoListConfig) {
//     console.log(memoListConfig.name); // >> "memoList"
//     console.log(memoListConfig.schema); // >> "memos" (?)
//     console.log(memoListConfig.schema);
// }
export function getObjectStoreConfig<T extends IdbObjectStoreName>(
    storeName: T
): Extract<ObjectStoreConfig<T, any, any>, { name: T }> | undefined {
    return IDB_OBJECT_STORE_CONFIGS.find((config) => config.name === storeName) as Extract<ObjectStoreConfig<T, any, any>, { name: T }> | undefined;
}


// export const IDB_OBJECT_STORE_CONFIGS: IdbObjectStoreConfigs = [
//     MemoListConfig,
//     TrashedMemoListConfig,
//     ActivitySessionsConfig,
//     HistoryConfig
// ] as const;

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



// export interface IndexConfig<
//     Value,
//     Index extends PropertyKey = keyof Value,
// > {
//     name: `by-${string & Index}`;
//     keyPath: Index;
//     options?: IDBIndexParameters;
// }
// --- index example ---
// {
//     name: "by-createdAt",
//     keyPath: "createdAt"
// }


// export type SimpleValue = string | number | Date | boolean | null | undefined;
// export type IndexableValue = SimpleValue | Array<SimpleValue>;

// export type BaseValue =
//     | ClientActivitySession
//     | Memo
//     | ClientActivitySessionHistoryItem;

// type GetPrimaryKey<ValueType extends Record<string, unknown>> =
//     keyof ValueType extends infer K
//         ? K extends "id" | "sessionId"
//             ? K | K[]
//             :never
//         :never;
// >> keyPath: "id" | "sessionId" | ("id" | "sessionId")[]
// --- NOTE ---
// type Example = keyof "memoList"; // >> never

// export interface IdbObjectStoreConfig<
//     StoreName extends IdbObjectStoreName = IdbObjectStoreName,
//     ValueType extends BaseValue = BaseValue,
//     Index extends Record<string, IndexableValue> = Record<string, IndexableValue>,
//     Indexes extends IndexConfig<ValueType, keyof Index>[] = IndexConfig<ValueType, keyof Index>[]
// > {
//     name: StoreName;
//     options: {
//         keyPath: GetPrimaryKey<ValueType>;
//         autoIncrement?: boolean;
//     } & IDBObjectStoreParameters;
//     indexes?: Indexes;
// }

// const MemoListConfig: IdbObjectStoreConfig<"memoList", Memo, {
//     createdAt: Date;
//     lastUpdatedAt: Date;
//     deleted: boolean;
//     tags: string[];
// }, [
//     IndexConfig<Memo, "createdAt">,
//     IndexConfig<Memo, "lastUpdatedAt">,
//     IndexConfig<Memo, "tags">
// ]> = {
//     name: IDB_OBJECT_STORES.MEMO_LIST,
//     options: { keyPath: "id" },
//     indexes: [
//         {
//             name: "by-createdAt",
//             keyPath: "createdAt"
//         },
//         {
//             name: "by-lastUpdatedAt", // メモを最終更新日時でソート・フィルタリングすることを想定
//             keyPath: "lastUpdatedAt"
//         },
//         {
//             name: "by-tags",
//             keyPath: "tags",
//             options: { multiEntry: true }
//         }
//     ],
// } as const;

// const TrashedMemoListConfig: IdbObjectStoreConfig<"trashedMemoList", Memo,{
//     deletedAt: Date;
// }, [
//     IndexConfig<Memo, "deletedAt">
// ]> = {
//     name: IDB_OBJECT_STORES.TRASHED_MEMO_LIST,
//     options: { keyPath: "id" },
//     indexes: [
//         {
//             name: "by-deletedAt",
//             keyPath: "deletedAt"
//         }
//     ]
// } as const;

// const ActivitySessionsConfig: IdbObjectStoreConfig<"activitySessions", ClientActivitySession> = {
//     name: IDB_OBJECT_STORES.ACTIVITY_SESSIONS,
//     options: { keyPath: "sessionId" },
//     indexes: [],
// } as const;

// const HistoryConfig: IdbObjectStoreConfig<"history", ClientActivitySession , {
//     sessionId: string;
// }, [
//     IndexConfig<{
//         id?: number;
//         sessionId: string;
//         historyItem: IActivitySessionHistoryItem;
//     }, "sessionId">
// ]> = {
//     name: IDB_OBJECT_STORES.HISTORY,
//     options: { keyPath: "id", autoIncrement: true },
//     indexes: [
//         { name: "by-sessionId", keyPath: "sessionId" }, // セッションIDで検索・フィルタリングすることを想定
//     ],
// } as const;

// export type IdbObjectStoreConfigs = readonly [
//     IdbObjectStoreConfig<"memoList", Memo, {
//         createdAt: Date;
//         lastUpdatedAt: Date;
//         deleted: boolean;
//         tags: string[];
//     }, [
//         IndexConfig<Memo, "createdAt">,
//         IndexConfig<Memo, "lastUpdatedAt">,
//         IndexConfig<Memo, "tags">
//     ]>,
//     IdbObjectStoreConfig<"trashedMemoList", Memo, {
//         deletedAt: Date;
//     }, [
//         IndexConfig<Memo, "deletedAt">
//     ]>,
//     IdbObjectStoreConfig<"activitySessions", ClientActivitySession>,
//     IdbObjectStoreConfig<"history", ClientActivitySession, {
//         sessionId: string;
//     }, [
//         IndexConfig<{
//             id?: number;
//             sessionId: string;
//             historyItem: IActivitySessionHistoryItem;
//         }, "sessionId">
//     ]>
// ];
