import { IDB_OBJECT_STORE_CONFIGS, ObjectStoreConfig, IdbObjectStoreName } from "./objectStores";

// オブジェクトストア設定取得関数
export function getObjectStoreConfig<T extends IdbObjectStoreName>(
    storeName: T
): Extract<ObjectStoreConfig<T, any, any, any>, { name: T }> | undefined {
    return IDB_OBJECT_STORE_CONFIGS.find(config => config.name === storeName) as
        | Extract<ObjectStoreConfig<T, any, any, any>, { name: T }>
        | undefined;
}

// --- 利用例 ---
// MEMO_LISTの設定を取得する
const memoListConfig = getObjectStoreConfig("memoList");
if (memoListConfig) {
    console.log(memoListConfig.schema); // MemoSchema
    console.log(memoListConfig.options.keyPath); // "id"
}
