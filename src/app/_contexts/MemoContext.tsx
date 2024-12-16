"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Memo, MemoSchema, MemoArraySchema } from "@/schemas/app/_contexts/memoSchemas";
import { IMemoContext } from "@/interfaces/clientSide/memo/IMemoContext";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";
import { MemoManager } from "../_components/memo/memoManager";
import { openDB, IDBPDatabase } from "idb";
// import { useAuth } from "@/components/AuthProvider";


const initDB = async (): Promise<IDBPDatabase<MyIDB>> => {
  return await openDB<MyIDB>("memoDB", 1, {
    upgrade(db) {
      // すでにクライアントサイドに存在している場合のハンドリング
      // - アップデート処理・そもそもアップデート部分がなければ処理を回避、など
      const memoStore = db.createObjectStore("memoList", { keyPath: "id" });
      memoStore.createIndex("by-createdAt", "createdAt");
      memoStore.createIndex("by-tags", "tags", { multiEntry: true });

      const trashedStore = db.createObjectStore("trashedMemoList", { keyPath: "id" });
      trashedStore.createIndex("by-deletedAt", "deletedAt");
    }
  })
}

// メモコンテキスト作成
// TODO undefinedの扱い - 本当にこの初期化でいいか - 脅威モデル
const MemoContext = createContext<IMemoContext | undefined>(undefined);

// メモプロバイダーコンポーネント
export const MemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const { user } =useAuth();
  const [memoList, setMemoList] = useState<Memo[]>([]);
  const [trashedMemoList, setTrashedMemoList] = useState<Memo[]>([]);
  const [idb, setIDb] = useState<IDBPDatabase<MyIDB> | null>(null);

  // セットアップ
  useEffect(() => {
    const setupDB = async () => {
      if (!user) {}
    }
  })

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
