import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";
import { IdbObjectStoreName } from "@/constants/clientSide/idb/objectStores";

/**
 * A generic repository class for interacting with IndexedDB object stores.
 * @template K The type of the object store name.
 * @template T The type of the value stored in the object store.
 */
export class GenericRepository<K extends IdbObjectStoreName, T extends MyIDB[K]["value"] = MyIDB[K]["value"]> {
    protected idbManager: IIndexedDBManager;
    protected storeName: K;

    /**
     * Creates a new instance of the GenericRepository class.
     * @param idbManager The IndexedDB manager.
     * @param storeName The name of the object store.
     */
    constructor(idbManager: IIndexedDBManager, storeName: K) {
        this.idbManager = idbManager;
        this.storeName = storeName;
    }

    /**
     * Retrieves a value from the object store by its key.
     * @param key The key of the value to retrieve.
     * @returns A promise that resolves to the value, or undefined if the key is not found.
     */
    async get(key: MyIDB[K]["key"]): Promise<T | undefined> {
        return this.idbManager.get(this.storeName, key) as Promise<T | undefined>;
    }

    /**
     * Retrieves all values from the object store.
     * @returns A promise that resolves to an array of all values in the object store.
     */
    async getAll(): Promise<T[]> {
        return this.idbManager.getAll(this.storeName) as Promise<T[]>;
    }

    /**
     * Adds a new value to the object store.
     * @param value The value to add.
     * @param key Optional. The key to associate with the value. If not provided, an auto-generated key will be used.
     * @returns A promise that resolves to the key of the newly added value.
     */
    async add(value: T, key?: MyIDB[K]["key"]): Promise<MyIDB[K]["key"]> {
        return this.idbManager.add(this.storeName, value, key);
    }

    /**
     * Updates an existing value in the object store, or adds a new value if the key does not exist.
     *
     * This method supports both partial and full updates:
     * - If `key` is `undefined`, it performs a full update, replacing the existing object (if any) with the new `value`.
     * - If `key` is provided and `value` has the same number of keys as the existing object, it performs a full update.
     * - If `key` is provided and `value` has fewer keys than the existing object, it performs a partial update, merging the new `value` with the existing object.
     *
     * @param value The value to update or add.
     * @param key Optional. The key of the value to update. If not provided, the value will be added with an auto-generated key.
     */
    async update(value: T | Partial<T>, key?: MyIDB[K]["key"]): Promise<void> {
        if (key === undefined) {
            // If the key is not specified, it is considered a complete object update.
            return this.idbManager.put(this.storeName, value as T);
        }

        const existing = await this.get(key);
        if (existing) {
            if (Object.keys(value).length === Object.keys(existing).length) {
                // If the number of keys in the object is the same, it is considered a complete object update.
                return this.idbManager.put(this.storeName, value as T, key);
            } else {
                // If a key is specified and it is a partial update, get the existing object and merge it.
                const updated = { ...existing, ...value };
                return this.idbManager.put(this.storeName, updated, key);
            }
        } else {
            // Throw an error if the existing object is not found.
            throw new Error(`Object with key ${key} not found in store ${this.storeName}.`);
        }
    }

    /**
     * Deletes a value from the object store by its key.
     * @param key The key of the value to delete.
     * @returns A promise that resolves when the value is deleted.
     */
    async delete(key: MyIDB[K]["key"]): Promise<void> {
        return this.idbManager.delete(this.storeName, key);
    }

    /**
     * Retrieves multiple values from the object store by their keys.
     * @param keys An array of keys to retrieve.
     * @returns A promise that resolves to an array of values, or undefined for keys that are not found.
     */
    async getMultiple(keys: MyIDB[K]["key"][]): Promise<(T | undefined)[]> {
        return this.idbManager.getMultiple(this.storeName, keys) as Promise<(T | undefined)[]>;
    }

    /**
     * Deletes multiple values from the object store by their keys.
     * @param keys An array of keys to delete.
     * @returns A promise that resolves when all values are deleted.
     */
    async deleteMultiple(keys: MyIDB[K]["key"][]): Promise<void> {
        return this.idbManager.deleteMultiple(this.storeName, keys);
    }

    /**
     * Updates multiple values in the object store.
     * @param values An array of values to update.
     * @returns A promise that resolves when all values are updated.
     */
    async updateMultiple(values: T[]): Promise<void> {
        return this.idbManager.updateMultiple(this.storeName, values);
    }

    /**
     * Retrieves all values from the object store that match the given filter function.
     * @param filterFn A function that takes a value and returns true if it should be included in the results.
     * @returns A promise that resolves to an array of values that match the filter function.
     */
    async getAllByFilter(filterFn: (value: T) => boolean): Promise<T[]> {
        const allValues = await this.getAll();
        return allValues.filter(filterFn);
    }

    /**
     * Counts the number of values in the object store.
     * @returns A promise that resolves to the number of values in the object store.
     */
    async count(): Promise<number> {
        return this.idbManager.count(this.storeName);
    }

    /**
     * Clears all values from the object store.
     * @returns A promise that resolves when the object store is cleared.
     */
    async clear(): Promise<void> {
        return this.idbManager.clear(this.storeName);
    }
}
