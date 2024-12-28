import { GenericRepository } from "./genericRepository";
import type { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";
import { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";

export class MemoRepository
  extends GenericRepository<"memoList", Memo>
  implements IMemoRepository
{
  constructor(idbManager: IIndexedDBManager) {
    super(idbManager, "memoList");
  }

  async addMemo(memo: Memo): Promise<void> {
    await this.add(memo);
  }

  async getMemo(id: string): Promise<Memo | undefined> {
    return this.get(id);
  }

  async getAllMemos(): Promise<Memo[]> {
    return this.getAll();
  }

  async updateMemo(id: string, updates: Partial<Memo>): Promise<void> {
    const existingMemo = await this.getMemo(id);
    if (!existingMemo) {
      throw new Error(`Memo with ID ${id} not found.`);
    }
    const updatedMemo = { ...existingMemo, ...updates, lastUpdatedAt: new Date() };
    await this.update(updatedMemo, id);
  }

  async deleteMemo(id: string): Promise<void> {
    await this.delete(id);
  }

  async getMemosByKeyword(keyword: string): Promise<Memo[]> {
    const allMemos = await this.getAllMemos();
    return allMemos.filter((memo) => memo.content.includes(keyword));
  }

  async getMemosByDateRange(startDate: Date, endDate: Date): Promise<Memo[]> {
    const allMemos = await this.getAllMemos();
    return allMemos.filter((memo) => {
      const memoDate = new Date(memo.createdAt);
      return memoDate >= startDate && memoDate <= endDate;
    });
  }

  async addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]> {
    return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
      const store = tx.objectStore(this.storeName);
      const results: IDBValidKey[] = [];
      for (const memo of memos) {
        const existingMemo = await store.get(memo.id as MyIDB["memoList"]["key"]);
        if (existingMemo) {
          throw new Error(`Memo with ID ${memo.id} already exists.`);
        }
        const result = await super.add(memo);
        results.push(result);
      }
      return results;
    });
  }

  async updateMultipleMemos(memos: Partial<Memo>[]): Promise<void> {
    return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
      const store = tx.objectStore(this.storeName);
      for (const memo of memos) {
        if (!memo.id) {
          throw new Error("Memo ID is required for update.");
        }
        const existingMemo = await store.get(memo.id as MyIDB["memoList"]["key"]);
        if (!existingMemo) {
          throw new Error(`Memo with ID ${memo.id} not found.`);
        }
        const updatedMemo = { ...existingMemo, ...memo, lastUpdatedAt: new Date() };
        await super.update(updatedMemo);
      }
    });
  }

  async deleteMultipleMemos(ids: string[]): Promise<void> {
    return this.idbManager.performTransaction(["memoList"], "readwrite", async (tx) => {
      const store = tx.objectStore(this.storeName);
      for (const id of ids) {
        const existingMemo = await store.get(id as MyIDB["memoList"]["key"]);
        if (!existingMemo) {
          throw new Error(`Memo with ID ${id} not found.`);
        }
        await super.delete(id);
      }
    });
  }

  async countMemos(): Promise<number> {
    return this.idbManager.count(this.storeName);
  }
}
