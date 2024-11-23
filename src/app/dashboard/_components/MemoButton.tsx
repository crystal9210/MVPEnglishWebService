"use client";

import React, { useState } from "react";
import { DocumentTextIcon, PencilIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useMemoContext } from "@/app/contexts/MemoContext";
import MemoModal from "./MemoModal";

const MemoButton: React.FC = () => {
  const { memos, deleteMemo } = useMemoContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<{ id: string; content: string } | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);

  const handleAdd = () => {
    setEditingMemo(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (memo: { id: string; content: string }) => {
    setEditingMemo(memo);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("本当にこのメモを削除しますか？")) {
      deleteMemo(id);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end space-y-4">
        {/* メモ表示トグルボタン */}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
          aria-label="メモを開閉"
        >
          {isVisible ? <XMarkIcon className="h-6 w-6" /> : <DocumentTextIcon className="h-6 w-6" />}
        </button>

        {/* メモ一覧 */}
        {isVisible && (
          <div className="w-64 bg-white shadow-lg rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">メモ</h3>
              <button
                onClick={handleAdd}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                aria-label="メモを追加"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            {memos.length === 0 ? (
              <p className="text-gray-500">メモがありません。</p>
            ) : (
              <ul className="space-y-2">
                {memos.map(memo => (
                  <li key={memo.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-700">{memo.content}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(memo)}
                          className="text-blue-500 hover:text-blue-600"
                          aria-label="メモを編集"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(memo.id)}
                          className="text-red-500 hover:text-red-600"
                          aria-label="メモを削除"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* メモモーダル */}
      <MemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} memo={editingMemo} />
    </>
  );
};

export default MemoButton;
