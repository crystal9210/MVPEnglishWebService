/* eslint-disable no-unused-vars */
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

/**
 * Interface for MemoRepository, managing CRUD operations and advanced queries for memos.
 */
export interface IMemoRepository {
    /**
     * Adds a new memo to the repository.
     * @param memo The memo object to add.
     * @returns A promise that resolves when the operation is complete.
     */
    addMemo(memo: Memo): Promise<void>;

    /**
     * Retrieves a memo by its ID.
     * @param id The ID of the memo to retrieve.
     * @returns A promise that resolves to the memo, or undefined if not found.
     */
    getMemo(id: string): Promise<Memo | undefined>;

    /**
     * Retrieves all memos from the repository.
     * @returns A promise that resolves to an array of all memos.
     */
    getAllMemos(): Promise<Memo[]>;

    /**
     * Updates an existing memo by its ID.
     * @param id The ID of the memo to update.
     * @param memo Partial updates to apply to the memo.
     * @returns A promise that resolves when the operation is complete.
     * @throws {Error} If the memo does not exist.
     */
    updateMemo(id: string, memo: Partial<Memo>): Promise<void>;

    /**
     * Deletes a memo by its ID.
     * @param id The ID of the memo to delete.
     * @returns A promise that resolves when the operation is complete.
     * @throws {Error} If the memo does not exist.
     */
    deleteMemo(id: string): Promise<void>;

    /**
     * Retrieves memos containing the specified keyword in their content.
     * @param keyword The keyword to search for.
     * @returns A promise that resolves to an array of matching memos.
     */
    getMemosByKeyword(keyword: string): Promise<Memo[]>;

    /**
     * Retrieves memos created within a specific date range.
     * @param startDate The start of the date range.
     * @param endDate The end of the date range.
     * @returns A promise that resolves to an array of memos in the date range.
     */
    getMemosByDateRange(startDate: Date, endDate: Date): Promise<Memo[]>;

    /**
     * Adds multiple memos to the repository in a single operation.
     * @param memos An array of memo objects to add.
     * @returns A promise that resolves to an array of IDs of the added memos.
     */
    addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]>;

    /**
     * Updates multiple memos in the repository in a single operation.
     * @param memos An array of partial memo objects to update.
     * @returns A promise that resolves when all updates are complete.
     */
    updateMultipleMemos(memos: Partial<Memo>[]): Promise<void>;

    /**
     * Deletes multiple memos from the repository in a single operation.
     * @param ids An array of memo IDs to delete.
     * @returns A promise that resolves when all deletions are complete.
     */
    deleteMultipleMemos(ids: string[]): Promise<void>;

    /**
     * Counts the total number of memos in the repository.
     * @returns A promise that resolves to the total count of memos.
     */
    countMemos(): Promise<number>;
}
