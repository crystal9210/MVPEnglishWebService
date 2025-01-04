"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { MemoService } from "@/domain/services/clientSide/memoService";
import { MemoRepository } from "@/domain/repositories/idb/memoRepository";
import { IndexedDBManager } from "@/idb/index";
import { IMemoService } from "@/interfaces/services/clientSide/IMemoService";
import { toast } from "react-toastify";
import {
    EncryptionOptions,
    DEFAULT_ENCRYPTION_OPTIONS,
} from "@/constants/cryptoTypes";

/**
 * Interface defining the shape of the Memo context.
 */
interface MemoContextProps {
    memoList: Memo[];
    trashedMemoList: Memo[];
    addMemo: (content: string, tags: string[]) => Promise<void>;
    editMemo: (
        id: string,
        updates: { content: string; tags: string[] }
    ) => Promise<void>;
    deleteMemo: (id: string) => Promise<void>;
    restoreMemo: (id: string) => Promise<void>;
    deleteTrashedMemo: (id: string) => Promise<void>;
    deleteAllTrashedMemos: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    clearAllMemos: () => Promise<void>;
    getEncryptedMemoList: () => Promise<Memo[]>;
    getAllMemos: () => Promise<Memo[]>;
    memoService: IMemoService | null;
}

/**
 * Create Context with default value null.
 */
const MemoContext = createContext<MemoContextProps | null>(null);

/**
 * MemoProvider component provides the state and operations of memos throughout the application.
 * @param children Child components
 * @returns MemoContext.Provider
 */
