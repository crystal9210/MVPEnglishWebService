// 設計
// アプリケーション全体で一つのIndexedDBManagerインスタンスを共有・indexedDBへのアクセスを統一的に管理
// 責任分離モデル
// indexedDBManager: 低レベルのデータアクセス、MemoRepository:indexedDBManagerを利用しドメイン固有のデータ操作、MemoService: リポジトリを利用しビジネスロジック実装
// 抽象化強化: リポジトリを介してデータアクセスをすることで将来的なデータストア変更時、リポジトリの実装変更だけで済む
// TODO オブジェクト名に応じてオブジェクトストアに格納するデータバリューの型情報が正確に取得してアクセスできる
// TODO オブジェクト名に応じてキー(プライマリキー;主キー)が正確に取得でき、それによりアクセスパスを取得し、かつidとなる情報からデータの整合性等を保証できる
// >> 上記の要件を満たすことで正確にデータアクセス(CRUD)が可能

// /src/idb/index.ts

// /src/idb/index.ts

"use client";

import { openDB, IDBPDatabase, IDBPTransaction, IDBPObjectStore } from "idb";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";
import {
    IDB_OBJECT_STORE_CONFIGS,
    IdbObjectStoreName,
    IndexConfig,
} from "@/constants/clientSide/idb/objectStores";
import { DB_NAME, DB_VERSION } from "@/constants/clientSide/idb/dbConfig";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";

/**
 * A function to create indexes on an object store.
 * @param store The IDBPObjectStore instance.
 * @param indexes An array of IndexConfig to create indexes.
 */
function createIndexes<K extends IdbObjectStoreName>(
    store: IDBPObjectStore<MyIDB, readonly [K], K, "versionchange">,
    indexes: IndexConfig<MyIDB[K]["value"]>[]
) {
    indexes.forEach((index) => {
        const keyPath = index.keyPath as string | string[];
        store.createIndex(index.name, keyPath, index.options);
    });
}

/**
 * IndexedDBManager manages access to IndexedDB and ensures a single instance is used throughout the application.
 */
export class IndexedDBManager implements IIndexedDBManager {
    private static instance: IndexedDBManager;
    private dbPromise: Promise<IDBPDatabase<MyIDB>>; // Manages the IndexedDB connection asynchronously

    constructor() {
        this.dbPromise = this.initializeDB();
    }

    /**
     * Retrieves the singleton instance of IndexedDBManager.
     * @returns The singleton instance.
     */
    public static getInstance(): IndexedDBManager {
        if (!IndexedDBManager.instance) {
            IndexedDBManager.instance = new IndexedDBManager();
        }
        return IndexedDBManager.instance;
    }

