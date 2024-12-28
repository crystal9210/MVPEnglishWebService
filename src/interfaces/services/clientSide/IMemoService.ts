/* eslint-disable no-unused-vars */
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

export interface IMemoService {
    getAllMemos(): Promise<Memo[]>;
    createMemo(content: string): Promise<Memo>;
    updateMemo(id: string, updates: Partial<Memo>): Promise<void>;
    deleteMemo(id: string): Promise<void>;
}
