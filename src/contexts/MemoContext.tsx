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

// Context type definition
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
}

// Set default value to null
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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize dependencies asynchronously
    useEffect(() => {
        const initialize = async () => {
            try {
                // Create an instance of IndexedDBManager
                const idbManager = new IndexedDBManager();
                const memoRepository = new MemoRepository(idbManager);
                const service = new MemoService(memoRepository);
                setMemoService(service);
            } catch (err) {
                setError("Failed to initialize MemoService.");
                console.error(err);
            }
        };

        // Execute only in the browser by adding a condition
        if (typeof window !== "undefined") {
            initialize();
        }
    }, []);

    // Initialization: Load all memos
    useEffect(() => {
        if (!memoService) return;

        const loadMemos = async () => {
            try {
                const [activeMemos, trashedMemos] = await Promise.all([
                    memoService.getAllMemos(),
                    memoService.getTrashedMemos(),
                ]);
                setMemoList(activeMemos);
                setTrashedMemoList(trashedMemos);
            } catch (err) {
                setError("Failed to load memos.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadMemos();
    }, [memoService]);

    /**
     * Retrieves all memos (decrypted).
     * @returns An array of memo list.
     */
    const getAllMemos = async (): Promise<Memo[]> => {
        if (!memoService) return [];
        try {
            const memoList = await memoService.getAllMemos();
            return memoList;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // const getEncryptedMemoList = async (): Promise<Memo[]> => {
    //     if (!memoService) return [];
    //     try {
    //         const memoList = await memoService.geten
    //     }
    // }

    /**
     * Adds a new memo.
     * @param content The content of the memo
     * @param tags Tags associated with the memo
     */
    const addMemo = async (content: string, tags: string[]) => {
        if (!memoService) return;
        try {
            const newMemo = await memoService.createMemo(content, tags);
            setMemoList((prev) => [...prev, newMemo]);
            toast.success("Memo added successfully!");
        } catch (err) {
            setError("Failed to add memo.");
            console.error(err);
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
        if (!memoService) return;
        try {
            await memoService.updateMemo(id, updates);
            setMemoList((prev) =>
                prev.map((memo) =>
                    memo.id === id
                        ? {
                              ...memo,
                              content: updates.content,
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
        }
    };

    /**
     * Deletes a memo.
     * @param id The ID of the memo
     */
    const deleteMemo = async (id: string) => {
        if (!memoService) return;
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
        }
    };

    /**
     * Restores a trashed memo.
     * @param id The ID of the memo
     */
    const restoreMemo = async (id: string) => {
        if (!memoService) return;
        try {
            await memoService.restoreMemo(id);
            // Fetch and update trashed memos
            const trashedMemos = await memoService.getTrashedMemos();
            setTrashedMemoList(trashedMemos);
            // Fetch and update active memos
            const activeMemos = await memoService.getAllMemos();
            setMemoList(activeMemos);
        } catch (err) {
            setError("Failed to restore memo.");
            console.error(err);
        }
    };

    /**
     * Permanently deletes a trashed memo.
     * @param id The ID of the memo
     */
    const deleteTrashedMemo = async (id: string) => {
        if (!memoService) return;
        try {
            await memoService.deleteTrashedMemo(id);
            // Fetch and update trashed memos
            const trashedMemos = await memoService.getTrashedMemos();
            setTrashedMemoList(trashedMemos);
        } catch (err) {
            setError("Failed to delete trashed memo.");
            console.error(err);
        }
    };

    /**
     * Permanently deletes all trashed memos.
     */
    const deleteAllTrashedMemos = async () => {
        if (!memoService) return;
        try {
            await memoService.deleteAllTrashedMemos();
            setTrashedMemoList([]);
        } catch (err) {
            setError("Failed to delete all trashed memos.");
            console.error(err);
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
            }}
        >
            {children}
        </MemoContext.Provider>
    );
};

/**
 * useMemoContext hook retrieves the value of MemoContext.
 * @returns The value of MemoContext
 * @throws If an error occurs, indicating that it must be used within a MemoProvider
 */
export const useMemoContext = (): MemoContextProps => {
    const context = useContext(MemoContext);
    if (!context) {
        throw new Error("useMemoContext must be used within a MemoProvider");
    }
    return context;
};