export const MemoProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [memoService, setMemoService] = useState<IMemoService | null>(null);
    const [memoList, setMemoList] = useState<Memo[]>([]);
    const [trashedMemoList, setTrashedMemoList] = useState<Memo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // 初期化時はローディング状態
    const [error, setError] = useState<string | null>(null);

    /**
     * Initializes the encryption strategy with the provided options.
     * @param options EncryptionOptions including algorithm and passphrase
     */
    const initializeEncryption = async (options: EncryptionOptions) => {
        setIsLoading(true);
        try {
            // Initialize IndexedDBManager and MemoRepository
            const idbManager = IndexedDBManager.getInstance();
            const memoRepository = new MemoRepository(idbManager);

            // Create MemoService instance using the factory method
            const service = await MemoService.create(memoRepository, options);
            setMemoService(service);
            toast.success("Encryption initialized successfully!");

            // Load memos after initialization
            await loadMemos(service);
        } catch (err) {
            setError("Failed to initialize encryption.");
            console.error(err);
            toast.error("Failed to initialize encryption.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Loads all memos (active and trashed) from the repository.
     * @param service The initialized MemoService instance.
     */
    const loadMemos = async (service: IMemoService) => {
        setIsLoading(true);
        try {
            console.log("Fetching all memos and trashed memos...");
            const [activeMemos, trashedMemos] = await Promise.all([
                service.getAllMemos(),
                service.getTrashedMemos(),
            ]);
            console.log("Fetched active memos:", activeMemos);
            console.log("Fetched trashed memos:", trashedMemos);
            setMemoList(activeMemos);
            setTrashedMemoList(trashedMemos);
        } catch (err) {
            setError("Failed to load memos.");
            console.error("Error in loadMemos:", err);
            toast.error("Failed to load memos.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Effect to auto-initialize encryption with default options on mount.
     */
    useEffect(() => {
        const initializeEncryption = async (options: EncryptionOptions) => {
            setIsLoading(true);
            try {
                // Initialize IndexedDBManager and MemoRepository
                const idbManager = IndexedDBManager.getInstance();
                const memoRepository = new MemoRepository(idbManager);

                // Create MemoService instance using the factory method
                const service = await MemoService.create(
                    memoRepository,
                    options
                );
                setMemoService(service);
                toast.success("Encryption initialized successfully!");

                // Load memos after initialization
                await loadMemos(service);
            } catch (err) {
                setError("Failed to initialize encryption.");
                console.error(err);
                toast.error("Failed to initialize encryption.");
            } finally {
                setIsLoading(false);
            }
        };

        const autoInitialize = async () => {
            try {
                await initializeEncryption(DEFAULT_ENCRYPTION_OPTIONS);
            } catch (err) {
                console.error("Auto initialization failed:", err);
            }
        };
        autoInitialize();
    }, []);

    /**
     * Adds a new memo.
     * @param content The content of the memo
     * @param tags Tags associated with the memo
     */
    const addMemo = async (content: string, tags: string[]) => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            const newMemo = await memoService.createMemo(content, tags);
            setMemoList((prev) => [...prev, newMemo]);
            toast.success("Memo added successfully!");
        } catch (err) {
            setError("Failed to add memo.");
            console.error(err);
            toast.error("Failed to add memo.");
        }
    };

    /**
     * Edits an existing memo.
     * @param id The ID of the memo
     * @param updates The updates (content and tags)
     */
    const editMemo = async (
        id: string,
        updates: { content: string; tags: string[] }
    ) => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            await memoService.updateMemo(id, updates);
            setMemoList((prev) =>
                prev.map((memo) =>
                    memo.id === id
                        ? {
                              ...memo,
                              content: updates.content, // Already decrypted
                              tags: updates.tags,
                              lastUpdatedAt: new Date(),
                          }
                        : memo
                )
            );
            toast.success("Memo updated successfully!");
        } catch (err) {
            setError("Failed to edit memo.");
            console.error(err);
            toast.error("Failed to edit memo.");
        }
    };

    /**
     * Deletes a memo.
     * @param id The ID of the memo
     */
    const deleteMemo = async (id: string) => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            await memoService.deleteMemo(id);
            setMemoList((prev) => prev.filter((memo) => memo.id !== id));
            // Fetch and update trashed memos
            const trashedMemos = await memoService.getTrashedMemos();
            setTrashedMemoList(trashedMemos);
            toast.info(
                "Memo deleted. It will be permanently deleted in 3 days."
            );
        } catch (err) {
            setError("Failed to delete memo.");
            console.error(err);
            toast.error("Failed to delete memo.");
        }
    };

    /**
     * Restores a trashed memo.
     * @param id The ID of the memo
     */
    const restoreMemo = async (id: string) => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            await memoService.restoreMemo(id);
            // Fetch and update trashed memos
            const trashedMemos = await memoService.getTrashedMemos();
            setTrashedMemoList(trashedMemos);
            // Fetch and update active memos
            const activeMemos = await memoService.getAllMemos();
            setMemoList(activeMemos);
            toast.success("Memo restored successfully!");
        } catch (err) {
            setError("Failed to restore memo.");
            console.error(err);
            toast.error("Failed to restore memo.");
        }
    };

    /**
     * Permanently deletes a trashed memo.
     * @param id The ID of the memo
     */
    const deleteTrashedMemo = async (id: string) => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            await memoService.deleteTrashedMemo(id);
            // Fetch and update trashed memos
            const trashedMemos = await memoService.getTrashedMemos();
            setTrashedMemoList(trashedMemos);
            toast.success("Trashed memo deleted successfully!");
        } catch (err) {
            setError("Failed to delete trashed memo.");
            console.error(err);
            toast.error("Failed to delete trashed memo.");
        }
    };

    /**
     * Permanently deletes all trashed memos.
     */
    const deleteAllTrashedMemos = async () => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            await memoService.deleteAllTrashedMemos();
            setTrashedMemoList([]);
            toast.success("All trashed memos deleted successfully!");
        } catch (err) {
            setError("Failed to delete all trashed memos.");
            console.error(err);
            toast.error("Failed to delete all trashed memos.");
        }
    };

    /**
     * Clears all memos from the repository.
     * @returns A promise that resolves when all memos are deleted.
     */
    const clearAllMemos = async () => {
        if (!memoService) {
            setError("MemoService not initialized.");
            toast.error("MemoService not initialized.");
            return;
        }
        try {
            await memoService.clearAllMemos();
            setMemoList([]);
            setTrashedMemoList([]);
            toast.success("全てのメモが削除されました。");
        } catch (err) {
            setError("Failed to clear all memos.");
            console.error(err);
            toast.error("メモの削除に失敗しました。");
        }
    };

    /**
     * Retrieves the list of encrypted memos.
     * @returns A promise that resolves to an array of encrypted memos.
     */
    const getEncryptedMemoList = async (): Promise<Memo[]> => {
        if (!memoService) {
            throw new Error("MemoService not initialized.");
        }
        try {
            const memos = await memoService.getEncryptedMemoList();
            return memos;
        } catch (err) {
            setError("Failed to retrieve encrypted memos.");
            console.error(err);
            toast.error("Failed to retrieve encrypted memos.");
            return [];
        }
    };

    /**
     * Retrieves the list of decrypted memos.
     * @returns A promise that resolves to an array of decrypted memos.
     */
    const getAllMemos = async (): Promise<Memo[]> => {
        if (!memoService) {
            throw new Error("MemoService not initialized.");
        }
        try {
            const memos = await memoService.getAllMemos();
            return memos;
        } catch (err) {
            setError("Failed to retrieve decrypted memos.");
            console.error(err);
            toast.error("Failed to retrieve decrypted memos.");
            return [];
        }
    };

    return (
        <MemoContext.Provider
            value={{
                memoList,
                trashedMemoList,
                addMemo,
                editMemo,
                deleteMemo,
                restoreMemo,
                deleteTrashedMemo,
                deleteAllTrashedMemos,
                isLoading,
                error,
                clearAllMemos,
                getEncryptedMemoList,
                getAllMemos,
                memoService,
            }}
        >
            {isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                    {/* ローディング用のスピナーのスタイル */}
                    <style jsx>{`
                        .loader {
                            border-top-color: #3498db;
                            animation: spin 1s ease-in-out infinite;
                        }

                        @keyframes spin {
                            to {
                                transform: rotate(360deg);
                            }
                        }
                    `}</style>
                </div>
            ) : (
                children
            )}
            {/* エラーメッセージを表示 */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded">
                    {error}
                </div>
            )}
        </MemoContext.Provider>
    );
};

/**
 * Custom hook to use the MemoContext.
 * @returns The MemoContextProps object.
 * @throws Error if used outside of a MemoProvider.
 */
export const useMemoContext = (): MemoContextProps => {
    const context = useContext(MemoContext);
    if (!context) {
        throw new Error("useMemoContext must be used within a MemoProvider");
    }
    return context;
};
