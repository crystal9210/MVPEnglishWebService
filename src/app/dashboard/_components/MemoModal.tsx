// app/dashboard/_components/MemoModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useMemoContext } from "@/app/contexts/MemoContext";

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo?: { id: string; content: string };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memo) {
      editMemo(memo.id, content);
    } else {
      addMemo(content);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4">{memo ? "メモ編集" : "メモ追加"}</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="メモの内容を入力してください"
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
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
