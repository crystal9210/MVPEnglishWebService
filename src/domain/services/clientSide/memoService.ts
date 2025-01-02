"use client";

import type { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
import { IMemoService } from "@/interfaces/services/clientSide/IMemoService";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { decryptData } from "@/utils/crypto";
import { IEncryptionStrategy } from "@/utils/crypto/crypto";
import { EncryptionOptions } from "@/constants/cryptoTypes";
import { EncryptionFactory } from "@/utils/crypto/cryptoFactory";
import { toast } from "react-toastify";

/**
 * Service class for managing memos, encapsulating business logic.
 */
export class MemoService implements IMemoService {
    private repository: IMemoRepository;
    private static MAX_MEMO_CONTENT_LENGTH = 2000;
    private static MAX_TAG_LENGTH = 100;
    private encryptionStrategy: IEncryptionStrategy;

    /**
     * Initializes the MemoService with the given repository and encryption strategy.
     * @param repository The memo repository instance.
     * @param encryptionStrategy The encryption strategy instance.
     */
    constructor(
        repository: IMemoRepository,
        encryptionStrategy: IEncryptionStrategy
    ) {
        this.repository = repository;
        this.encryptionStrategy = encryptionStrategy;
    }

    /**
     * Asynchronously creates an instance of MemoService with initialized encryption.
     * @param repository The memo repository instance.
     * @param options EncryptionOptions including algorithm and passphrase.
     * @returns A promise that resolves to an instance of MemoService.
     */
    static async create(
        repository: IMemoRepository,
        options: EncryptionOptions
    ): Promise<MemoService> {
        const encryptionStrategy = await EncryptionFactory.createStrategy(
            options
        );
        return new MemoService(repository, encryptionStrategy);
    }

    /**
     * Creates a new memo.
     * @param content The content of the memo.
     * @param tags The tags associated with the memo.
     * @returns A promise that resolves to the newly created memo.
     * @throws Error if encryption is not initialized or validation fails.
     */
    async createMemo(content: string, tags: string[] = []): Promise<Memo> {
        this.validateContent(content);
        this.validateTags(tags);
        if (!this.encryptionStrategy) {
            throw new Error("Encryption not initialized.");
        }
        const encryptedContent = await this.encryptionStrategy.encrypt(content);
        const newMemo: Memo = {
            id: generateUniqueId(),
            content: encryptedContent,
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
     * Retrieves a memo by its ID with decrypted content.
     * @param id The ID of the memo.
     * @returns A promise that resolves to the memo with decrypted content, or undefined if not found.
     * @throws Error if encryption is not initialized.
     */
    async getMemo(id: string): Promise<Memo | undefined> {
        const memo = await this.repository.getMemo(id);
        if (!memo) return memo;
        if (!this.encryptionStrategy) {
            throw new Error("Encryption not initialized.");
        }
        const decryptedContent = await decryptData(
            memo.content,
            this.encryptionStrategy
        );
        return { ...memo, content: decryptedContent };
    }

    /**
     * Retrieves all encrypted memos without decrypting the content.
     * @returns A promise that resolves to an array of encrypted memos.
     */
    async getEncryptedMemoList(): Promise<Memo[]> {
        return await this.repository.getAllMemos();
    }

    /**
     * Retrieves all non-deleted memos with decrypted content.
     * @returns A promise that resolves to an array of memos with decrypted content.
     * @throws Error if encryption is not initialized.
     */
    async getAllMemos(): Promise<Memo[]> {
        const allMemos = await this.repository.getAllMemos();
        if (!this.encryptionStrategy) {
            throw new Error("Encryption not initialized.");
        }
        const decryptedMemos = await Promise.all(
            allMemos
                .filter((memo) => !memo.deleted)
                .map(async (memo) => ({
                    ...memo,
                    content: await decryptData(
                        memo.content,
                        this.encryptionStrategy
                    ),
                }))
        );
        return decryptedMemos;
    }

    /**
     * Retrieves all trashed memos with decrypted content.
     * @returns A promise that resolves to an array of trashed memos with decrypted content.
     * @throws Error if encryption is not initialized.
     */
    async getTrashedMemos(): Promise<Memo[]> {
        const trashedMemos = await this.repository.getTrashedMemos();
        if (!this.encryptionStrategy) {
            throw new Error("Encryption not initialized.");
        }
        const decryptedMemos = await Promise.all(
            trashedMemos.map(async (memo) => ({
                ...memo,
                content: await decryptData(
                    memo.content,
                    this.encryptionStrategy
                ),
            }))
        );
        return decryptedMemos;
    }

    /**
     * Updates an existing memo.
     * @param id The ID of the memo.
     * @param updates The updates to apply (content and/or tags).
     * @returns A promise that resolves when the memo is updated.
     * @throws Error if encryption is not initialized or validation fails.
     */
    async updateMemo(id: string, updates: Partial<Memo>): Promise<void> {
        if (updates.content !== undefined) {
            this.validateContent(updates.content);
            if (!this.encryptionStrategy) {
                throw new Error("Encryption not initialized.");
            }
            updates.content = await this.encryptionStrategy.encrypt(
                updates.content
            );
        }
        if (updates.tags !== undefined) {
            this.validateTags(updates.tags);
        }
        await this.repository.updateMemo(id, updates);
    }

    /**
     * Soft deletes a memo by marking it as deleted.
     * @param id The ID of the memo.
     * @returns A promise that resolves when the memo is soft deleted.
     */
    async deleteMemo(id: string): Promise<void> {
        await this.repository.deleteMemo(id);
    }

    /**
     * Adds multiple memos with encrypted content.
     * @param memos An array of memos to add.
     * @returns A promise that resolves to an array of keys of the added memos.
     * @throws Error if encryption is not initialized or validation fails.
     */
    async addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]> {
        if (!this.encryptionStrategy) {
            throw new Error("Encryption not initialized.");
        }
        const encryptedMemos = await Promise.all(
            memos.map(async (memo) => {
                this.validateContent(memo.content);
                this.validateTags(memo.tags);
                const encryptedContent = await this.encryptionStrategy.encrypt(
                    memo.content
                );
                return { ...memo, content: encryptedContent };
            })
        );
        return this.repository.addMultipleMemos(encryptedMemos);
    }

    /**
     * Updates multiple memos with encrypted content.
     * @param memos An array of partial memos to update.
     * @returns A promise that resolves when all memos are updated.
     * @throws Error if encryption is not initialized or validation fails.
     */
    async updateMultipleMemos(memos: Partial<Memo>[]): Promise<void> {
        if (!this.encryptionStrategy) {
            throw new Error("Encryption not initialized.");
        }
        const updatedMemos = await Promise.all(
            memos.map(async (memo) => {
                if (memo.content !== undefined) {
                    this.validateContent(memo.content);
                    memo.content = await this.encryptionStrategy.encrypt(
                        memo.content
                    );
                }
                if (memo.tags !== undefined) {
                    this.validateTags(memo.tags);
                }
                return memo;
            })
        );
        await this.repository.updateMultipleMemos(updatedMemos);
    }

    /**
     * Deletes multiple memos.
     * @param ids An array of memo IDs to delete.
     * @returns A promise that resolves when all memos are deleted.
     */
    async deleteMultipleMemos(ids: string[]): Promise<void> {
        await this.repository.deleteMultipleMemos(ids);
    }

    /**
     * Counts the number of memos.
     * @returns A promise that resolves to the count of memos.
     */
    async countMemos(): Promise<number> {
        return this.repository.countMemos();
    }

    /**
     * Restores a trashed memo by marking it as not deleted.
     * @param id The ID of the memo to restore.
     * @returns A promise that resolves when the memo is restored.
     */
    async restoreMemo(id: string): Promise<void> {
        await this.repository.restoreMemo(id);
    }

    /**
     * Permanently deletes a trashed memo.
     * @param id The ID of the trashed memo to delete.
     * @returns A promise that resolves when the trashed memo is deleted.
     */
    async deleteTrashedMemo(id: string): Promise<void> {
        await this.repository.deleteTrashedMemos(id);
    }

    /**
     * Permanently deletes all trashed memos.
     * @returns A promise that resolves when all trashed memos are deleted.
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

    /**
     * Clears all memos from the repository.
     * @returns A promise that resolves when all memos are deleted.
     */
    public async clearAllMemos(): Promise<void> {
        await this.repository.clearAllMemos();
        this.repository.clearAllMemos(); // 必要に応じてキャッシュをクリア
        toast.success("All memos have been cleared.");
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
