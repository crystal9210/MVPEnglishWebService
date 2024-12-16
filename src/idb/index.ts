// 設計
// アプリケーション全体で一つのIndexedDBManagerインスタンスを共有・indexedDBへのアクセスを統一的に管理
import { openDB, IDBPDatabase } from "idb";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";
import { OBJECT_STORE_CONFIGS } from "@/constants/clientSide/idb/objectStores";

export class IndexedDBManager {
    private static instance: IndexedDBManager;
    private dbPromise: Promise<IDBPDatabase<MyIDB>>; // 非同期にindexedDBを開きデータベース接続管理

    private constructor() {
        this.dbPromise = openDB<MyIDB>("my-app-idb", 1, {
            upgrade(db) {
                OBJECT_STORE_CONFIGS.forEach(storeConfig => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(storeConfig.name, storeConfig.options);
                        storeConfig.indexes?.forEach(index => {
                            store.createIndex(index.name, index.keyPath, index.options);
                        })
                    }
                })
            }
        })
    }

    public static getInstance(): IndexedDBManager {
        if (!IndexedDBManager.instance) {
            IndexedDBManager.instance = new IndexedDBManager();
        }
        return IndexedDBManager.instance;
    }

    public getDB(): Promise<IDBPDatabase<MyIDB>> {
        return this.dbPromise;
    }
}

export default IndexedDBManager;
