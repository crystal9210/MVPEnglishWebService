/* eslint-disable no-unused-vars */
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

/**
 * Interface for MemoService, managing business logic related to memos.
 */
export interface IMemoService {
    /**
     * Retrieves all non-deleted memos.
     * @returns A promise that resolves to an array of memos.
     */
    getAllMemos(): Promise<Memo[]>;

    /**
     * Creates a new memo.
     * @param content The content of the memo.
     * @returns A promise that resolves to the newly created memo.
     */
    createMemo(content: string, tags: string[]): Promise<Memo>;

    /**
     * Updates an existing memo.
     * @param id The ID of the memo.
     * @param updates The updates to apply.
     * @returns A promise that resolves when the operation is complete.
     */
    updateMemo(id: string, updates: Partial<Memo>): Promise<void>;

    /**
     * Soft deletes a memo.
     * @param id The ID of the memo.
     * @returns A promise that resolves when the operation is complete.
     */
    deleteMemo(id: string): Promise<void>;

    /**
     * Adds multiple memos.
     * @param memos An array of memos to add.
     * @returns A promise that resolves to an array of keys of the added memos.
     */
    addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]>;

    /**
     * Updates multiple memos.
     * @param memos An array of partial memos to update.
     * @returns A promise that resolves when all updates are complete.
     */
    updateMultipleMemos(memos: Partial<Memo>[]): Promise<void>;

    /**
     * Deletes multiple memos.
     * @param ids An array of memo IDs to delete.
     * @returns A promise that resolves when all deletions are complete.
     */
    deleteMultipleMemos(ids: string[]): Promise<void>;

    /**
     * Counts the number of memos.
     * @returns A promise that resolves to the count of memos.
     */
    countMemos(): Promise<number>;

    /**
     * Retrieves all trashed memos.
     * @returns A promise that resolves to an array of trashed memos.
     */
    getTrashedMemos(): Promise<Memo[]>;

    /**
     * Restores a trashed memo.
     * @param id The ID of the memo to restore.
     * @returns A promise that resolves when the memo is restored.
     */
    restoreMemo(id: string): Promise<void>;

    /**
     * Deletes a trashed memo permanently.
     * @param id The ID of the trashed memo to delete.
     * @returns A promise that resolves when the memo is deleted.
     */
    deleteTrashedMemo(id: string): Promise<void>;

    /**
     * Deletes all trashed memos permanently.
     * @returns A promise that resolves when all trashed memos are deleted.
     */
    deleteAllTrashedMemos(): Promise<void>;
}
