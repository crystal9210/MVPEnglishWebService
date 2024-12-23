import { z } from "zod";
// import { DBSchema } from "idb";
import { IDB_OBJECT_STORE_CONFIGS, IdbObjectStoreName, IndexConfig } from "./objectStores";



type StoreSchema<K extends keyof MyIDB> = MyIDB[K]["value"];

export type BackUpData = {
    [K in keyof MyIDB]?: StoreSchema<K>[];
};



type GetKeyType<
    Configs extends readonly { name: IdbObjectStoreName; options: { keyPath: string | string[] } }[],
    Name extends IdbObjectStoreName
> = Extract<Configs[number], { name: Name }>["options"]["keyPath"];


type GenerateStoreValueMap<T extends readonly { name: string; schema: z.ZodTypeAny }[]> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>["schema"] extends z.ZodTypeAny
        ? z.infer<Extract<T[number], { name: K }>["schema"]>
        : never;
};

// 各オブジェクトストアの型定義を動的生成
type StoreValueMap = GenerateStoreValueMap<typeof IDB_OBJECT_STORE_CONFIGS>;

type IndexesToObject<Value, Indexes extends readonly IndexConfig<Value>[]> = {
    [I in Indexes[number]["name"]]: {
        keyPath: Extract<Indexes[number], { name: I }>["keyPath"];
        options?: Extract<Indexes[number], { name: I }>["options"];
    };
};


// 動的型定義の最終構造
export type DynamicObjectStoreTypes<
    Configs extends readonly {
        name: IdbObjectStoreName;
        schema: z.ZodTypeAny;
        options: { keyPath: string | string[] };
        firestorePath: string;
        indexes: IndexConfig<z.infer<Configs[number]["schema"]>>[];
    }[]
> = {
    [K in Configs[number]["name"]]: {
        key: GetKeyType<Configs, K>;
        value: StoreValueMap[K];
        // idbの仕様からkeyPathのみの構成とする >> idbの公式の方インターフェースファイルモジュール情報参照
        indexes: IndexesToObject<StoreValueMap[K] ,Extract<Configs[number], { name: K }>["indexes"]>;
    }
};

export type MyIDB = DynamicObjectStoreTypes<typeof IDB_OBJECT_STORE_CONFIGS>;

type MemoIndexes = MyIDB["memoList"]["indexes"];
type ActivityIndexes = MyIDB["activitySessions"]["indexes"];


type MemoKey = MyIDB["memoList"]["key"]; // 推論: "id"
type MemoValue = MyIDB["memoList"]["value"]; // 推論: z.infer<typeof MemoSchema>


// // テスト: GetKeyTypeで正しい型が推論されるか確認
// type MemoKeyType = GetKeyType<typeof IDB_OBJECT_STORE_CONFIGS, "memoList">; // 推論: "id"
// type HistoryKeyType = GetKeyType<typeof IDB_OBJECT_STORE_CONFIGS, "history">; // 推論: "id"
// type ActivitySessionsKeyType = GetKeyType<typeof IDB_OBJECT_STORE_CONFIGS, "activitySessions">; // 推論: "sessionId"


// type MemoListValueType = StoreValueMap["memoList"]; // 推論される型が z.infer<typeof MemoSchema>
// type TrashedMemoListValueType = StoreValueMap["trashedMemoList"]; // 同上
// type ActivitySessionsValueType = StoreValueMap["activitySessions"]; // z.infer<typeof ClientActivitySessionSchema>
// type HistoryValueType = StoreValueMap["history"]; // 推論される型が z.object で記述した型

