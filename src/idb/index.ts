// 設計
// アプリケーション全体で一つのIndexedDBManagerインスタンスを共有・indexedDBへのアクセスを統一的に管理
// 責任分離モデル
// indexedDBManager: 低レベルのデータアクセス、MemoRepository:indexedDBManagerを利用しドメイン固有のデータ操作、MemoService: リポジトリを利用しビジネスロジック実装
// 抽象化強化: リポジトリを介してデータアクセスをすることで将来的なデータストア変更時、リポジトリの実装変更だけで済む
// TODO オブジェクト名に応じてオブジェクトストアに格納するデータバリューの型情報が正確に取得してアクセスできる
// TODO オブジェクト名に応じてキー(プライマリキー;主キー)が正確に取得でき、それによりアクセスパスを取得し、かつidとなる情報からデータの整合性等を保証できる
// >> 上記の要件を満たすことで正確にデータアクセス(CRUD)が可能

import { openDB, IDBPDatabase, IDBPTransaction, StoreValue } from "idb";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";
import { IDB_OBJECT_STORE_CONFIGS, IdbObjectStoreConfigs, IdbObjectStoreName, IndexConfig } from "@/constants/clientSide/idb/objectStores";
import { DB_NAME, DB_VERSION } from "@/constants/clientSide/idb/dbConfig";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { z } from "zod";

// 各オブジェクトストアのデータを型安全に保持
type StoreSchema<K extends keyof MyIDB> = MyIDB[K]["value"];

// BackupData 型を MyIDB から動的に構築
type BackupData = {
    [K in keyof MyIDB]?: StoreSchema<K>[];
};

type StoreIndexes<K extends keyof MyIDB> = keyof MyIDB[K]["indexes"];


export class IndexedDBManager implements IIndexedDBManager {
    private static instance: IndexedDBManager;
    private dbPromise: Promise<IDBPDatabase<MyIDB>>; // 非同期にindexedDBを開きデータベース接続管理

    private constructor() {
        this.dbPromise = this.initializeDB();
    }

    public static getInstance(): IndexedDBManager {
        if (!IndexedDBManager.instance) {
            IndexedDBManager.instance = new IndexedDBManager();
        }
        return IndexedDBManager.instance;
    }

