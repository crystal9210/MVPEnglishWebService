import { GenericRepository } from "./genericRepository";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";
/**
 * Repository class for managing memos in IndexedDB.
 */
export class MemoRepository extends GenericRepository<"memoList", Memo> {
    /**
     * Creates a new instance of the MemoRepository class.
     * @param idbManager The IndexedDB manager.
     */
    constructor(idbManager: IIndexedDBManager) {
        super(idbManager, "memoList");
    }

    /**
     * Retrieves memos that contain the specified keyword in their content.
     * @param keyword The keyword to search for.
     * @returns A promise that resolves to an array of memos that match the keyword.
     */
    async getMemoListByKeyword(keyword: string): Promise<Memo[]> {
        const allMemos: Memo[] = await this.getAll();
        return allMemos.filter(memo => memo.content.includes(keyword));
    }

    /**
     * Retrieves memos that were created within the specified date range.
     * @param startDate The start date of the range.
     * @param endDate The end date of the range.
     * @returns A promise that resolves to an array of memos that fall within the date range.
     */
    async getMemoListByRange(startDate: Date, endDate: Date): Promise<Memo[]> {
        const allMemos: Memo[] = await this.getAll();
        return allMemos.filter(memo => {
            const memoDate = new Date(memo.createdAt);
            return memoDate >= startDate && memoDate <= endDate;
        });
    }

    /**
     * Adds multiple memos to the object store.
     * @param memos An array of memos to add.
     * @returns A promise that resolves to an array of the keys of the newly added memos.
     * @throws {Error} If a memo with the same ID already exists.
     */
    async addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]> {
        return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
            const store = tx.objectStore(this.storeName);
            const results: IDBValidKey[] = [];

            for (const memo of memos) {
                const existingMemo = await store.get(memo.id as MyIDB["memoList"]["key"]);
                if (existingMemo) {
                    throw new Error(`Memo with ID ${memo.id} already exists.`);
                }

                // Use non-null assertion operator (!) to tell TypeScript that store.add is not undefined.
                const result = await super.add(memo as MyIDB["memoList"]["value"])!;
                results.push(result);
            }

            return results;
        });
    }

    /**
     * Updates multiple memos in the object store.
     * @param memos An array of memos to update.
     * @returns A promise that resolves when all memos are updated.
     * @throws {Error} If a memo with the given ID does not exist.
     */
    async updateMultipleMemos(memos: Memo[]): Promise<void> {
        return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
            const store = tx.objectStore(this.storeName);

            for (const memo of memos) {
                const existingMemo = await store.get(memo.id as MyIDB["memoList"]["key"]);
                if (!existingMemo) {
                    throw new Error(`Memo with ID ${memo.id} does not exist.`);
                }
                // Use the update method from the GenericRepository class to update the memo.
                await super.update(memo, memo.id as MyIDB["memoList"]["key"]);
            }
        });
    }
}
