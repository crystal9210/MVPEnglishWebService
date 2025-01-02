/* eslint-disable no-unused-vars */
import { IDBPTransaction, IDBPDatabase } from "idb";
import { IdbObjectStoreName } from "@/constants/clientSide/idb/objectStores";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";

/**
 * Interface for managing IndexedDB operations.
 */
export interface IIndexedDBManager {
    /**
     * データ追加
     * Adds a new value to the specified object store.
     * @param storeName The name of the object store.
     * @param value The value to add.
     * @param key Optional. The key to associate with the value. If not provided and keyPath is set, it will be extracted from the value.
     * @returns A promise that resolves to the key of the newly added value.
     */
    add<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["key"]>;

    /**
     * データ更新or追加
     * Updates an existing value or adds a new value if the key does not exist.
     * @param storeName The name of the object store.
     * @param value The value to update or add.
     * @param key Optional. The key of the value to update. If not provided and keyPath is set, it will be extracted from the value.
     * @returns A promise that resolves when the operation is complete.
     */
    put<K extends IdbObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<void>;

    /**
     * 指定オブジェクトストア内の全データ取得
     * Retrieves all values from the specified object store.
     * @param storeName The name of the object store.
     * @returns A promise that resolves to an array of all values in the object store.
     */
    getAll<K extends IdbObjectStoreName>(
        storeName: K
    ): Promise<MyIDB[K]["value"][]>;

    /**
     * 指定キーのデータ取得
     * Retrieves a value from the specified object store by its key.
     * @param storeName The name of the object store.
     * @param key The key of the value to retrieve.
     * @returns A promise that resolves to the value, or undefined if the key is not found.
     */
    get<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["value"] | undefined>;

    /**
     * 指定キーのデータ削除
     * Deletes a value from the specified object store by its key.
     * @param storeName The name of the object store.
     * @param key The key of the value to delete.
     * @returns A promise that resolves when the value is deleted.
     */
    delete<K extends IdbObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void>;

    /**
     * オブジェクトストア内の全データクリア
     * Clears all values from the specified object store.
     * @param storeName The name of the object store.
     * @returns A promise that resolves when the object store is cleared.
     */
    clear<K extends IdbObjectStoreName>(storeName: K): Promise<void>;

    /**
     * 指定インデックスによるデータ取得
     * Retrieves all values from a specific index in the object store.
     * @param storeName The name of the object store.
     * @param indexName The name of the index to query.
     * @param query Optional. The query range or key.
     * @returns A promise that resolves to an array of matching values.
     */
    getAllFromIndex<K extends IdbObjectStoreName>(
        storeName: K,
        indexName: string,
        query?: string | IDBKeyRange | MyIDB[K]["key"] | null
    ): Promise<MyIDB[K]["value"][]>;

    /**
     * 複数キーを指定してデータ取得
     * Retrieves multiple values from the specified object store by their keys.
     * @param storeName The name of the object store.
     * @param keys An array of keys to retrieve.
     * @returns A promise that resolves to an array of values, or undefined for keys that are not found.
     */
    getMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<(MyIDB[K]["value"] | undefined)[]>;

    /**
     * 複数データ更新
     * Updates multiple values in the specified object store.
     * @param storeName The name of the object store.
     * @param values An array of values to update.
     * @returns A promise that resolves when all values are updated.
     */
    updateMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        values: MyIDB[K]["value"][]
    ): Promise<void>;

    /**
     * 複数キーのデータ一括削除
     * Deletes multiple values from the specified object store by their keys.
     * @param storeName The name of the object store.
     * @param keys An array of keys to delete.
     * @returns A promise that resolves when all values are deleted.
     */
    deleteMultiple<K extends IdbObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<void>;

    /**
     * トランザクション実行
     * Executes a transaction on the specified object stores.
     * @param storeNames The names of the object stores involved in the transaction.
     * @param mode The mode of the transaction ("readonly" | "readwrite" | "versionchange").
     * @param callback The callback function to execute within the transaction.
     * @returns A promise that resolves to the result of the callback.
     */
    performTransaction<T, K extends IdbObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (
            tx: IDBPTransaction<
                MyIDB,
                K[],
                "versionchange" | "readonly" | "readwrite"
            >
        ) => Promise<T>
    ): Promise<T>;

    /**
     * DB接続取得
     * Retrieves the IndexedDB database instance.
     * @returns A promise that resolves to the IDBPDatabase instance.
     */
    getDB(): Promise<IDBPDatabase<MyIDB>>;

    /**
     * Deletes all data from the specified object store.
     * @param storeName The name of the object store to clear.
     * @returns A promise that resolves when the store is cleared.
     */
    clearStore<K extends IdbObjectStoreName>(storeName: K): Promise<void>;

    /**
     * オブジェクトストア内のデータ数カウント
     * Counts the number of values in the specified object store.
     * @param storeName The name of the object store.
     * @returns A promise that resolves to the count of values.
     */
    count<K extends IdbObjectStoreName>(storeName: K): Promise<number>;

    /**
     * DBのバックアップ・リカバリ処理実行
     * Executes backup and recovery processes for the database.
     * (Backup data restoration: internally executed)
     * This should not be exposed publicly >> Handling: internal process
     */
    // backupAndRecover(): Promise<void>;
}
