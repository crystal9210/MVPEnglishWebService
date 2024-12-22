import { IDB_OBJECT_STORE_CONFIGS, IdbObjectStoreName } from "./objectStores";
import { z } from "zod";

// オブジェクトストア設定取得関数
export function getObjectStoreConfig<T extends IdbObjectStoreName>(
    storeName: T
): Extract<typeof IDB_OBJECT_STORE_CONFIGS[number], { name: T }> | undefined {
    return IDB_OBJECT_STORE_CONFIGS.find(
        (config): config is Extract<typeof IDB_OBJECT_STORE_CONFIGS[number], { name: T }> =>
            config.name === storeName
    );
}

// 型安全なデータアクセス関数

type ExtractKeyPathType<KeyPath> = KeyPath extends string
    ? string
    : KeyPath extends (infer P)[]
    ? P
    : never;

export async function getDataByKey<
    T extends IdbObjectStoreName,
    Config extends Extract<typeof IDB_OBJECT_STORE_CONFIGS[number], { name: T }>
>(
    storeName: T,
    key: ExtractKeyPathType<Config["options"]["keyPath"]> // 動的にキー型を取得
): Promise<z.infer<Config["schema"]> | undefined> {
    const config = getObjectStoreConfig(storeName);
    if (!config) {
        throw new Error(`No configuration found for store: ${storeName}`);
    }

    const db = await openDatabase(); // IndexedDBを開く仮想的な関数
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.get(key); // IndexedDBのリクエスト
    const result = await new Promise<unknown>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    // スキーマを使用して型安全にパース
    return config.schema.parse(result) as z.infer<Config["schema"]>;
}



// // 実際のデータアクセス例
// async function exampleUsage() {
//     const memo = await getDataByKey("memoList", "1");
//     if (memo) {
//         console.log(memo.id); // 推論: string
//         console.log(memo.content); // 推論: string
//     }
// }

// // 仮想的なIndexedDBオープン関数（簡易的なダミー）
async function openDatabase(): Promise<IDBDatabase> {
    // 本来はここでIndexedDBを開く処理を記述
    throw new Error("IndexedDB open is not implemented in this example.");
}