    /**
     * Initializes the IndexedDB database with retry logic and error handling.
     * @returns A promise that resolves to the opened IDBPDatabase instance.
     */
    private async initializeDB(): Promise<IDBPDatabase<MyIDB>> {
        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                console.log(
                    `Attempting to open IndexedDB (Attempt ${attempts + 1})`
                );
                return await openDB<MyIDB>(DB_NAME, DB_VERSION, {
                    upgrade(idb, oldVersion, newVersion, transaction) {
                        console.log("Upgrading Database...");
                        IDB_OBJECT_STORE_CONFIGS.forEach((storeConfig) => {
                            if (
                                !idb.objectStoreNames.contains(storeConfig.name)
                            ) {
                                const store = idb.createObjectStore(
                                    storeConfig.name,
                                    storeConfig.options
                                );
                                createIndexes(
                                    store as IDBPObjectStore<
                                        MyIDB,
                                        readonly [typeof storeConfig.name],
                                        typeof storeConfig.name,
                                        "versionchange"
                                    >,
                                    storeConfig.indexes // Pass the array of IndexConfig
                                );
                            }
                        });
                    },
                });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error(`Failed to open IndexedDB: ${error.message}`);
                    attempts++;

                    // Retry if the error is temporary
                    if (this.isTemporaryError(error)) {
                        console.warn("Detected temporary error. Retrying...");
                        await this.sleep(2000);
                        continue;
                    }

                    if (attempts < maxRetries) {
                        console.warn(
                            "Attempting to backup data and delete corrupted database..."
                        );
                        await this.backupAndRecover();
                    } else {
                        console.error(
                            "Max retries exceeded. Unable to open IndexedDB."
                        );
                        throw new Error(
                            "Database initialization failed after multiple attempts."
                        );
                    }
                }
                throw new Error(
                    "Unexpected error during database initialization."
                );
            }
        }
        throw new Error("Unexpected error during database initialization.");
    }

    /**
     * Backs up data, deletes the corrupted database, and restores data from the backup.
     */
    private async backupAndRecover(): Promise<void> {
        const backupData: {
            [K in keyof MyIDB]?: MyIDB[K]["value"][];
        } = {};

        try {
            const idb = await openDB<MyIDB>(DB_NAME, DB_VERSION);

            // Backup process
            for (const storeConfig of IDB_OBJECT_STORE_CONFIGS) {
                const storeName = storeConfig.name as IdbObjectStoreName;
                const storeData = await idb.getAll(storeName);
                backupData[storeName] = storeData;
            }

            console.log("Backup successful. Deleting corrupted database...");
            await this.deleteDatabase();

            console.log("Restoring data from backup...");
            const restoredDB = await openDB<MyIDB>(DB_NAME, DB_VERSION, {
                upgrade(idb) {
                    // Recreate object stores and indexes
                    IDB_OBJECT_STORE_CONFIGS.forEach((storeConfig) => {
                        if (!idb.objectStoreNames.contains(storeConfig.name)) {
                            const store = idb.createObjectStore(
                                storeConfig.name,
                                storeConfig.options
                            );
                            createIndexes(
                                store as IDBPObjectStore<
                                    MyIDB,
                                    readonly [typeof storeConfig.name],
                                    typeof storeConfig.name,
                                    "versionchange"
                                >,
                                storeConfig.indexes
                            );
                        }
                    });
                },
            });

            // Restore data
            for (const storeName of Object.keys(backupData) as Array<
                keyof MyIDB
            >) {
                const data = backupData[storeName];
                if (data) {
                    const tx = restoredDB.transaction(storeName, "readwrite");
                    const store = tx.objectStore(storeName);
                    for (const item of data) {
                        await store.put(item);
                    }
                    await tx.done;
                }
            }

            console.log("Data restoration completed successfully.");
        } catch (backupError) {
            console.error("Failed to backup or recover data:", backupError);
            throw backupError;
        }
    }

    /**
     * Determines if an error is temporary and warrants a retry.
     * @param error The error to check.
     * @returns True if the error is temporary, false otherwise.
     */
    private isTemporaryError(error: Error): boolean {
        return (
            error.name === "NetworkError" ||
            error.message.includes("Failed to fetch")
        );
    }

    /**
     * Deletes the IndexedDB database.
     */
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
                console.warn(
                    "Database deletion is blocked. Please close all database connections."
                );
            };
        });
    }

    /**
     * Retrieves a value from the object store by its key.
     * @param storeName The name of the object store.
     * @param key The key of the value to retrieve.
     * @returns A promise that resolves to the value, or undefined if the key is not found.
     */
    public async get<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["value"] | undefined> {
        console.log(
            `IndexedDBManager: Getting from store '${storeName}' with key '${key}'`
        );
        try {
            const db = await this.getDB();
            const result = await db.get(storeName, key);
            console.log(`IndexedDBManager: Retrieved`, result);
            return result;
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to get from store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Adds a new value to the object store.
     * @param storeName The name of the object store.
     * @param value The value to add.
     * @param key Optional. The key to associate with the value. If not provided and keyPath is set, it will be extracted from the value.
     * @returns A promise that resolves to the key of the newly added value.
     */
    public async add<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["key"]> {
        console.log(
            `IndexedDBManager: Adding to store '${storeName}'`,
            value,
            key ? `with key '${key}'` : ""
        );
        try {
            const db = await this.getDB();
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            const keyPath = store.keyPath;

            if (keyPath !== null) {
                // Store uses keyPath, so key is part of the value
                await store.add(value); // Do not pass key
                const resolvedKey = value[
                    keyPath as keyof MyIDB[K]["value"]
                ] as MyIDB[K]["key"];
                console.log(
                    `IndexedDBManager: Added with key '${resolvedKey}'`
                );
                await tx.done;
                return resolvedKey;
            } else {
                // Store does not use keyPath, key must be provided
                if (key === undefined) {
                    throw new Error(
                        `Store '${storeName}' requires a key to be provided.`
                    );
                }
                await store.add(value, key);
                console.log(`IndexedDBManager: Added with key '${key}'`);
                await tx.done;
                return key;
            }
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to add to store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Updates an existing value in the object store, or adds a new value if the key does not exist.
     * @param storeName The name of the object store.
     * @param value The value to update or add.
     * @param key Optional. The key of the value to update. If not provided and keyPath is set, it will be extracted from the value.
     */
    public async put<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<void> {
        console.log(
            `IndexedDBManager: Putting to store '${storeName}'`,
            value,
            key ? `with key '${key}'` : ""
        );
        try {
            const db = await this.getDB();
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            const keyPath = store.keyPath;

            if (keyPath !== null) {
                // Store uses keyPath, key is part of the value
                await store.put(value); // Do not pass key
                console.log(
                    `IndexedDBManager: Put without separate key in store '${storeName}'`
                );
            } else {
                // Store does not use keyPath, key must be provided
                if (key === undefined) {
                    throw new Error(
                        `Store '${storeName}' requires a key to be provided for put.`
                    );
                }
                await store.put(value, key);
                console.log(
                    `IndexedDBManager: Put with key '${key}' in store '${storeName}'`
                );
            }

            await tx.done;
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to put to store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Retrieves all values from the object store.
     * @param storeName The name of the object store.
     * @returns A promise that resolves to an array of all values in the object store.
     */
    public async getAll<K extends IdbObjectStoreName>(
        storeName: K
    ): Promise<MyIDB[K]["value"][]> {
        console.log(`IndexedDBManager: Getting all from store '${storeName}'`);
        try {
            const db = await this.getDB();
            const results = await db.getAll(storeName);
            console.log(
                `IndexedDBManager: Retrieved all from store '${storeName}':`,
                results
            );
            return results;
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to get all from store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Deletes a value from the object store by its key.
     * @param storeName The name of the object store.
     * @param key The key of the value to delete.
     * @returns A promise that resolves when the value is deleted.
     */
    public async delete<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void> {
        console.log(
            `IndexedDBManager: Deleting from store '${storeName}' with key '${key}'`
        );
        try {
            const db = await this.getDB();
            await db.delete(storeName, key);
            console.log(
                `IndexedDBManager: Deleted key '${key}' from store '${storeName}'`
            );
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to delete key '${key}' from store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Clears all values from the object store.
     * @param storeName The name of the object store.
     * @returns A promise that resolves when the object store is cleared.
     */
    public async clear<K extends IdbObjectStoreName>(
        storeName: K
    ): Promise<void> {
        console.log(`IndexedDBManager: Clearing store '${storeName}'`);
        try {
            const db = await this.getDB();
            await db.clear(storeName);
            console.log(`IndexedDBManager: Cleared store '${storeName}'`);
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to clear store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Retrieves all values from a specific index in the object store.
     * @param storeName The name of the object store.
     * @param indexName The name of the index to query.
     * @param query Optional. The query range or key.
     * @param count Optional. The maximum number of results to return.
     * @returns A promise that resolves to an array of matching values.
     */
    public async getAllFromIndex<
        K extends IdbObjectStoreName,
        I extends Extract<keyof MyIDB[K]["indexes"], string>
    >(
        storeName: K,
        indexName: I,
        query?: IDBKeyRange | string | MyIDB[K]["key"] | null,
        count?: number
    ): Promise<MyIDB[K]["value"][]> {
        console.log(
            `IndexedDBManager: Getting all from index '${indexName}' in store '${storeName}' with query`,
            query,
            `and count`,
            count
        );
        try {
            const db = await this.getDB();
            const storeConfig = IDB_OBJECT_STORE_CONFIGS.find(
                (config) => config.name === storeName
            );

            if (!storeConfig) {
                throw new Error(
                    `Store configuration not found for store: ${storeName}`
                );
            }
            if (
                !storeConfig.indexes.some((index) => index.name === indexName)
            ) {
                throw new Error(
                    `Index ${indexName} not found in store ${storeName}`
                );
            }

            const results = await db.getAllFromIndex(
                storeName,
                indexName,
                query,
                count
            );
            console.log(
                `IndexedDBManager: Retrieved from index '${indexName}' in store '${storeName}':`,
                results
            );
            return results;
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to get all from index '${indexName}' in store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Retrieves multiple values from the object store by their keys.
     * @param storeName The name of the object store.
     * @param keys An array of keys to retrieve.
     * @returns A promise that resolves to an array of values, or undefined for keys that are not found.
     */
    public async getMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<(MyIDB[K]["value"] | undefined)[]> {
        console.log(
            `IndexedDBManager: Getting multiple from store '${storeName}' with keys [${keys.join(
                ", "
            )}]`
        );
        try {
            const db = await this.getDB();
            const promises = keys.map(
                async (key) => await db.get(storeName, key)
            );
            const values = await Promise.all(promises);
            console.log(`IndexedDBManager: Retrieved multiple`, values);
            return values;
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to get multiple from store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Performs a transaction on the specified object stores.
     * @param storeNames The names of the object stores involved in the transaction.
     * @param mode The mode of the transaction ("readonly" | "readwrite" | "versionchange").
     * @param callback The callback function to execute within the transaction.
     * @returns A promise that resolves to the result of the callback.
     */
    public async performTransaction<T, K extends IdbObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (
            tx: IDBPTransaction<
                MyIDB,
                K[],
                "versionchange" | "readonly" | "readwrite"
            >
        ) => Promise<T>
    ): Promise<T> {
        console.log(
            `IndexedDBManager: Performing transaction on stores ${storeNames} with mode '${mode}'`
        );
        return this.executeWithRetry(async () => {
            const db = await this.getDB();
            const tx = db.transaction(storeNames, mode);
            try {
                const result = await callback(tx);
                await tx.done; // Wait for transaction to complete
                console.log(
                    `IndexedDBManager: Transaction on stores ${storeNames} completed successfully`
                );
                return result;
            } catch (error) {
                console.error("IndexedDBManager: Transaction failed:", error);
                tx.abort(); // Rollback the transaction
                throw error;
            }
        });
    }

    /**
     * Resolves the key for a given value in the specified object store.
     * @param storeName The name of the object store.
     * @param value The value for which to resolve the key.
     * @param key Optional. The key provided externally.
     * @returns A promise that resolves to the resolved key.
     */
    private async resolveKey<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["key"]> {
        if (key !== undefined) return key;

        const db = await this.getDB();
        const store = db
            .transaction(storeName, "readonly")
            .objectStore(storeName);
        const keyPath = store.keyPath;

        if (typeof keyPath === "string") {
            const resolvedKey = value[keyPath as keyof MyIDB[K]["value"]];
            if (resolvedKey === undefined) {
                throw new Error(
                    `Key '${keyPath}' is missing in the value for store '${storeName}'.`
                );
            }
            return resolvedKey as MyIDB[K]["key"];
        } else {
            throw new Error(
                `Key path for store '${storeName}' is not a string. Cannot resolve key.`
            );
        }
    }

    /**
     * Checks if a value exists in the specified object store.
     * @param storeName The name of the object store.
     * @param key The key(s) to check.
     */
    private async checkExists<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"] | MyIDB[K]["key"][]
    ): Promise<void> {
        console.log(
            `IndexedDBManager: Checking existence in store '${storeName}' for key(s)`,
            key
        );
        try {
            if (Array.isArray(key)) {
                const results: (MyIDB[K]["value"] | undefined)[] =
                    await this.getMultiple(storeName, key);
                results.forEach(
                    (item: MyIDB[K]["value"] | undefined, index: number) => {
                        const currentKey = (key as MyIDB[K]["key"][])[index];
                        if (!item) {
                            throw new Error(
                                `Item with key '${currentKey}' does not exist in '${storeName}'.`
                            );
                        }
                    }
                );
            } else {
                const existingItem: MyIDB[K]["value"] | undefined =
                    await this.get(storeName, key);
                if (!existingItem) {
                    throw new Error(
                        `Item with key '${key}' does not exist in '${storeName}'.`
                    );
                }
            }
            console.log(
                `IndexedDBManager: Existence check passed for store '${storeName}'`
            );
        } catch (error) {
            console.error(
                `IndexedDBManager: Existence check failed for store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Checks if a value does not exist in the specified object store.
     * @param storeName The name of the object store.
     * @param key The key to check.
     */
    private async checkNotExists<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void> {
        console.log(
            `IndexedDBManager: Checking non-existence in store '${storeName}' for key '${key}'`
        );
        try {
            const existingItem: MyIDB[K]["value"] | undefined = await this.get(
                storeName,
                key
            );
            if (existingItem) {
                throw new Error(
                    `Item with key '${key}' already exists in '${storeName}'.`
                );
            }
            console.log(
                `IndexedDBManager: Non-existence check passed for store '${storeName}'`
            );
        } catch (error) {
            console.error(
                `IndexedDBManager: Non-existence check failed for store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Executes a function with a retry mechanism.
     * @param fn The function to execute.
     * @param retries The number of retry attempts.
     * @param delay The initial delay between retries in milliseconds.
     * @returns A promise that resolves to the result of the function.
     */
    private async executeWithRetry<T>(
        fn: () => Promise<T>,
        retries = 3,
        delay = 1000
    ): Promise<T> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt < retries - 1) {
                    const backoff = delay * Math.pow(2, attempt); // Exponential backoff
                    console.warn(
                        `IndexedDBManager: Operation failed, retrying in ${backoff}ms... (Attempt ${
                            attempt + 1
                        }/${retries})`
                    );
                    await this.sleep(backoff);
                } else {
                    console.error("IndexedDBManager: Max retries exceeded");
                    throw error;
                }
            }
        }
        throw new Error("IndexedDBManager: Max retries exceeded");
    }

    /**
     * Sleeps for a specified number of milliseconds.
     * @param ms The number of milliseconds to sleep.
     * @returns A promise that resolves after the specified time.
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Retrieves the IndexedDB database instance.
     * @returns A promise that resolves to the IDBPDatabase instance.
     */
    public getDB(): Promise<IDBPDatabase<MyIDB>> {
        return this.dbPromise;
    }

    /**
     * Counts the number of values in the object store.
     * @param storeName The name of the object store.
     * @returns A promise that resolves to the count of values.
     */
    async count<K extends IdbObjectStoreName>(storeName: K): Promise<number> {
        console.log(`IndexedDBManager: Counting in store '${storeName}'`);
        try {
            const db = await this.getDB();
            const count = await db.count(storeName);
            console.log(
                `IndexedDBManager: Count in store '${storeName}' is ${count}`
            );
            return count;
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to count in store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * **新規実装**:
     * Updates multiple values in the specified object store.
     * @param storeName The name of the object store.
     * @param values An array of values to update.
     * @returns A promise that resolves when all values are updated.
     */
    public async updateMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        values: MyIDB[K]["value"][]
    ): Promise<void> {
        console.log(
            `IndexedDBManager: Updating multiple in store '${storeName}'`
        );
        try {
            await this.performTransaction(
                [storeName],
                "readwrite",
                async (tx) => {
                    const store = tx.objectStore(storeName);
                    for (const value of values) {
                        const key = await this.resolveKey(storeName, value);
                        await store.put(value, key);
                        console.log(
                            `IndexedDBManager: Updated memo with key '${key}'`
                        );
                    }
                }
            );
            console.log(
                `IndexedDBManager: Successfully updated multiple in store '${storeName}'`
            );
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to update multiple in store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * **新規実装**:
     * Deletes multiple values from the specified object store by their keys.
     * @param storeName The name of the object store.
     * @param keys An array of keys to delete.
     * @returns A promise that resolves when all values are deleted.
     */
    public async deleteMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<void> {
        console.log(
            `IndexedDBManager: Deleting multiple from store '${storeName}'`
        );
        try {
            await this.performTransaction(
                [storeName],
                "readwrite",
                async (tx) => {
                    const store = tx.objectStore(storeName);
                    for (const key of keys) {
                        await store.delete(key);
                        console.log(
                            `IndexedDBManager: Deleted memo with key '${key}'`
                        );
                    }
                }
            );
            console.log(
                `IndexedDBManager: Successfully deleted multiple from store '${storeName}'`
            );
        } catch (error) {
            console.error(
                `IndexedDBManager: Failed to delete multiple from store '${storeName}':`,
                error
            );
            throw error;
        }
    }

    /**
     * Deletes all data from the specified object store.
     * @param storeName The name of the object store to clear.
     * @returns A promise that resolves when the store is cleared.
     */
    public async clearStore<K extends IdbObjectStoreName>(
        storeName: K
    ): Promise<void> {
        const db = await this.getDB();
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        await store.clear();
        await tx.done;
        console.log(`Store "${storeName}" has been cleared.`);
    }
}

export default IndexedDBManager;
