"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Memo, MemoSchema, MemoArraySchema } from "@/schemas/app/_contexts/memoSchemas";
import { IMemoContext } from "@/interfaces/clientSide/memo/IMemoContext";
import { MyIDB } from "@/interfaces/clientSide/memo/idb";
import { MemoManager } from "../_components/memo/memoManager";
import { openDB, IDBPDatabase } from "idb";
import { IDB_OBJECT_STORE_CONFIGS, IDB_OBJECT_STORES } from "@/constants/clientSide/idb/objectStores";
// import { useAuth } from "@/components/AuthProvider";


const initDB = async (): Promise<IDBPDatabase<MyIDB>> => {
  return await openDB<MyIDB>("memoDB", 1, {
    upgrade(db) {
      // すでにクライアントサイドに存在している場合のハンドリング
      // - アップデート処理・そもそもアップデート部分がなければ処理を回避、など
      const memoStore = db.createObjectStore(IDB_OBJECT_STORE_CONFIGS[0].name, { keyPath: "id" });
      memoStore.createIndex("by-createdAt", "createdAt");
      memoStore.createIndex("by-tags", "tags", { multiEntry: true });

      const trashedStore = db.createObjectStore("trashedMemoList", { keyPath: "id" });
      trashedStore.createIndex("by-deletedAt", "deletedAt");
    }
  })
}

// メモコンテキスト作成
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
    localStorage.setItem("memoList", JSON.stringify(memoList));
  }, [memoList]);

  const addMemo = (content: string) => {
    const newMemo: Memo = { id: Date.now().toString(), content };
    setMemoList([...memoList, newMemo]);
  };

  const editMemo = (id: string, content: string) => {
    setMemoList(memoList.map(memo => (memo.id === id ? { ...memo, content } : memo)));
  };

  const deleteMemo = (id: string) => {
    setMemoList(memoList.filter(memo => memo.id !== id));
  };

  return (
    <MemoContext.Provider value={{ memoList, addMemo, editMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
};

/**
 * custom hook of the contexts for "memo" function.
 */
export const useMemoContext = () => {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("useMemoContext must be used within a MemoProvider");
  }
  return context;
};
