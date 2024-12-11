import { openDB, IDBPDatabase } from "idb";
import { MyIDB } from "@/schemas/idb";

export class DBManager {
    private static instance: DBManager;
    private dbPromise: Promise<IDBPDatabase<MyIDB>>;

    private constructor() {
        this.dbPromise = openDB<MyIDB>("my-app-idb", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("memoList")) {
                    const memoStore = db.createObjectStore(
                        "memoList",
                        { keyPath: "id" }
                    );
                    memoStore.createIndex("by-createdAt", "createdAt");
                    memoStore.createIndex(
                        "by-tags",
                        "tags",
                        { multiEntry: true }
                    );
                }
                if (!db.objectStoreNames.contains("trashedMemoList")) {
                    const trashedMemoStore = db.createObjectStore(
                        "trashedMemoList",
                        { keyPath: "id" }
                    );
                    trashedMemoStore.createIndex("by-deletedAt", "deletedAt");
                }
                if (!db.objectStoreNames.contains("activitySessions")) {
                    db.createObjectStore(
                        "activitySessions",
                        { keyPath: "sessionId" }
                    );
                }
                if (!db.objectStoreNames.contains("history")) {
                    const historyStore = db.createObjectStore(
                        "history",
                        { keyPath: "id", autoIncrement: true });
                    historyStore.createIndex("by-sessionId", "sessionId");
                }
            }
        })
    }
}
