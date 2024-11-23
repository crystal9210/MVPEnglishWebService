"use client";

import React, { useState } from "react";
import { problemHistoryMock, ProblemHistory } from "./problemHistoryMock";
import ProblemHistoryModal from "./ProblemHistoryModal";
import { FaHistory } from "react-icons/fa";

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
    <div className="flex flex-col h-full bg-white p-4">
      <div className="flex items-center mb-4">
        <FaHistory className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">最新の履歴</h2>
      </div>
      {/* スクロール可能なリスト部分 */}
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
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
                  className="mr-2 h-6 w-6 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-gray-700">{history.problem}</span>
              </div>
              <div className="flex items-center">
                <span className="ml-2 text-lg">{history.isCorrect ? "✅" : "❌"}</span>
                <span className="ml-2 text-sm text-gray-500">
                  正答数: {history.correctCount} | 誤答数: {history.wrongCount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* ボタン部分 */}
      <div className="mt-4">
        <button
          onClick={() => {
            const idsArray = Array.from(selectedIds);
            window.location.href = `/history/quiz?ids=${idsArray.join(",")}`;
          }}
          disabled={selectedIds.size === 0}
          className={`py-2 w-full rounded ${
            selectedIds.size > 0
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-300 text-gray-700 cursor-not-allowed"
          } transition-colors`}
        >
          選択した問題に取り組む
        </button>
      </div>
      {/* 履歴詳細モーダル */}
      {selectedHistory && (
        <ProblemHistoryModal history={selectedHistory} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default HistoryPanel;
