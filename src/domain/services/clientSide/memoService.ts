import { MemoRepository } from "@/domain/repositories/clientSide/memoRepository";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

export class MemoService {
    private memoRepository: MemoRepository;

    constructor(idbManager: IIndexedDBManager) {
        this.memoRepository = new MemoRepository(idbManager);
    }

    async createMemo(memo: Memo): Promise<string | number> {
        return this.memoRepository.add(memo, memo.id);
    }

    async getAllMemos(): Promise<Memo[]> {
        return this.memoRepository.getAll();
    }

    async searchMemosByKeyword(keyword: string): Promise<Memo[]> {
        return this.memoRepository.getMemoListByKeyword(keyword);
    }

    async getMemosByDateRange(startDate: Date, endDate: Date): Promise<Memo[]> {
        return this.memoRepository.getMemoListByRange(startDate, endDate);
    }

    async updateMemo(memo: Memo): Promise<void> {
        await this.memoRepository.update(memo, memo.id);
    }

    async deleteMemo(id: string | number): Promise<void> {
        await this.memoRepository.delete(id);
    }

    async bulkAddMemos(memos: Memo[]): Promise<(string | number)[]> {
        return this.memoRepository.addMultipleMemos(memos);
    }

    async bulkUpdateMemos(memos: Memo[]): Promise<void> {
        await this.memoRepository.updateMultipleMemos(memos);
    }
}
