"use client";

import type { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
import { IMemoService } from "@/interfaces/services/clientSide/IMemoService";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

/**
 * Service class for managing memos, encapsulating business logic.
 */
export class MemoService implements IMemoService {
    private repository: IMemoRepository;
    private static MAX_MEMO_CONTENT_LENGTH = 2000;
    private static MAX_TAG_LENGTH = 100;

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
        this.validateContent(content);
        this.validateTags(tags);
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
        if (updates.content !== undefined) {
            this.validateContent(updates.content);
        }
        if (updates.tags !== undefined) {
            this.validateTags(updates.tags);
        }
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
        memos.forEach((memo) => {
            this.validateContent(memo.content);
            this.validateTags(memo.tags);
        });
        return this.repository.addMultipleMemos(memos);
    }

    /**
     * Updates multiple memos.
     * @param memos An array of partial memos to update.
     */
    async updateMultipleMemos(memos: Partial<Memo>[]): Promise<void> {
        memos.forEach((memo) => {
            if (memo.content !== undefined) {
                this.validateContent(memo.content);
            }
            if (memo.tags !== undefined) {
                this.validateTags(memo.tags);
            }
        });
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

    /**
     * Validates the content of a memo.
     * @param content The content to validate.
     * @throws {Error} If the content exceeds the maximum length.
     */
    private validateContent(content: string): void {
        if (content.length > MemoService.MAX_MEMO_CONTENT_LENGTH) {
            throw new Error(
                `Content exceeds maximum length of ${MemoService.MAX_MEMO_CONTENT_LENGTH} characters.`
            );
        }
    }

    /**
     * Validates the tags of a memo.
     * @param tags The tags to validate.
     * @throws {Error} If any tag exceeds the maximum length.
     */
    private validateTags(tags: string[]): void {
        tags.forEach((tag) => {
            if (tag.length > MemoService.MAX_TAG_LENGTH) {
                throw new Error(
                    `Tag "${tag}" exceeds maximum length of ${MemoService.MAX_TAG_LENGTH} characters.`
                );
            }
        });
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
