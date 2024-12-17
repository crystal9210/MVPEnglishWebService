import { IDBPTransaction, IDBPDatabase } from "idb";
import { ObjectStoreName } from "@/constants/clientSide/idb/objectStores";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";

export interface IIndexedDBManager {
    add<K extends ObjectStoreName>(storeName: K, value: MyIDB[K]["value"], key?: MyIDB[K]["key"]): Promise<MyIDB[K]["key"]>;
    put<K extends ObjectStoreName>(storeName: K, value: MyIDB[K]["value"], key?: MyIDB[K]["key"]): Promise<void>;
    getAll<K extends ObjectStoreName>(storeName: K): Promise<MyIDB[K]["value"][]>;
    delete<K extends ObjectStoreName>(storeName: K, key: MyIDB[K]["key"]): Promise<void>;
    clear<K extends ObjectStoreName>(storeName: K): Promise<void>;
    getAllFromIndex<K extends ObjectStoreName, I extends keyof MyIDB[K]["indexes"]>(
        storeName: K,
        indexName: I,
        query: IDBKeyRange | (string extends keyof MyIDB[K]["indexes"] ? MyIDB[K]["indexes"][keyof MyIDB[K]["indexes"] & string] : IDBValidKey) | null | undefined
    ): Promise<MyIDB[K]["value"][]>;
    performTransaction<T, K extends ObjectStoreName>(
        storeNames: K[],
        mode: IDBTransactionMode,
        callback: (tx: IDBPTransaction<MyIDB, K[], "versionchange" | "readonly" | "readwrite">) => Promise<T>
    ): Promise<T>;
    getDB(): Promise<IDBPDatabase<MyIDB>>;
}
