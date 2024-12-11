import { Memo } from "@/schemas/app/_contexts/memoSchemas";

// TODO MemoArrayをmemoSchemasにて実装しているが全体のトレードオフおよび責任分離の観点からどのように扱うべきか

export interface MemoContext {
    memoArray: Memo[],
    trashMemoArray: Memo[],
    addMemo: (content: string, tags?: string[]) => void;
    editMemo: (id: string, content: string, tags?: string[]) => void;
    deleteMemo: (id: string) => void;
    searchMemo: (query: string) => Memo[];
    filterMemoByTag: (tags: string[]) => Memo[];
    sortMemoByDate: (order: "asc" | "desc") =>void;
};
