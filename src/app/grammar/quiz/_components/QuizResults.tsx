// components/QuizResults.tsx
'use client';

import Link from 'next/link';

type Problem = {
  id: string;
  problem: string;
  answer: string;
  options: string[];
  details: string;
};

type QuizResultsProps = {
  unitName: string;
  selectedProblems: Problem[];
  answers: { [key: string]: string };
};

export default function QuizResults({ unitName, selectedProblems, answers }: QuizResultsProps) {
  const totalQuestions = selectedProblems.length;
  let correctAnswers = 0;

  const resultData = selectedProblems.map((problem) => {
    const userAnswer = answers[problem.id];
    const isCorrect = userAnswer === problem.answer;
    if (isCorrect) correctAnswers += 1;
    return { ...problem, userAnswer, isCorrect };
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">クイズ結果</h2>
      <p className="text-center mb-6 text-lg">
        {`あなたのスコア: ${correctAnswers} / ${totalQuestions}`}
      </p>

      {resultData.map((result, index) => (
        <div key={result.id} className="mb-6 p-4 border rounded">
          <h3 className="text-xl font-semibold mb-2">
            {index + 1}. {result.problem}
          </h3>
          <p className={`mb-1 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            <strong>あなたの回答:</strong> {result.userAnswer} {result.isCorrect ? '✅' : '❌'}
          </p>
          {!result.isCorrect && (
            <p className="mb-1 text-green-600">
              <strong>正解:</strong> {result.answer}
            </p>
          )}
          <p className="text-gray-700">
            <strong>解説:</strong> {result.details}
          </p>
        </div>
      ))}

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
        >
          もう一度クイズをする
        </button>
        <Link href="/grammar/list" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
          問題一覧に戻る
        </Link>
      </div>
    </div>
  );
}
