"use client";

import type { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
import { IMemoService } from "@/interfaces/services/clientSide/IMemoService";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

/**
 * Service class for managing memos, encapsulating business logic.
 */
export class MemoService implements IMemoService {
    private repository: IMemoRepository;

    /**
     * Initializes the MemoService with the given repository.
     * @param repository The memo repository instance.
     */
    constructor(repository: IMemoRepository) {
        this.repository = repository;
    }

    /**
     * Creates a new memo.
     * @param content The content of the memo.
     * @param tags The tags associated with the memo.
     * @returns A promise that resolves to the newly created memo.
     */
    async createMemo(content: string, tags: string[] = []): Promise<Memo> {
        const newMemo: Memo = {
            id: generateUniqueId(),
            content,
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
            tags,
            deleted: false,
            deletedAt: new Date(0),
        };
        await this.repository.addMemo(newMemo);
        return newMemo;
    }

    /**
     * Retrieves a memo by its ID.
     * @param id The ID of the memo.
     * @returns The memo, or undefined if not found.
     */
    async getMemo(id: string): Promise<Memo | undefined> {
        return this.repository.getMemo(id);
    }

    /**
     * Retrieves all non-deleted memos.
     * @returns An array of memos.
     */
    async getAllMemos(): Promise<Memo[]> {
        const allMemos = await this.repository.getAllMemos();
        return allMemos.filter((memo) => !memo.deleted);
    }

    /**
     * Updates an existing memo.
     * @param id The ID of the memo.
     * @param updates The updates to apply.
     */
    async updateMemo(id: string, updates: Partial<Memo>): Promise<void> {
        await this.repository.updateMemo(id, updates);
    }

    /**
     * Soft deletes a memo.
     * @param id The ID of the memo.
     */
    async deleteMemo(id: string): Promise<void> {
        await this.repository.deleteMemo(id);
    }

    /**
     * Adds multiple memos.
     * @param memos An array of memos to add.
     * @returns A promise that resolves to an array of keys of the added memos.
     */
    async addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]> {
        return this.repository.addMultipleMemos(memos);
    }

    /**
     * Updates multiple memos.
     * @param memos An array of partial memos to update.
     */
    async updateMultipleMemos(memos: Partial<Memo>[]): Promise<void> {
        await this.repository.updateMultipleMemos(memos);
    }

    /**
     * Deletes multiple memos.
     * @param ids An array of memo IDs to delete.
     */
    async deleteMultipleMemos(ids: string[]): Promise<void> {
        await this.repository.deleteMultipleMemos(ids);
    }

    /**
     * Counts the number of memos.
     * @returns The count of memos.
     */
    async countMemos(): Promise<number> {
        return this.repository.countMemos();
    }

    /**
     * Retrieves all trashed memos.
     * @returns An array of trashed memos.
     */
    async getTrashedMemos(): Promise<Memo[]> {
        return this.repository.getTrashedMemos();
    }

    /**
     * Restores a trashed memo.
     * @param id The ID of the memo to restore.
     */
    async restoreMemo(id: string): Promise<void> {
        await this.repository.restoreMemo(id);
    }

    /**
     * Deletes a trashed memo permanently.
     * @param id The ID of the trashed memo to delete.
     */
    async deleteTrashedMemo(id: string): Promise<void> {
        await this.repository.deleteTrashedMemos(id);
    }

    /**
     * Deletes all trashed memos permanently.
     */
    async deleteAllTrashedMemos(): Promise<void> {
        await this.repository.deleteAllTrashedMemos();
    }
}

/**
 * Generates a unique ID for a memo.
 * @returns A unique string ID.
 */
function generateUniqueId(): string {
    // Replace this with a robust unique ID generator as needed
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
