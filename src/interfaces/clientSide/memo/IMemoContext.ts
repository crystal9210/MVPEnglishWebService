import { Memo } from "@/schemas/app/_contexts/memoSchemas";

// TODO MemoArrayをmemoSchemasにて実装しているが全体のトレードオフおよび責任分離の観点からどのように扱うべきか
// ビジネスロジック層

export interface IMemoContext {
    memoList: Memo[],
    trashMemoList: Memo[],
    addMemo: (content: string, tags?: string[]) => void;
    editMemo: (id: string, content: string, tags?: string[]) => void;
    deleteMemo: (id: string) => void;
    restoredMemo: (id: string) => Promise<void>;
    permanentlyDeleteMemo: (id: string) => Promise<void>;
    serachMemoList: (query: string) => Memo[];
    filterMemoListByTag: (tags: string[]) => Memo[];
    sortMemoListByDate: (order: "asc" | "desc") =>void;
};
