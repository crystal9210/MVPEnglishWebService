// 設計
// アプリケーション全体で一つのIndexedDBManagerインスタンスを共有・indexedDBへのアクセスを統一的に管理
import { openDB, IDBPDatabase, type IDBPTransaction } from "idb";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";
import { OBJECT_STORE_CONFIGS, ObjectStoreName } from "@/constants/clientSide/idb/objectStores";
import { DB_NAME, DB_VERSION } from "@/constants/clientSide/idb/dbConfig";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "@/schemas/activity/serverSide/activitySessionHistoryItemSchema";


export class IndexedDBManager {
    private static instance: IndexedDBManager;
    private dbPromise: Promise<IDBPDatabase<MyIDB>>; // 非同期にindexedDBを開きデータベース接続管理

    private constructor() {
        this.dbPromise = openDB<MyIDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                OBJECT_STORE_CONFIGS.forEach(storeConfig => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(storeConfig.name, storeConfig.options);
                        storeConfig.indexes?.forEach(index => {
                            store.createIndex(index.name, index.keyPath, index.options);
                        })
                    } else {
                        const store = transaction.objectStore(storeConfig.name);
                        storeConfig.indexes?.forEach(indexes => {
                            if (!store.indexNames.contains(indexes.name)) {
                                store.createIndex(indexes.name, indexes.keyPath, indexes.options);
                            }
                        })
                    }
                });
            }
        }).catch(error => {
            console.error("Failed to open IndexedDB:", error);
            throw error; // TODO リカバリ処理実装
        })
    }

    public static getInstance(): IndexedDBManager {
        if (!IndexedDBManager.instance) {
            IndexedDBManager.instance = new IndexedDBManager();
        }
        return IndexedDBManager.instance;
    }

    public async add<K extends ObjectStoreName>(storeName: K, value: MyIDB[K]["value"], key?: MyIDB[K]["key"]): Promise<MyIDB[K]["key"]> {
        const db = await this.getDB();
        return db.add(storeName, value, key);
    }

    public async put<K extends ObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<void> {
        const db = await this.getDB();
        await db.put(storeName, value, key);
    }

    public async getAll<K extends ObjectStoreName>(
        storeName: K
    ): Promise<MyIDB[K]["value"][]> {
        const db = await this.getDB();
        return db.getAll(storeName);
    }

    public async delete<K extends ObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void> {
        const db = await this.getDB();
        await db.delete(storeName, key);
    }

    public async clear<K extends ObjectStoreName>(
        storeName: K
    ): Promise<void> {
        const db = await this.getDB();
        await db.clear(storeName);
    }

    public async getAllFromIndex<K extends ObjectStoreName, I extends keyof MyIDB[K]["indexes"]>(
        storeName: K,
        indexName: I,
        query: IDBKeyRange | (string extends keyof MyIDB[K]["indexes"] ? MyIDB[K]["indexes"][keyof MyIDB[K]["indexes"] & string] : IDBValidKey) | null | undefined
    ): Promise<MyIDB[K]["value"][]> {
        const db = await this.getDB();
        return db.getAllFromIndex(storeName, indexName as string, query);
    }

    public async performTransaction<T, K extends ObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (tx: IDBPTransaction<MyIDB, K[], "versionchange" | "readonly" | "readwrite">) => Promise<T>
    ): Promise<T> {
        return this.executeWithRetry(() => this._performTransaction(storeNames, mode, callback));
    }

    private async _performTransaction<T, K extends ObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (tx: IDBPTransaction<MyIDB, K[], "versionchange" | "readonly" | "readwrite">) => Promise<T>
    ): Promise<T> {
        const db = await this.getDB();
        const tx = db.transaction(storeNames, mode);
        try {
            const result = await callback(tx);
            await new Promise<void>((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
                tx.onabort = () => reject(tx.error);
            });
            return result;
        } catch (error) {
            console.error("Transaction failed:", error);
            tx.abort();
            throw error;
        }
    }

    private async executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt < retries - 1) {
                    console.warn(`Operation failed, retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                    await this.sleep(delay);
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

    private validateValue<K extends ObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"]
    ): boolean {
        switch (storeName) {
            case "memoList":
                return (
                    (typeof (value as Memo).id === "string" || typeof (value as Memo).id === "number") &&
                    typeof (value as Memo).content === "string"
                );
            case "trashedMemoList":
                return (
                    (typeof (value as Memo).id === "string" || typeof (value as Memo).id === "number") &&
                    typeof (value as Memo).content === "string" &&
                    (value as Memo).deletedAt instanceof Date
                );
            case "activitySessions":
                return (
                    typeof (value as ClientActivitySession).sessionId === "string" &&
                    (value as ClientActivitySession).startedAt instanceof Date &&
                    (value as ClientActivitySession).endedAt instanceof Date
                );
            case "history":
                return (
                    typeof (value as { sessionId: string; historyItem: IActivitySessionHistoryItem }).sessionId === "string" &&
                    typeof (value as { sessionId: string; historyItem: IActivitySessionHistoryItem }).historyItem === "object"
                );
            default:
                return false;
        }
    }

    public getDB(): Promise<IDBPDatabase<MyIDB>> {
        return this.dbPromise;
    }
}

export default IndexedDBManager;
