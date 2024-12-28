"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { MemoService } from "@/domain/services/clientSide/memoService";
import { MemoRepository } from "@/domain/repositories/idb/memoRepository";
import IndexedDBManager from "@/idb";

// Context型定義
const MemoContext = createContext<{
  memoList: Memo[];
  addMemo: (content: string) => Promise<void>;
  editMemo: (id: string, content: string) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} | null>(null);

// プロバイダー
export const MemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [memoService, setMemoService] = useState<MemoService | null>(null);
  const [memoList, setMemoList] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 非同期で依存関係を初期化
  useEffect(() => {
    const initialize = async () => {
      try {
        const idbManager = new IndexedDBManager();
        const memoRepository = new MemoRepository(idbManager);
        const service = new MemoService(memoRepository);
        setMemoService(service);
      } catch (err) {
        setError("Failed to initialize MemoService.");
        console.error(err);
      }
    };

    initialize();
  }, []);

  // 初期化: 全てのメモをロード
  useEffect(() => {
    if (!memoService) return;

    const loadMemos = async () => {
      try {
        const allMemos = await memoService.getAllMemos();
        setMemoList(allMemos);
      } catch (err) {
        setError("Failed to load memos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemos();
  }, [memoService]);

  // メモを追加
  const addMemo = async (content: string) => {
    if (!memoService) return;
    try {
      const newMemo = await memoService.createMemo(content);
      setMemoList((prev) => [...prev, newMemo]);
    } catch (err) {
      setError("Failed to add memo.");
      console.error(err);
    }
  };

  // メモを編集
  const editMemo = async (id: string, content: string) => {
    if (!memoService) return;
    try {
      await memoService.updateMemo(id, { content });
      setMemoList((prev) =>
        prev.map((memo) => (memo.id === id ? { ...memo, content, lastUpdatedAt: new Date() } : memo))
      );
    } catch (err) {
      setError("Failed to edit memo.");
      console.error(err);
    }
  };

  // メモを削除
  const deleteMemo = async (id: string) => {
    if (!memoService) return;
    try {
      await memoService.deleteMemo(id);
      setMemoList((prev) => prev.filter((memo) => memo.id !== id));
    } catch (err) {
      setError("Failed to delete memo.");
      console.error(err);
    }
  };

  return (
    <MemoContext.Provider
      value={{
        memoList,
        addMemo,
        editMemo,
        deleteMemo,
        isLoading,
        error,
      }}
    >
      {children}
    </MemoContext.Provider>
  );
};

// useMemoContextフック
export const useMemoContext = () => {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("useMemoContext must be used within a MemoProvider");
  }
  return context;
};
