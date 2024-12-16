import { Memo } from '@/schemas/app/_contexts/memoSchemas';

export interface IMemoRepository {
    addMemo(memo: Memo): Promise<void>;
    getMemo(id: string): Promise<Memo | undefined>;
    getAllMemos(): Promise<Memo[]>;
    updateMemo(id: string, memo: Memo): Promise<void>; // TODO ステータスを返すかどうか
    deleteMemo(id: string): Promise<void>;
}
