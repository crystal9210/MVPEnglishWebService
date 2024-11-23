// app/dashboard/_components/HistoryPanel.tsx

"use client";

import React, { useState } from "react";
import { problemHistoryMock, ProblemHistory } from "./problemHistoryMock";
import ProblemHistoryModal from "./ProblemHistoryModal";
import { FaHistory } from "react-icons/fa"; // Font Awesome からインポート

const HistoryPanel: React.FC = () => {
  const [selectedHistory, setSelectedHistory] = useState<ProblemHistory | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleItemClick = (history: ProblemHistory) => {
    setSelectedHistory(history);
  };

  const handleModalClose = () => {
    setSelectedHistory(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-4 mb-6 border border-gray-300">
      <div className="flex items-center mb-4">
        <FaHistory className="h-6 w-6 text-indigo-600 mr-2" /> {/* FaHistory を使用 */}
        <h2 className="text-xl font-semibold text-gray-800">最新の履歴</h2>
      </div>
      <div className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <ul>
          {problemHistoryMock.map(history => (
            <li
              key={history.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedIds.has(history.id) ? "bg-gray-200" : ""
              }`}
            >
              <div className="flex items-center" onClick={() => handleItemClick(history)}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(history.id)}
                  onChange={() => toggleSelect(history.id)}
                  className="mr-2"
                  onClick={(e) => e.stopPropagation()} // チェックボックスクリック時にアイテムクリックを防ぐ
                />
                <span className="text-gray-700">{history.problem}</span>
              </div>
              <div className="flex items-center">
                {/* 正誤表示 */}
                <span className="ml-2 text-lg">
                  {history.isCorrect ? "✅" : "❌"}
                </span>
                {/* 過去の正答数・誤答数を小さめに表示 */}
                <span className="ml-2 text-sm text-gray-500">
                  正答数: {history.correctCount} | 誤答数: {history.wrongCount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* 選択した履歴を取り組むボタン */}
      {selectedIds.size > 0 && (
        <button
          onClick={() => {
            // 選択した履歴のIDをクエリパラメータとして渡す
            const idsArray = Array.from(selectedIds);
            window.location.href = `/history/quiz?ids=${idsArray.join(",")}`;
          }}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          選択した問題に取り組む
        </button>
      )}
      {/* 履歴詳細モーダル */}
      {selectedHistory && (
        <ProblemHistoryModal history={selectedHistory} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default HistoryPanel;
