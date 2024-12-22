import { IDB_OBJECT_STORE_CONFIGS } from "./objectStores";

// FirestorePathMap生成
type GenerateFirestorePathType<
    Configs extends readonly { name: string | number | symbol; firestorePath: string }[]
> = {
    [K in Configs[number]["name"]]: Extract<Configs[number], { name: K }>["firestorePath"];
};

export type FirestorePathMap = GenerateFirestorePathType<typeof IDB_OBJECT_STORE_CONFIGS>;

export type GetFirestorePath<Name extends keyof FirestorePathMap> = FirestorePathMap[Name];

export const FIRESTORE_PATHS = Object.fromEntries(
    IDB_OBJECT_STORE_CONFIGS.map(config => [config.name, config.firestorePath])
) as {
    [K in keyof FirestorePathMap]: FirestorePathMap[K];
};

// firestorePathを取得する関数
export function getFirestorePath<T extends keyof FirestorePathMap>(storeName: T): FirestorePathMap[T] {
    return FIRESTORE_PATHS[storeName];
}


// type MemoFirestorePath = GetFirestorePath<"memoList">; // 推論: "memos"
// type HistoryFirestorePath = GetFirestorePath<"history">; // 推論: "history_items"
// const memoFirestorePath = getFirestorePath("memoList"); // 実行結果: "memos"
// const historyFirestorePath = getFirestorePath("history"); // 実行結果: "history_items"