    private async initializeDB(): Promise<IDBPDatabase<MyIDB>> {
        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                console.log(`Attempting to open IndexedDB (Attempt ${attempts + 1})`);
                return await openDB<MyIDB>(DB_NAME, DB_VERSION, {
                    upgrade(idb, oldVersion, newVersion, transaction) {
                        console.log("Upgrading Database...");
                        IDB_OBJECT_STORE_CONFIGS.forEach((storeConfig) => {
                            if (!idb.objectStoreNames.contains(storeConfig.name)) {
                                const store = idb.createObjectStore(storeConfig.name, storeConfig.options);
                                // storeConfig.indexes?.forEach((index: IndexConfig<MyIDB[K][]>) => {
                                //     store.createIndex(index.name, index.keyPath, index.options);
                                // });
                                storeConfig.indexes?.forEach((index) => {
                                    // ジェネリクスにストアの値の型を渡すための型アサーション (仮)
                                    // ここでは storeConfig.schema を基にした型推論が必要
                                    // しかし、TypeScript の制約上、直接的な型推論が難しいため、
                                    // ストアの値の型を明示的に指定する必要がある
                                    // ストアの値の型を取得
                                    type StoreValue = z.infer<typeof storeConfig.schema>;
                                    // 型アサーションを使用
                                    const typedIndex = index as IndexConfig<StoreValue>;
                                    store.createIndex(typedIndex.name, typedIndex.keyPath, typedIndex.options);
                                });
                            }
                        });
                    },
                });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error(`Failed to open IndexedDB: ${error}`);
                    attempts++;

                    // 通信エラーの場合は再試行
                    if (this.isTemporaryError(error)) {
                        console.warn("Detected temporary error. Retrying...");
                        await this.sleep(2000);
                        continue;
                    }

                    if (attempts < maxRetries) {
                        console.warn("Attempting to backup data and delete corrupted database...");
                        await this.backupAndRecover();
                    } else {
                        console.error("Max retries exceeded. Unable to open IndexedDB.");
                        throw new Error("Database initialization failed after multiple attempts.");
                    }
                }
            }
            throw new Error("Unexpected error during database initialization.");
        }
        throw new Error("Unexpected error during database initialization.");
    }

    // データベースのバックアップとリカバリ処理
    private async backupAndRecover(): Promise<void> {
        const backupData: BackupData = {};

        try {
            const idb = await openDB<MyIDB>(DB_NAME, DB_VERSION);

            // 各オブジェクトストアのデータバックアップ
            for (const storeConfig of IDB_OBJECT_STORE_CONFIGS) {
                const storeName = storeConfig.name as keyof MyIDB;
                const storeData = await idb.getAll<StoreSchema<typeof storeName>>(storeName);
                backupData[storeName] = storeData;
            }

            console.log("Backup successful. Deleting corrupted database...");
            await this.deleteDatabase();

            console.log("Restoring data from backup...");
            for (const storeName of Object.keys(backupData) as IdbObjectStoreName[]) {
                const data = backupData[storeName] || [];
                for (const item of data) {
                    await this.put(storeName, item);
                }
            }

            console.log("Data restoration completed successfully.");
        } catch (backupError) {
            console.error("Failed to backup or recover data:", backupError);
            throw backupError;
        }
    }

    // 通信エラー(ブラウザ固有エラー・ネットワークエラー)判定
    private isTemporaryError(error: Error): boolean {
        return error.name === "NetworkError" || error.message.includes("Failed to fetch");
    }

    private async deleteDatabase(): Promise<void> {
        console.warn(`Deleting IndexedDB database: ${DB_NAME}`);
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

            deleteRequest.onsuccess = () => {
                console.log(`Successfully deleted database: ${DB_NAME}`);
                resolve();
            };

            deleteRequest.onerror = (event) => {
                console.error("Failed to delete database", event);
                reject(event);
            };

            deleteRequest.onblocked = () => {
                console.warn("Database deletion is blocked. Please close all database connections.");
            };
        });
    }


    public async get<K extends IdbObjectStoreName>(storeName: K, key: MyIDB[K]["key"]): Promise<MyIDB[K]["value"] | undefined> {
        const idb = await this.getDB();
        return idb.get(storeName, key);
    }

    public async add<K extends IdbObjectStoreName>(storeName: K, value: MyIDB[K]["value"], key?: MyIDB[K]["key"]): Promise<MyIDB[K]["key"]> {
        const resolvedKey = await this.resolveKey(storeName, value, key);
        await this.checkNotExists(storeName, resolvedKey);

        const idb = await this.getDB();
        return idb.add(storeName, value, resolvedKey);
    }

    public async put<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<void> {
        const resolvedKey = await this.resolveKey(storeName, value, key);
        await this.checkExists(storeName, resolvedKey);

        const idb = await this.getDB();
        await idb.put(storeName, value, resolvedKey);
    }

    public async getAll<K extends IdbObjectStoreName>(
        storeName: K
    ): Promise<MyIDB[K]["value"][]> {
        const idb = await this.getDB();
        return idb.getAll(storeName);
    }

    public async delete<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void> {
        await this.checkExists(storeName, key);

        const idb = await this.getDB();
        await idb.delete(storeName, key);
    }

    public async clear<K extends IdbObjectStoreName>(
        storeName: K
    ): Promise<void> {
        const idb = await this.getDB();
        await idb.clear(storeName);
    }

    public async getAllFromIndex<K extends IdbObjectStoreName, I extends StoreIndexes<K>>(
        storeName: K,
        indexName: I,
        query: IDBKeyRange | IDBValidKey | null | undefined
    ): Promise<MyIDB[K]["value"][]> {
        const idb = await this.getDB();
        const typedIndexName = indexName as keyof MyIDB[K][""]
        return idb.getAllFromIndex(storeName, indexName as string, query);
    }

    public async getMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]['key'][]
    ): Promise<(MyIDB[K]["value"] | undefined)[]> {
        return this.performTransaction([storeName], "readonly", async (tx) => {
            const store = tx.objectStore(storeName);
            const results = await Promise.all(keys.map((key) => store.get(key))); // forで回すと逐次処理となりパフォが落ちる可能性ありー＞並行処理
            return results;
        })
    }

    public async updateMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        values: MyIDB[K]["value"][]
    ): Promise<void> {
        return this.performTransaction([storeName], "readwrite", async () => {
            await Promise.all(values.map((value) => this.put(storeName, value)));
        });
    }

    public async deleteMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<void> {
        return this.performTransaction([storeName], "readwrite", async (tx) => {
            const store = tx.objectStore(storeName);
            const existingItems = await this.getMultiple(storeName, keys);
            existingItems.forEach((item, index) => {
                if (!item) {
                    throw new Error(`Item with key ${keys[index]} does not exist in ${storeName}`);
                }
            });
            // browser環境によってはdeleteがない可能性があるため(現在はあまりないが仕様としてこのチェックを入れる必要がある)
            if (!store.delete) {
                throw new Error("The delete method is not available on this object store.");
            }
            for (const key of keys) {
                await store.delete(key);
            }
        })
    }

    public async performTransaction<T, K extends IdbObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (tx: IDBPTransaction<MyIDB, K[], "versionchange" | "readonly" | "readwrite">) => Promise<T>
    ): Promise<T> {
        return this.executeWithRetry(async () => {
        const idb = await this.getDB();
        const tx = idb.transaction(storeNames, mode);
        try {
            const result = await callback(tx);
            await tx.done; // トランザクション完了待機
            return result;
        } catch (error) {
            console.error("Transaction failed:", error);
            tx.abort(); // トランザクションが失敗したら、トランザクション処理前の状態に戻す
            throw error;
        }
        });
    }

    private async resolveKey<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["key"]> {
        if (key !== undefined) return key;

        const idb = await this.getDB();
        const store = idb.transaction(storeName, "readonly").objectStore(storeName);
        const keyPath = store.keyPath;

        if (typeof keyPath === "string") {
            const resolvedKey = value[keyPath as keyof MyIDB[K]["value"]];
            if (resolvedKey === undefined) {
                throw new Error(`Key '${keyPath}' is missing in the value for store '${storeName}'.`);
            }
            return resolvedKey as MyIDB[K]["key"];
        } else {
            throw new Error(`Key path for store '${storeName}' is not a string. Cannot resolve key.`);
        }
    }

    private async checkExists<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"] | MyIDB[K]["key"][]
    ): Promise<void> {
        if (Array.isArray(key)) {
            const results = await this.getMultiple(storeName, key);
            results.forEach((item, index) => {
                const currentKey = (key as MyIDB[K]["key"][])[index];
                if (!item) {
                    throw new Error(`Item with key '${currentKey}' does not exist in '${storeName}'.`);
                }
            });
        } else {
            const idb = await this.getDB();
            const existingItem = await idb.get(storeName, key);
            if (!existingItem) {
                throw new Error(`Item with key '${key}' does not exist in '${storeName}'.`);
            }
        }
    }

    private async checkNotExists<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void> {
        const idb = await this.getDB();
        const existingItem = await idb.get(storeName, key);
        if (existingItem) {
            throw new Error(`Item with key '${key}' already exists in '${storeName}'.`);
        }
}


    // トランザクションの安定性・信頼性の向上のために導入
    private async executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt < retries - 1) {
                    const backoff = delay * Math.pow(2, attempt); // 指数バックオフ
                    console.warn(`Operation failed, retrying in ${backoff}ms... (Attempt ${attempt + 1}/${retries})`);
                    await this.sleep(backoff);
                } else {
                    console.error("Max retries exceeded");
                    throw error;
                }
            }
        }
        throw new Error("Max retries exceeded");
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // TODO サービス層に移行
    // private validateValue<K extends IdbObjectStoreName>(
    //     storeName: K,
    //     value: MyIDB[K]["value"]
    // ): boolean {
    //     switch (storeName) {
    //         case "memoList":
    //             return (
    //                 (typeof (value as Memo).id === "string" || typeof (value as Memo).id === "number") &&
    //                 typeof (value as Memo).content === "string"
    //             );
    //         case "trashedMemoList":
    //             return (
    //                 (typeof (value as Memo).id === "string" || typeof (value as Memo).id === "number") &&
    //                 typeof (value as Memo).content === "string" &&
    //                 (value as Memo).deletedAt instanceof Date
    //             );
    //         case "activitySessions":
    //             return (
    //                 typeof (value as ClientActivitySession).sessionId === "string" &&
    //                 (value as ClientActivitySession).startedAt instanceof Date &&
    //                 (value as ClientActivitySession).endedAt instanceof Date
    //             );
    //         case "history":
    //             return (
    //                 typeof (value as { sessionId: string; historyItem: IActivitySessionHistoryItem }).sessionId === "string" &&
    //                 typeof (value as { sessionId: string; historyItem: IActivitySessionHistoryItem }).historyItem === "object"
    //             );
    //         default:
    //             return false;
    //     }
    // }

    public getDB(): Promise<IDBPDatabase<MyIDB>> {
        return this.dbPromise;
    }
}

export default IndexedDBManager;
