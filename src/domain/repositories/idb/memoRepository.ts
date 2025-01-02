"use client";

import { GenericRepository } from "./genericRepository";
import type { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { MyIDB } from "@/constants/clientSide/idb/idbGenerator";
import { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";

export class MemoRepository implements IMemoRepository {
    private memoListRepository: GenericRepository<"memoList", Memo>;
    private trashedMemoListRepository: GenericRepository<
        "trashedMemoList",
        Memo
    >;
    private idbManager: IIndexedDBManager;

    constructor(idbManager: IIndexedDBManager) {
        this.idbManager = idbManager;
        this.memoListRepository = new GenericRepository<"memoList", Memo>(
            idbManager,
            "memoList"
        );
        this.trashedMemoListRepository = new GenericRepository<
            "trashedMemoList",
            Memo
        >(idbManager, "trashedMemoList");
    }

    /**
     * Adds a new memo to the repository.
     * @param memo The memo object to add.
     */
    async addMemo(memo: Memo): Promise<void> {
        await this.memoListRepository.add(memo);
    }

    /**
     * Retrieves a memo by its ID.
     * @param id The ID of the memo to retrieve.
     * @returns The memo object or undefined if not found.
     */
    async getMemo(id: string): Promise<Memo | undefined> {
        return this.memoListRepository.get(id);
    }

    /**
     * Retrieves all memos from the repository.
     * @returns An array of all memos.
     */
    async getAllMemos(): Promise<Memo[]> {
        return this.memoListRepository.getAll();
    }

    /**
     * Updates an existing memo by its ID.
     * @param id The ID of the memo to update.
     * @param updates Partial updates to apply to the memo.
     * @throws {Error} If the memo does not exist.
     */
    async updateMemo(id: string, updates: Partial<Memo>): Promise<void> {
        const existingMemo = await this.getMemo(id);
        if (!existingMemo) {
            throw new Error(`Memo with ID ${id} not found.`);
        }
        const updatedMemo: Memo = {
            ...existingMemo,
            ...updates,
            lastUpdatedAt: new Date(),
        };
        await this.memoListRepository.update(updatedMemo, id);
    }

    /**
     * Deletes a memo by its ID (soft delete by moving to trashedMemoList).
     * @param id The ID of the memo to delete.
     * @throws {Error} If the memo does not exist.
     */
    async deleteMemo(id: string): Promise<void> {
        const existingMemo = await this.getMemo(id);
        if (!existingMemo) {
            throw new Error(`Memo with ID ${id} not found.`);
        }
        this.memoListRepository.delete(id);

        // Add to trashedMemoList
        const trashedMemo: Memo = {
            ...existingMemo,
            deleted: true,
            deletedAt: new Date(),
            lastUpdatedAt: new Date(),
        };
        await this.trashedMemoListRepository.add(trashedMemo, id);
    }

    /**
     * Retrieves memos containing the specified keyword in their content.
     * @param keyword The keyword to search for.
     * @returns An array of matching memos.
     */
    async getMemosByKeyword(keyword: string): Promise<Memo[]> {
        const allMemos = await this.getAllMemos();
        return allMemos.filter((memo) => memo.content.includes(keyword));
    }

    /**
     * Retrieves memos created within a specific date range.
     * @param startDate The start of the date range.
     * @param endDate The end of the date range.
     * @returns An array of memos in the date range.
     */
    async getMemosByDateRange(startDate: Date, endDate: Date): Promise<Memo[]> {
        const allMemos = await this.getAllMemos();
        return allMemos.filter((memo) => {
            const memoDate = new Date(memo.createdAt);
            return memoDate >= startDate && memoDate <= endDate;
        });
    }

    /**
     * Adds multiple memos to the repository in a single transaction.
     * @param memos An array of memo objects to add.
     * @returns An array of IDs of the added memos.
     * @throws {Error} If any memo already exists.
     */
    async addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]> {
        return this.idbManager.performTransaction(
            ["memoList"],
            "readwrite",
            async (tx) => {
                const store = tx.objectStore("memoList");
                const results: IDBValidKey[] = [];
                for (const memo of memos) {
                    const existingMemo = await (
                        store.get as (
                            key: IDBValidKey
                        ) => Promise<Memo | undefined>
                    )(memo.id as MyIDB["memoList"]["key"]);
                    if (existingMemo) {
                        throw new Error(
                            `Memo with ID ${memo.id} already exists.`
                        );
                    }
                    const result = await this.memoListRepository.add(memo);
                    results.push(result);
                }
                return results;
            }
        );
    }

    /**
     * Updates multiple memos in the repository in a single transaction.
     * @param memos An array of partial memo objects to update.
     * @throws {Error} If any memo does not exist or lacks an ID.
     */
    async updateMultipleMemos(memos: Partial<Memo>[]): Promise<void> {
        return this.idbManager.performTransaction(
            ["memoList"],
            "readwrite",
            async (tx) => {
                const store = tx.objectStore("memoList");
                for (const memo of memos) {
                    if (!memo.id) {
                        throw new Error("Memo ID is required for update.");
                    }
                    const existingMemo = await (
                        store.get as (
                            key: IDBValidKey
                        ) => Promise<Memo | undefined>
                    )(memo.id as MyIDB["memoList"]["key"]);
                    if (!existingMemo) {
                        throw new Error(`Memo with ID ${memo.id} not found.`);
                    }
                    const updatedMemo: Memo = {
                        ...existingMemo,
                        ...memo,
                        lastUpdatedAt: new Date(),
                    };
                    await this.memoListRepository.update(updatedMemo, memo.id);
                }
            }
        );
    }

    /**
     * Deletes multiple memos from the repository in a single transaction.
     * @param ids An array of memo IDs to delete.
     * @throws {Error} If any memo does not exist.
     */
    async deleteMultipleMemos(ids: string[]): Promise<void> {
        return this.idbManager.performTransaction(
            ["memoList", "trashedMemoList"],
            "readwrite",
            async (tx) => {
                const memoListStore = tx.objectStore("memoList");
                for (const id of ids) {
                    const existingMemo = await (
                        memoListStore.get as (
                            key: IDBValidKey
                        ) => Promise<Memo | undefined>
                    )(id as MyIDB["memoList"]["key"]);
                    if (!existingMemo) {
                        throw new Error(`Memo with ID ${id} not found.`);
                    }
                    // Delete from memoList
                    await (
                        memoListStore.delete as (
                            key: IDBValidKey | IDBKeyRange
                        ) => Promise<void>
                    )(id as MyIDB["memoList"]["key"]);

                    // Add to trashedMemoList
                    const trashedMemo: Memo = {
                        ...existingMemo,
                        deleted: true,
                        deletedAt: new Date(),
                        lastUpdatedAt: new Date(),
                    };
                    await this.trashedMemoListRepository.update(
                        trashedMemo,
                        id as MyIDB["trashedMemoList"]["key"]
                    );
                }
            }
        );
    }

    /**
     * Counts the total number of memos in the repository.
     * @returns The total count of memos.
     */
    async countMemos(): Promise<number> {
        return this.idbManager.count("memoList");
    }

    /**
     * Retrieves all trashed memos.
     * @returns An array of trashed memos.
     */
    async getTrashedMemos(): Promise<Memo[]> {
        return this.idbManager.getAll("trashedMemoList");
    }

    /**
     * Restores a trashed memo by its ID.
     * @param id The ID of the memo to restore.
     * @throws {Error} If the memo does not exist in trashed memos.
     */
    async restoreMemo(id: string): Promise<void> {
        const memo = await this.trashedMemoListRepository.get(id);
        if (!memo) {
            throw new Error(`Memo with ID ${id} not found in trashed memos.`);
        }
        // Delete from trashedMemoList
        this.trashedMemoListRepository.delete(id);

        // Add back to memoList
        const restoredMemo: Memo = {
            ...memo,
            deleted: false,
            deletedAt: new Date(0), // >> use epoch to represent 'null'
            lastUpdatedAt: new Date(),
        };
        this.memoListRepository.add(restoredMemo);
    }

    /**
     * Deletes a trashed memo by its ID.
     * @param id The ID of the trashed memo to delete.
     * @throws {Error} If the memo does not exist in trashed memos.
     */
    async deleteTrashedMemos(id: string): Promise<void> {
        await this.trashedMemoListRepository.delete(id);
    }

    /**
     * Deletes all trashed memos from the repository.
     */
    async deleteAllTrashedMemos(): Promise<void> {
        const trashedMemos = await this.getTrashedMemos();
        const ids = trashedMemos.map((memo) => memo.id);
        if (ids.length > 0) {
            await this.idbManager.deleteMultiple("trashedMemoList", ids);
        }
    }

    /**
     * Clears all memos from the repository.
     * @returns A promise that resolves when all memos are deleted.
     */
    public async clearAllMemos(): Promise<void> {
        await this.idbManager.clearStore("memoList");
    }
}
