import { DBSchema } from "idb";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";
import { IDB_OBJECT_STORE_CONFIGS, IdbObjectStoreConfig, IdbObjectStoreName, IndexConfig } from "@/constants/clientSide/idb/objectStores";
import { ValueType } from "tailwindcss/types/config";

// TODO アクティビティマネージャでもidbを利用する形式になっている、というか基本的にコンテキスト系の実装ロジックが関わる機能に関してはデータの永続性のためにidbを利用するが互いに衝突をする可能性がないか
// TODO indexesに関してこれはメモの検索機能に関連するフィールドだが"by-tags"におけるテキストリストからのabc順におけるソート処理などは想定しなくていいのか ＋ ソートをするためにタグのリストをユーザごとに用意してソートか何かで保持するようにするのはコスパ的にどうか検証・仕様設計

// --- NOTE: TSの型システム:配列の順序は型の構造に影響せず、型レベルでの操作:構造的な一致に基づいて行われるため、配列内の要素の順序は無関係

type GenerateStoreValueMap<T extends readonly IdbObjectStoreConfig[]> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }> extends IdbObjectStoreConfig<K, infer ValueType>
        ? ValueType
        : never;
};

// 各オブジェクトストアのインデックス名とkeyPathをマッピングする型を動的生成
type GenerateStoreIndexMap<T extends readonly IdbObjectStoreConfig[]> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>["indexes"] extends infer Indexes
        ? Indexes extends IndexConfig<infer VT, keyof infer VI>[] // VTとVIをinferで取得
            ? {
                [I in (Indexes & IndexConfig<VT, keyof VI>)[number]["name"]]: Extract<(Indexes & IndexConfig<VT, keyof VI>)[number], { name: I }>["keyPath"]; // 交差型を使って型を絞り込む
            }
            : Record<string, never>
        : Record<string, never>;
};

type StoreValueMap = GenerateStoreValueMap<typeof IDB_OBJECT_STORE_CONFIGS>;
// type StoreValueMap = {
//     memoList: Memo;
//     trashedMemoList: Memo;
//     activitySessions: ClientActivitySession;
//     history: {
//         id?: number;
//         sessionId: string;
//         historyItem: IActivitySessionHistoryItem;
//     };
// };
type StoreIndexMap = GenerateStoreIndexMap<typeof IDB_OBJECT_STORE_CONFIGS>;
// type StoreIndexMap = {
//     memoList: {
//         "by-createdAt": "createdAt";
//         "by-tags": "tags";
//     };
//     trashedMemoList: {
//         "by-deletedAt": "deletedAt";
//     };
//     activitySessions: Record<string, never>;
//     history: {
//         "by-sessionId": "sessionId";
//     };
// };


type GetKeyType<T extends readonly IdbObjectStoreConfig[], K extends IdbObjectStoreName> =
    Extract<T[number], { name: K }>["options"]["keyPath"] extends infer KeyPath
        ? KeyPath extends string
            ? KeyPath extends "id"
                ? string | number
                : string
            : KeyPath extends (infer P)[] // 複合キーの場合
                ? P
                : never
        : never;

type DynamicObjectStoreTypes<T extends readonly IdbObjectStoreConfig[]> = {
    [K in T[number]["name"]]: {
        key: GetKeyType<T, K>;
        value: StoreValueMap[K];
        indexes: StoreIndexMap[K];
    };
};

export type MyIDB = DBSchema & DynamicObjectStoreTypes<typeof IDB_OBJECT_STORE_CONFIGS>;

// type StoreIndexMap = {
//     [OBJECT_STORES.MEMO_LIST]: {
//         "by-createdAt": Date;
//         "by-tags": string[];
//     };
//     [OBJECT_STORES.TRASHED_MEMO_LIST]: {
//         "by-deletedAt": Date;
//     };
//     [OBJECT_STORES.HISTORY]: {
//         "by-sessionId": string;
//     };
// }

// export interface MyIDB extends DBSchema {
//     memoList: {
//         key: string;
//         value: StoreValueMap[typeof OBJECT_STORES.MEMO_LIST];
//         indexes: StoreIndexMap[typeof OBJECT_STORES.MEMO_LIST];
//     };
//     trashedMemoList: {
//         key: string;
//         value: StoreValueMap[typeof OBJECT_STORES.TRASHED_MEMO_LIST];
//         indexes: StoreIndexMap[typeof OBJECT_STORES.TRASHED_MEMO_LIST];
//     };
//     activitySessions: {
//         key: number;
//         value: StoreValueMap[typeof OBJECT_STORES.ACTIVITY_SESSIONS];
//         indexes: never;
//     };
//     history: {
//         key: number;
//         value: StoreValueMap[typeof OBJECT_STORES.HISTORY];
//         indexes: StoreIndexMap[typeof OBJECT_STORES.HISTORY];
//     };
// }
