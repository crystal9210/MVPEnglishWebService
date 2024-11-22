// app/grammar/quiz/select/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Unit = {
  name: string;
  filename: string;
};

export default function QuizSelectPage() {
  const router = useRouter();

  const units: Unit[] = [
    { name: 'Comparatives and Superlatives', filename: 'comparatives_and_superlatives.json' },
    { name: 'Adverbs', filename: 'adverbs.json' },
    { name: 'Demonstratives', filename: 'demonstratives.json' },
    // 他の単元を追加可能
  ];

  const difficultyLevels = ['Easy', 'Medium', 'Hard'];

  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(''); // モック
  const [numberOfProblems, setNumberOfProblems] = useState<number>(5);
  const [selectionMode, setSelectionMode] = useState<'random' | 'specific'>('random');
  const [specificIds, setSpecificIds] = useState<string>('');

  const handleStartQuiz = () => {
    if (!selectedUnit) {
      alert('単元を選択してください。');
      return;
    }

    const queryParams: Record<string, string | number | undefined> = {
      unit: selectedUnit,
      difficulty: selectedDifficulty, // モック
      number: numberOfProblems,
      mode: selectionMode,
      ids: selectionMode === 'specific' ? specificIds : undefined,
    };

    const queryString = new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    router.push(`/grammar/quiz?${queryString}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">クイズ設定</h1>

        {/* 単元選択 */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">単元</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- 単元を選択 --</option>
            {units.map((unit) => (
              <option key={unit.name} value={unit.name}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        {/* 難易度選択（モック） */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">難易度（モック）</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- 難易度を選択 --</option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* 問題数選択 */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">問題数</label>
          <input
            type="number"
            min={1}
            max={20}
            value={numberOfProblems}
            onChange={(e) => setNumberOfProblems(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* ID選択モード */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">ID選択モード</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="random"
                checked={selectionMode === 'random'}
                onChange={() => setSelectionMode('random')}
                className="mr-2"
              />
              ランダム
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="specific"
                checked={selectionMode === 'specific'}
                onChange={() => setSelectionMode('specific')}
                className="mr-2"
              />
              特定のID
            </label>
          </div>
        </div>

        {/* 特定のID入力（モック） */}
        {selectionMode === 'specific' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">IDをカンマ区切りで入力</label>
            <input
              type="text"
              value={specificIds}
              onChange={(e) => setSpecificIds(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="例: 1,3,5"
            />
          </div>
        )}

        {/* 開始ボタン */}
        <button
          onClick={handleStartQuiz}
          className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition"
        >
          クイズ開始
        </button>

        {/* 戻るリンク */}
        <Link href="/grammar/list" className="block text-center mt-4 text-indigo-500 hover:underline">
          戻る
        </Link>
      </div>
    </div>
  );
}
