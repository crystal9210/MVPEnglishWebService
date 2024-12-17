import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";
import { ObjectStoreName } from "@/constants/clientSide/idb/objectStores";

export class GenericRepository<K extends ObjectStoreName> {
    private idbManager: IIndexedDBManager;
    private storeName: K;

    constructor(idbManager: IIndexedDBManager, storeName: K) {
        this.idbManager = idbManager;
        this.storeName = storeName;
    }

    async get(key: MyIDB[K]["key"]): Promise<MyIDB[K]["value"] | undefined> {
        return this.idbManager.get(this.storeName, key);
    }

    async getAll(): Promise<MyIDB[K]["value"][]> {
        return this.idbManager.getAll(this.storeName);
    }

    async add(value: MyIDB[K]["value"], key?: MyIDB[K]["key"]): Promise<MyIDB[K]["key"]> {
        return this.idbManager.add(this.storeName, value, key);
    }

    async update(value: MyIDB[K]["value"], key?: MyIDB[K]["key"]): Promise<void> {
        return this.idbManager.put(this.storeName, value, key);
    }

    async delete(key: MyIDB[K]["key"]): Promise<void> {
        return this.idbManager.delete(this.storeName, key);
    }

    async getMultiple(keys: MyIDB[K]["key"][]): Promise<(MyIDB[K]["value"] | undefined)[]> {
        return this.idbManager.getMultiple(this.storeName, keys);
    }

    async deleteMultiple(keys: MyIDB[K]["key"][]): Promise<void> {
        return this.idbManager.deleteMultiple(this.storeName, keys);
    }

    async updateMultiple(values: MyIDB[K]["value"][]): Promise<void> {
        return this.idbManager.updateMultiple(this.storeName, values);
    }
}
