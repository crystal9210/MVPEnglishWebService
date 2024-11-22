// components/Quiz.tsx
'use client';

import { useState } from 'react';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import Link from 'next/link';

type Problem = {
  id: string;
  problem: string;
  answer: string;
  options: string[];
  details: string;
};

type Unit = {
  name: string;
  filename: string;
  problems: Problem[];
};

type QuizProps = {
  units: Unit[];
  initialUnitName: string;
};

export default function Quiz({ units, initialUnitName }: QuizProps) {
  const [selectedUnitName, setSelectedUnitName] = useState<string>(initialUnitName);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  // 初期化時に選択された単元の問題を設定
  useState(() => {
    const initialUnit = units.find((unit) => unit.name === initialUnitName);
    if (initialUnit) {
      setSelectedProblems(initialUnit.problems.slice(0, 5)); // ランダムではなく最初の5問
    }
  }, [initialUnitName, units]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitName = e.target.value;
    setSelectedUnitName(unitName);
    setAnswers({});
    setShowResults(false);

    const unit = units.find((u) => u.name === unitName);
    if (unit) {
      setSelectedProblems(unit.problems.slice(0, 5)); // ランダムではなく最初の5問
    }
  };

  const handleAnswer = (id: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: option,
    }));
  };

  const handleSubmit = () => {
    if (selectedProblems.length === Object.keys(answers).length) {
      setShowResults(true);
    } else {
      alert('すべての問題に回答してください。');
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  if (loading) {
    return <p className="text-center mt-8">読み込み中...</p>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-600 text-center">{error}</p>
        <div className="flex justify-center mt-4">
          <Link href="/grammar/quiz/select" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition">
            設定画面へ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 単元選択 */}
      <div className="mb-6 text-center">
        <label htmlFor="unit-select" className="mr-2 text-lg font-medium text-gray-700">
          単元を選択:
        </label>
        <select
          id="unit-select"
          value={selectedUnitName}
          onChange={handleUnitChange}
          className="px-4 py-2 border rounded"
        >
          {units.map((unit) => (
            <option key={unit.filename} value={unit.name}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      {!showResults ? (
        <>
          {selectedProblems.map((problem, index) => (
            <QuizQuestion
              key={problem.id}
              problem={problem}
              questionNumber={index + 1}
              selectedOption={answers[problem.id]}
              onSelectOption={handleAnswer}
            />
          ))}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              リセット
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedProblems.length !== Object.keys(answers).length}
              className={`px-4 py-2 rounded transition ${
                selectedProblems.length === Object.keys(answers).length
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 cursor-not-allowed'
              }`}
            >
              答えを表示
            </button>
          </div>
        </>
      ) : (
        <QuizResults unitName={selectedUnitName} selectedProblems={selectedProblems} answers={answers} />
      )}
    </div>
  );
}
