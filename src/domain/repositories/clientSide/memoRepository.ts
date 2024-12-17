import { GenericRepository } from "@/domain/repositories/clientSide/genericRepository";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";

export class MemoRepository extends GenericRepository<"memoList"> {
    constructor(idbManager: IIndexedDBManager) {
        super(idbManager, "memoList");
    }

    async getMemoListByKeyword(keyword: string): Promise<Memo[]> {
        const allMemos: Memo[] = await this.getAll();
        return allMemos.filter(memo => memo.content.includes(keyword));
    }

    async getMemoListByRange(startDate: Date, endDate: Date): Promise<Memo[]> {
        const allMemos: Memo[] = await this.getAll();
        return allMemos.filter(memo => {
            const memoDate = new Date(memo.createdAt);
            return memoDate >= startDate && memoDate <= endDate;
        });
    }

    async addMultipleMemos(memos: Memo[]): Promise<(string | number)[]> {
    return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
        const store = tx.objectStore(this.storeName);
        const results: (string | number)[] = [];

        for (const memo of memos) {
            const existingMemo = await store.get(memo.id as MyIDB["memoList"]["key"]);
            if (existingMemo) {
                throw new Error(`Memo with ID ${memo.id} already exists.`);
            }

            // 型アサーションを適用して store.add の型エラーを解消
            const result = await (store.add as (value: Memo) => Promise<string | number>)(memo);
            results.push(result);
        }

        return results;
    });
}

    async updateMultipleMemos(memos: Memo[]): Promise<void> {
        return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
            const store = tx.objectStore(this.storeName);

            for (const memo of memos) {
                const existingMemo = await store.get(memo.id as MyIDB["memoList"]["key"]);
                if (!existingMemo) {
                    throw new Error(`Memo with ID ${memo.id} does not exist.`);
                }
                await super.update(memo, memo.id);
            }
        });
    }
}
