import { Memo } from '@/schemas/app/_contexts/memoSchemas';

export interface IMemoRepository {
    addMemo(memo: Memo): Promise<void>;
    getMemo(id: string): Promise<Memo | undefined>;
    getAllMemos(): Promise<Memo[]>;
    deleteMemo(id: string): Promise<void>;
}
