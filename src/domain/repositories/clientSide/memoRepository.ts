import { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

// valid types of IDBValidKey:
// number | string | Date | ArrayBufferView | ArrayBuffer

export class MemoRepository {
    private idbManager: IIndexedDBManager;

    constructor(idbManager: IIndexedDBManager) {
        this.idbManager = idbManager;
    }

    async addMemo(memo: Memo, key?: string | number): Promise<string | number> {
        const existingMemoList: Memo[] = await this.idbManager.getAll("memoList");
        if (existingMemoList.some(existingMemoList => existingMemoList.id === memo.id)) {
            throw new Error(`Memo with ID ${memo.id} already exists.`);
        }
        return this.idbManager.add("memoList", memo, key);
    }

    async getAllMemoList(): Promise<Memo[]> {
        try {
            return await this.idbManager.getAll("memoList");
        } catch (error) {
            console.error("Failed to get all memos:", error);
            throw error;
        }
    }

    async getMemoListByKeyword(keyword: string): Promise<Memo[]> {
        try {
            const allMemoList: Memo[] = await this.idbManager.getAll("memoList");
            return allMemoList.filter(memo => memo.content.includes(keyword));
        } catch (error) {
            console.error(`Failed to get memos by keyword ${keyword}:`, error);
            throw error;
        }
    }

    // 特定期間内のメモを取得
    async getMemoListByRange(startDate: Date, endDate: Date): Promise<Memo[]> {
        try {
            const allMemoList: Memo[] = await this.idbManager.getAll("memoList");
            return allMemoList.filter(memo => {
                const memoDate = new Date(memo.createdAt);
                return memoDate >= startDate && memoDate <= endDate;
            });
        } catch (error) {
            console.error("Failed to get  memos by date range:", error);
            throw error;
        }
    }

    async updateMemo(memo: Memo): Promise<void> {
        try {
            const existingMemoList: Memo[] = await this.idbManager.getAll("memoList");
            if (!existingMemoList) {
                throw new Error(`Memo with ID ${memo.id} does not exist.`);
            }
            await this.idbManager.put("memoList", memo, memo.id);
        } catch (error) {
            console.error("Failed to update memo:", error);
            throw error;
        }
    }

    async deleteMemo(id: string | number): Promise<void> {
        try {
            await this.idbManager.delete("memoList", id);
        } catch (error) {
            console.error(`Failed to delete memo with ID ${id}:`, error);
            throw error;
        }
    }

    // トランザクションを用いて複数のメモを一括追加
    async addMultipleMemos(memoList: Memo[]): Promise<(string | number)[]> {
        return this.idbManager.performTransaction(
            ["memoList"],
            "readwrite",
            async (tx) => {
                const store = tx.objectStore("memoList");
                const results: (string | number)[] = [];

                for (const memo of memoList) {
                    // 各メモの重複チェック
                    const existingMemo = await store.get(memo.id);
                    if (existingMemo) {
                        throw new Error(`Memo with ID ${memo.id} already exists.`);
                    }
                    const result = await store.add(memo);
                    results.push(result);
                }

                return results;
            }
        );
    }

    // トランザクションを用いて複数のメモを一括更新
    async updateMultipleMemos(memos: Memo[]): Promise<void> {
        return this.idbManager.performTransaction(
            ["memoList"],
            "readwrite",
            async (tx) => {
                const store = tx.objectStore("memoList");

                for (const memo of memos) {
                    // 各メモが存在するか確認
                    const existingMemo = await store.get(memo.id);
                    if (!existingMemo) {
                        throw new Error(`Memo with ID ${memo.id} does not exist.`);
                    }
                    await store.put(memo);
                }
            }
        );
    }

    // トランザクションを用いて複数のメモを一括削除
    async deleteMultipleMemos(ids: IDBKeyRange[]): Promise<void> {
        return this.idbManager.performTransaction(
            ["memoList"],
            "readwrite",
            async (tx) => {
                const idb = await this.idbManager.getDB();
                await idb.delete(storeName)
                for (const id of ids) {
                    const existingMemo = await store.get(id);
                    if (!existingMemo) {
                        throw new Error(`Memo with ID ${id} does not exist.`);
                    } else {
                        await store.delete(id);
                    }
                }
            }
        );
    }
}
