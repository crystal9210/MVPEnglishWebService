/* eslint-disable no-unused-vars */
import { IDBPTransaction, IDBPDatabase } from "idb";
import { ObjectStoreName } from "@/constants/clientSide/idb/objectStores";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";

export interface IIndexedDBManager {
    /**
     * データ追加
     */
    add<K extends ObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["key"]>;

    /**
     * データ更新or追加
     */
    put<K extends ObjectStoreName>(
        storeName: K,
        value: MyIDB[K]["value"],
        key?: MyIDB[K]["key"]
    ): Promise<void>;

    /**
     * 指定オブジェクトストア内の全データ取得
     */
    getAll<K extends ObjectStoreName>(storeName: K): Promise<MyIDB[K]["value"][]>;

    /**
     * 指定キーのデータ取得
     */
    get<K extends ObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<MyIDB[K]["value"] | undefined>;

    /**
     * 指定キーのデータ削除
     */
    delete<K extends ObjectStoreName>(
        storeName: K,
        key: MyIDB[K]["key"]
    ): Promise<void>;

    /**
     * オブジェクトストア内の全データクリア
     */
    clear<K extends ObjectStoreName>(storeName: K): Promise<void>;

    /**
     * 指定インデックスによるデータ取得
     */
    getAllFromIndex<K extends ObjectStoreName, I extends keyof MyIDB[K]["indexes"]>(
        storeName: K,
        indexName: I,
        query: IDBKeyRange | (string extends keyof MyIDB[K]["indexes"]
            ? MyIDB[K]["indexes"][keyof MyIDB[K]["indexes"] & string]
            : IDBValidKey) | null | undefined
    ): Promise<MyIDB[K]["value"][]>;

    /**
     * 複数キーを指定してデータ取得
     */
    getMultiple<K extends ObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<(MyIDB[K]["value"] | undefined)[]>;

    /**
     * 複数データ更新
     */
    updateMultiple<K extends ObjectStoreName>(
        storeName: K,
        values: MyIDB[K]["value"][]
    ): Promise<void>;

    /**
     * 複数キーのデータ一括削除
     */
    deleteMultiple<K extends ObjectStoreName>(
        storeName: K,
        keys: MyIDB[K]["key"][]
    ): Promise<void>;

    /**
     * トランザクション実行
     */
    performTransaction<T, K extends ObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (tx: IDBPTransaction<MyIDB, K[], "readonly" | "readwrite">) => Promise<T>
    ): Promise<T>;

    /**
     * DB接続取得
     */
    getDB(): Promise<IDBPDatabase<MyIDB>>;

    /**
     * DBのバックアップ・リカバリ処理実行
     * (バックアップデータの復元:内部実行)
     */
    backupAndRecover(): Promise<void>;
}
