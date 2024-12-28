// 設計
// コンテキスト全体の方針(一貫した設計)：ローカルのセッションとしてコンテキストおよびidbを通じてデータを保持、アクセスを許可されているルートにてアクセス可能
// TODO アクセス制御のセキュリティ機構をどの程度導入するか
// メモコンテキスト機能
// 1. 基本的なCRUD - React context APIによるグローバルな状態管理・提供
// 2. idbへの保存機能(バックグラウンド・非同期)
// 3. データ永続化 -> ユーザにリモートでデータを保持させるかどうかを選択して制御させる
// 4. UI：モーダル
// 5. メモ検索・フィルタリング機能 - 日時、タグ付け・カテゴリ分け
// 6. メモコピーボタン：各問題に取り組む中で特定の問題文IDに関連づけられたユーザごとのメモ内容や、また、オリジナル問題セット作成機能を実装する(先駆けとして/dashboardのgoals領域に同様の方針で機能実装済み)
// TODO 5-日時：昇順・降順 -  バックグラウンドで作成・最終更新日時をデータとして保持するようにするがこれはフィルタイングおよび制御の際に表示するかどうか

"use client";

import React, { useState, useEffect } from "react";
import { useMemoContext } from "@/contexts/MemoContext";

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo?: { id: string; content: string } | null;
}

const MemoModal: React.FC<MemoModalProps> = ({ isOpen, onClose, memo }) => {
  const { addMemo, editMemo } = useMemoContext();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (memo) {
      setContent(memo.content);
    } else {
      setContent("");
    }
  }, [memo]);

  const handleClose = () => {
    setContent(""); // モーダルを閉じるときに内容をクリア
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memo) {
      editMemo(memo.id, content);
    } else {
      addMemo(content);
    }
    setContent(""); // フォーム送信後に内容をクリア
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4">{memo ? "メモ編集" : "メモ追加"}</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 p-2 border border-gray-300 text-black rounded-md mb-4 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="メモの内容を入力してください"
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              {memo ? "保存" : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoModal;
