/* eslint-disable no-unused-vars */
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

/**
 * Interface defining the shape of the Memo context.
 */
export interface IMemoContext {
    memoList: Memo[];
    trashedMemoList: Memo[];
    /**
     * Adds a new memo.
     * @param content The content of the memo.
     * @param tags Tags associated with the memo.
     */
    addMemo: (content: string, tags?: string[]) => Promise<void>;

    /**
     * Edits an existing memo.
     * @param id The ID of the memo.
     * @param content The updated content.
     * @param tags The updated tags.
     */
    editMemo: (id: string, content: string, tags?: string[]) => Promise<void>;

    /**
     * Deletes a memo (soft delete).
     * @param id The ID of the memo.
     */
    deleteMemo: (id: string) => Promise<void>;

    /**
     * Restores a trashed memo.
     * @param id The ID of the memo.
     */
    restoreMemo: (id: string) => Promise<void>;

    /**
     * Permanently deletes a trashed memo.
     * @param id The ID of the memo.
     */
    permanentlyDeleteMemo: (id: string) => Promise<void>;

    /**
     * Searches memos by a query string.
     * @param query The search query.
     * @returns An array of memos matching the query.
     */
    searchMemoList: (query: string) => Memo[];

    /**
     * Filters memos by specified tags.
     * @param tags The tags to filter by.
     * @returns An array of memos containing the specified tags.
     */
    filterMemoListByTag: (tags: string[]) => Memo[];

    /**
     * Sorts memos by creation date.
     * @param order The order of sorting: "asc" for ascending, "desc" for descending.
     */
    sortMemoListByDate: (order: "asc" | "desc") => void;
}
