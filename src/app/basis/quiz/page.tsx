"use client";

import { useState } from 'react';
import Image from 'next/image';
import { questions } from './begginning/_components/mockData'; // 問題データをインポート

export default function QuizPage() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0); // 現在の問題のインデックス
  const [showAnswer, setShowAnswer] = useState(false); // 答えを表示するかどうか

  const currentProblem = questions[currentProblemIndex]; // 現在の問題を取得

  const handleNext = () => {
    setShowAnswer(false); // 答えを非表示にリセット
    setCurrentProblemIndex((prev) => (prev + 1) % questions.length); // 次の問題へ
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Quiz</h1>

        {/* 問題を表示 */}
        <div className="mb-4">
          {currentProblem.image && (
            <Image
              src={currentProblem.image}
              alt="Problem Image"
              width={500} // 必須のプロパティ
              height={300} // 必須のプロパティ
              className="w-full h-auto rounded-md mb-2"
            />
          )}

          {currentProblem.example && (
            <p className="text-lg font-medium text-lime-700">
              {currentProblem.example.replace('___', '_____')}
            </p>
          )}

          {currentProblem.options && (
            <ul className="mt-2">
              {currentProblem.options.map((option, index) => (
                <li
                  key={index}
                  className="p-2 bg-gray-100 rounded-md mb-2 cursor-pointer hover:bg-gray-200"
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 答えと詳細の表示 */}
        {showAnswer ? (
          <div>
            <p className="text-green-500 font-semibold">Answer: {currentProblem.answer}</p>
            <p className="text-gray-600 mt-2">{currentProblem.explanation}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Show Answer
          </button>
        )}

        {/* 次の問題ボタン */}
        <button
          onClick={handleNext}
          className="w-full py-2 mt-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Next Problem
        </button>
      </div>
    </div>
  );
}
