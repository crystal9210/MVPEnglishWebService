// app/dashboard/_components/ProblemHistoryModal.tsx

"use client";

import React from "react";
import { ProblemHistory } from "./problemHistoryMock";
import Modal from "./Modal";
import { FaHistory } from "react-icons/fa"; // Font Awesome からインポート

type ProblemHistoryModalProps = {
  history: ProblemHistory;
  onClose: () => void;
};

const ProblemHistoryModal: React.FC<ProblemHistoryModalProps> = ({ history, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <FaHistory className="h-6 w-6 text-green-400 mr-2" /> {/* FaHistory を使用 */}
          <h3 className="text-2xl text-black font-semibold">問題詳細</h3>
        </div>
        <p className="text-blue-400"><strong>問題:</strong> {history.problem}</p>
        <p className="text-blue-400"><strong>回答:</strong> {history.answer}</p>
        <p className="text-blue-400"><strong>選択肢:</strong></p>
        <ul className="list-disc list-inside mb-4 text-black">
          {history.options.map(option => (
            <li key={option}>{option}</li>
          ))}
        </ul>
        <p className="text-blue-400"><strong>詳細:</strong> {history.details}</p>
        <p className="text-blue-400"><strong>正誤判定:</strong> {history.isCorrect ? "正解 (✅)" : "不正解 (❌)"}</p>
        <p className="text-blue-400"><strong>合計回答数:</strong> {history.totalAttempts}</p>
        <p className="text-blue-400"><strong>正解数:</strong> {history.correctCount}</p>
        <p className="text-blue-400"><strong>誤答数:</strong> {history.wrongCount}</p>
        <p className="text-blue-400"><strong>開始日時:</strong> {new Date(history.startDate).toLocaleString()}</p>
        <p className="text-blue-400"><strong>終了日時:</strong> {new Date(history.endDate).toLocaleString()}</p>
        <p className="text-blue-400"><strong>メモ:</strong> {history.memo}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
        >
          閉じる
        </button>
      </div>
    </Modal>
  );
};

export default ProblemHistoryModal;
