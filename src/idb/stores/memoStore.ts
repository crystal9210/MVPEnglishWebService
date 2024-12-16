import { IMemoRepository } from '@/interfaces/clientSide/repositories/IMemoRepository';
import { Memo } from '@/schemas/app/_contexts/memoSchemas';
import { DBManager } from '..';

export class MemoStore implements IMemoRepository {
    private dbPromise = DBManager.getInstance().getDB();

    async addMemo(memo: Memo): Promise<void> {
        const db = await this.dbPromise;
        await db.put("memoList", memo);
    }

    async getMemo(id: string): Promise<Memo | undefined> {
        const db = await this.dbPromise;
        return db.get("memoList", id);
    }

    async getAllMemos(): Promise<Memo[]> {
        const db = await this.dbPromise;
        return db.getAll("memoList");
    }

    async updateMemo(id: string, memo: Memo): Promise<void> {
        const db = await this.dbPromise;
        await db.put("memoList", memo);
    }

    async deleteMemo(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete("memoList", id);
    }

}
