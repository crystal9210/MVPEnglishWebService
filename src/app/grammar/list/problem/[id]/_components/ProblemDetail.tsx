// components/ProblemDetail.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type Problem = {
  id: string;
  problem: string;
  answer: string;
  options: string[];
  details: string;
};

export default function ProblemDetail({
  problemData,
  unitName,
}: {
  problemData: Problem;
  unitName: string;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowAnswer(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const isCorrect = selectedOption === problemData.answer;

  return (
    <div className="container mx-auto p-4 relative">
      {/* 戻るボタン */}
      <Link
        href={`/grammar/list?unit=${encodeURIComponent(unitName)}`}
        className="text-indigo-500 hover:underline mb-4 block"
      >
        &larr; 戻る
      </Link>

      {/* 問題 */}
      <h1 className="text-2xl font-bold mb-4 text-gray-800">問題詳細</h1>
      <p className="mb-4 text-lg text-gray-800">{problemData.problem}</p>

      {/* 選択肢 */}
      <div className="mb-4">
        {problemData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            className={`block w-full text-left px-4 py-2 mb-2 rounded ${
              selectedOption === option
                ? 'bg-indigo-500 text-white'
                : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
            }`}
            disabled={showAnswer}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 回答と解説 */}
      {showAnswer && (
        <div className="mt-4 p-4 rounded bg-white shadow">
          <p className="mb-2 text-lg">
            {isCorrect ? (
              <span className="text-green-600 font-bold">正解です！</span>
            ) : (
              <span className="text-red-600 font-bold">不正解です。</span>
            )}
          </p>
          <p className="mb-2 text-green-600">
            <strong>解答:</strong> {problemData.answer}
          </p>
          <p className="mb-2 text-green-600">
            <strong>解説:</strong> {problemData.details}
          </p>
          {/* リセットボタン */}
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            もう一度挑戦する
          </button>
        </div>
      )}

      {/* 右下のボタン */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <button
          onClick={() => {}}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          過去の履歴詳細を見る
        </button>
        <button
          onClick={() => {}}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          メモを見る
        </button>
      </div>
    </div>
  );
}
