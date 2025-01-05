"use client";

import type { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
import { IMemoService } from "@/interfaces/services/clientSide/IMemoService";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { toast } from "react-toastify";
import { CryptoUtils } from "@/utils/cryptoUtils";

/**
 * Service class for managing memos, encapsulating business logic.
 */
export class MemoService implements IMemoService {
    private repository: IMemoRepository;
    private static MAX_MEMO_CONTENT_LENGTH = 2000;
    private static MAX_TAG_LENGTH = 200;
    private encryptTags: boolean;

    /**
     * Initializes the MemoService with the given repository.
     * @param repository The memo repository instance.
     * @param encryptTags Whether to encrypt tags.
     */
    constructor(repository: IMemoRepository, encryptTags: boolean = false) {
        this.repository = repository;
        this.encryptTags = encryptTags;
    }

    /**
     * Creates a new memo.
     * @param content The content of the memo.
     * @param tags The tags associated with the memo.
     * @returns A promise that resolves to the newly created memo.
     * @throws Error if encryption fails or validation fails.
     */
    async createMemo(content: string, tags: string[] = []): Promise<Memo> {
        this.validateContent(content);
        this.validateTags(tags);
        const encryptedContent = await this.encryptContent(content);
        const encryptedTags = await this.encryptTagsData(tags);
        const newMemo: Memo = {
            id: generateUniqueId(),
            content: encryptedContent,
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
            tags: encryptedTags,
            deleted: false,
            deletedAt: new Date(0),
        };
        await this.repository.addMemo(newMemo);
        return {
            ...newMemo,
            content,
            tags,
        };
    }

    /**
     * Retrieves a memo by its ID with decrypted content and tags.
     * @param id The ID of the memo.
     * @returns A promise that resolves to the memo with decrypted content and tags, or undefined if not found.
     * @throws Error if decryption fails.
     */
    async getMemo(id: string): Promise<Memo | undefined> {
        const memo = await this.repository.getMemo(id);
        if (!memo) return memo;
        const decryptedContent = await this.decryptContent(memo.content);
        const decryptedTags = await this.decryptTagsData(memo.tags);
        return { ...memo, content: decryptedContent, tags: decryptedTags };
    }

    /**
     * Retrieves all encrypted memos without decrypting the content and tags.
     * @returns A promise that resolves to an array of encrypted memos.
     */
    async getEncryptedMemoList(): Promise<Memo[]> {
        return await this.repository.getAllMemos();
    }

    /**
     * Retrieves all non-deleted memos with decrypted content and tags.
     * @returns A promise that resolves to an array of memos with decrypted content and tags.
     * @throws Error if decryption fails.
     */
    async getAllMemos(): Promise<Memo[]> {
        const allMemos = await this.repository.getAllMemos();
        const decryptedMemos = await Promise.all(
            allMemos
                .filter((memo) => !memo.deleted)
                .map(async (memo) => ({
                    ...memo,
                    content: await this.decryptContent(memo.content),
                    tags: await this.decryptTagsData(memo.tags),
                }))
        );
        return decryptedMemos;
    }

    /**
     * Retrieves all trashed memos with decrypted content and tags.
     * @returns A promise that resolves to an array of trashed memos with decrypted content and tags.
     * @throws Error if decryption fails.
     */
    async getTrashedMemos(): Promise<Memo[]> {
        const trashedMemos = await this.repository.getTrashedMemos();
        const decryptedMemos = await Promise.all(
            trashedMemos.map(async (memo) => ({
                ...memo,
                content: await this.decryptContent(memo.content),
                tags: await this.decryptTagsData(memo.tags),
            }))
        );
        return decryptedMemos;
    }

    /**
     * Updates an existing memo.
     * @param id The ID of the memo.
     * @param updates The updates to apply (content and/or tags).
     * @returns A promise that resolves when the memo is updated.
     * @throws Error if encryption fails or validation fails.
     */
    async updateMemo(id: string, updates: Partial<Memo>): Promise<void> {
        if (updates.content !== undefined) {
            this.validateContent(updates.content);
            updates.content = await this.encryptContent(updates.content);
        }
        if (updates.tags !== undefined) {
            this.validateTags(updates.tags);
            updates.tags = await this.encryptTagsData(updates.tags);
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
     * Adds multiple memos with encrypted content and tags.
     * @param memos An array of memos to add.
     * @returns A promise that resolves to an array of keys of the added memos.
     * @throws Error if encryption fails or validation fails.
     */
    async addMultipleMemos(memos: Memo[]): Promise<IDBValidKey[]> {
        const encryptedMemos = await Promise.all(
            memos.map(async (memo) => {
                this.validateContent(memo.content);
                this.validateTags(memo.tags);
                const encryptedContent = await this.encryptContent(
                    memo.content
                );
                const encryptedTags = await this.encryptTagsData(memo.tags);
                return {
                    ...memo,
                    content: encryptedContent,
                    tags: encryptedTags,
                };
            })
        );
        return this.repository.addMultipleMemos(encryptedMemos);
    }

    /**
     * Updates multiple memos with encrypted content and tags.
     * @param memos An array of partial memos to update.
     * @returns A promise that resolves when all memos are updated.
     * @throws Error if encryption fails or validation fails.
     */
    async updateMultipleMemos(memos: Partial<Memo>[]): Promise<void> {
        const updatedMemos = await Promise.all(
            memos.map(async (memo) => {
                if (memo.content !== undefined) {
                    this.validateContent(memo.content);
                    memo.content = await this.encryptContent(memo.content);
                }
                if (memo.tags !== undefined) {
                    this.validateTags(memo.tags);
                    memo.tags = await this.encryptTagsData(memo.tags);
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
        try {
            await this.repository.deleteTrashedMemos(id);
            toast.success("Trashed memo deleted successfully!");
        } catch {
            toast.error("Failed to delete trashed memo.");
            throw new Error("Deleting trashed memo failed.");
        }
    }

    /**
     * Permanently deletes all trashed memos.
     * @returns A promise that resolves when all trashed memos are deleted.
     */
    async deleteAllTrashedMemos(): Promise<void> {
        try {
            await this.repository.deleteAllTrashedMemos();
            toast.success("All trashed memos have been deleted.");
        } catch {
            toast.error("Failed to delete all trashed memos.");
            throw new Error("Deleting all trashed memos failed.");
        }
    }

    /**
     * Clears all memos from the repository.
     * @returns A promise that resolves when all memos are deleted.
     */
    public async clearAllMemos(): Promise<void> {
        try {
            await this.repository.clearAllMemos(); // Assuming this deletes from both memolist and trashedMemoList
            toast.success("All memos have been cleared.");
        } catch {
            toast.error("Failed to clear all memos.");
            throw new Error("Clearing memos failed.");
        }
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
     * Encrypts the memo content.
     * @param content The plain text content to encrypt.
     * @returns A promise that resolves to the encrypted content as a Base64 string.
     * @throws Error if encryption fails.
     */
    private async encryptContent(content: string): Promise<string> {
        try {
            return await CryptoUtils.encrypt(content);
        } catch {
            toast.error("Failed to encrypt memo content.");
            throw new Error("Encryption failed.");
        }
    }

    /**
     * Decrypts the memo content.
     * @param encryptedContent The encrypted content as a Base64 string.
     * @returns A promise that resolves to the decrypted plain text.
     * @throws Error if decryption fails.
     */
    private async decryptContent(encryptedContent: string): Promise<string> {
        try {
            return await CryptoUtils.decrypt(encryptedContent);
        } catch {
            toast.error("Failed to decrypt memo content.");
            throw new Error("Decryption failed.");
        }
    }

    /**
     * Encrypts the memo tags if encryption is enabled.
     * @param tags The array of tags to encrypt.
     * @returns A promise that resolves to the encrypted tags array, or the original tags if encryption is disabled.
     * @throws Error if encryption fails.
     */
    private async encryptTagsData(tags: string[]): Promise<string[]> {
        if (!this.encryptTags) {
            return tags;
        }
        try {
            const encryptedTags = await Promise.all(
                tags.map((tag) => CryptoUtils.encrypt(tag))
            );
            return encryptedTags;
        } catch {
            toast.error("Failed to encrypt memo tags.");
            throw new Error("Tags encryption failed.");
        }
    }

    /**
     * Decrypts the memo tags if encryption is enabled.
     * @param encryptedTags The array of encrypted tags as Base64 strings.
     * @returns A promise that resolves to the decrypted tags array, or the original tags if encryption is disabled.
     * @throws Error if decryption fails.
     */
    private async decryptTagsData(encryptedTags: string[]): Promise<string[]> {
        if (!this.encryptTags) {
            return encryptedTags;
        }
        try {
            const decryptedTags = await Promise.all(
                encryptedTags.map((tag, index) => {
                    // if you don't use "index", the order of elements may change and that may be considered as inconsistent of the data by CryptoUtil module.
                    try {
                        return CryptoUtils.decrypt(tag);
                    } catch (error) {
                        console.error(
                            `Failed to decrypt tag at index ${index}: ${tag}`,
                            error
                        );
                        toast.error(`Failed to decrypt tag at index ${index}.`);
                        throw new Error(
                            `Tag decryption failed for tag at index ${index}.`
                        );
                    }
                })
            );
            return decryptedTags;
        } catch {
            toast.error("Failed to decrypt memo tags.");
            throw new Error("Tags decryption failed.");
        }
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
