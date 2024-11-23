"use client";

import { useState } from "react";
import Image from "next/image";
import { questions } from "./_components/mockData";

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ id: number; correct: boolean }[]>([]);
  const [completed, setCompleted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (option: string) => {
    const isCorrect = option === currentQuestion.answer;
    setResults((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHintVisible(false); // 次の質問に進むときにヒントを非表示
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Quiz Results</h1>
          <ul>
            {results.map((result, index) => (
              <li
                key={index}
                className={`p-2 mb-2 rounded-md ${
                  result.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                Question {result.id}: {result.correct ? "Correct" : "Wrong"}
              </li>
            ))}
          </ul>
          {/* Quiz選択画面に戻る */}
          <button
            onClick={() => (window.location.href = "/basis/quiz")}
            className="w-full py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Quiz選択画面に戻る
          </button>
          {/* User's Dashboardに戻る */}
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full py-2 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            User&apos;s Dashboardに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Question {currentIndex + 1}</h1>

        {/* 問題文 */}
        <p className="text-lg font-medium mb-4 text-lime-700">
          {currentQuestion.example.replace("___", "_____")}
        </p>

        {/* 選択肢 */}
        <div className="flex flex-col space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.text)}
              className="w-full p-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex flex-col items-center"
            >
              <div className="flex flex-row space-x-4 mb-2">
                {option.images.map((img, imgIndex) => (
                  <Image
                    key={imgIndex}
                    src={img}
                    alt={`${option.text} Image ${imgIndex + 1}`}
                    width={200}
                    height={200}
                    className="rounded-md"
                  />
                ))}
              </div>
              <span>{option.text}</span>
            </button>
          ))}
        </div>

        {/* ヒント表示 */}
        <div className="mt-6">
          <button
            onClick={() => setHintVisible((prev) => !prev)}
            className="w-full py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            {hintVisible ? "Hide Hint" : "Show Hint"}
          </button>
          {hintVisible && (
            <p className="mt-4 text-gray-600 bg-gray-50 p-4 rounded-md">
              {currentQuestion.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
