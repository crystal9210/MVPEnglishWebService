import { DBSchema } from "idb";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";
import { OBJECT_STORE_CONFIGS, ObjectStoreConfig, ObjectStoreName, IndexConfig } from "@/constants/clientSide/idb/objectStores";

// TODO アクティビティマネージャでもidbを利用する形式になっている、というか基本的にコンテキスト系の実装ロジックが関わる機能に関してはデータの永続性のためにidbを利用するが互いに衝突をする可能性がないか
// TODO indexesに関してこれはメモの検索機能に関連するフィールドだが"by-tags"におけるテキストリストからのabc順におけるソート処理などは想定しなくていいのか ＋ ソートをするためにタグのリストをユーザごとに用意してソートか何かで保持するようにするのはコスパ的にどうか検証・仕様設計

// --- NOTE: TSの型システム:配列の順序は型の構造に影響せず、型レベルでの操作:構造的な一致に基づいて行われるため、配列内の要素の順序は無関係

type GenerateStoreValueMap<T extends readonly ObjectStoreConfig[]> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>["options"]["keyPath"] extends infer KeyPath
        ? KeyPath extends "id"
        ? Extract<T[number], { name: K }>["options"] extends { autoIncrement: true }
            ? {
                id?: number;
                sessionId: string;
                historyItem: IActivitySessionHistoryItem;
            }
            : Memo
        : KeyPath extends "sessionId"
        ? ClientActivitySession
        : never
    : never;
};

// 各オブジェクトストアのインデックス名とkeyPathをマッピングする型を動的生成
type GenerateStoreIndexMap<T extends readonly ObjectStoreConfig[]> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>["indexes"] extends infer Indexes
        ? Indexes extends IndexConfig[]
        ? {
            [I in Indexes[number]["name"]]: Extract<Indexes[number], { name: I }>["keyPath"];
        }
        : Record<string, never>
    : Record<string, never>;
};

type StoreValueMap = GenerateStoreValueMap<typeof OBJECT_STORE_CONFIGS>;
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
type StoreIndexMap = GenerateStoreIndexMap<typeof OBJECT_STORE_CONFIGS>;
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


type GetKeyType<T extends readonly ObjectStoreConfig[], K extends ObjectStoreName> =
    Extract<T[number], { name: K }>["options"] extends infer Options
    ? Options extends { autoIncrement: true }
        ? number
        : Options extends { keyPath: infer KeyPath }
        ? KeyPath extends string // TODO idなどの型を調整した際、調整
            ? KeyPath extends "id"
                ? string | number
                : string
            : never
        : never
    : never;

type DynamicObjectStoreTypes<T extends readonly ObjectStoreConfig[]> = {
    [K in T[number]["name"]]: {
        key: GetKeyType<T, K>;
        value: StoreValueMap[K];
        indexes: StoreIndexMap[K];
    };
};

export type MyIDB = DBSchema & DynamicObjectStoreTypes<typeof OBJECT_STORE_CONFIGS>;

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
