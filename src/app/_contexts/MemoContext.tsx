// app/contexts/MemoContext.tsx

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// メモの型定義
interface Memo {
  id: string;
  content: string;
}

// コンテキストの型定義
interface MemoContextType {
  memos: Memo[];
  addMemo: (content: string) => void;
  editMemo: (id: string, content: string) => void;
  deleteMemo: (id: string) => void;
}

// コンテキストの作成
const MemoContext = createContext<MemoContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const MemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [memos, setMemos] = useState<Memo[]>([]);

  // ローカルストレージからメモを取得
  useEffect(() => {
    const storedMemos = localStorage.getItem("memos");
    if (storedMemos) {
      setMemos(JSON.parse(storedMemos));
    }
  }, []);

  // メモの更新時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("memos", JSON.stringify(memos));
  }, [memos]);

  const addMemo = (content: string) => {
    const newMemo: Memo = { id: Date.now().toString(), content };
    setMemos([...memos, newMemo]);
  };

  const editMemo = (id: string, content: string) => {
    setMemos(memos.map(memo => (memo.id === id ? { ...memo, content } : memo)));
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter(memo => memo.id !== id));
  };

  return (
    <MemoContext.Provider value={{ memos, addMemo, editMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
};

// カスタムフック
export const useMemoContext = () => {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("useMemoContext must be used within a MemoProvider");
  }
  return context;
};
