'use client';

import { useState, useEffect, useRef } from 'react';
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
  problems: Problem[];
};

type Props = {
  units: Unit[];
  initialUnitName: string;
};

export default function UnitProblemList({ units, initialUnitName }: Props) {
  // Hooks をコンポーネントのトップレベルで宣言
  const [selectedUnitName, setSelectedUnitName] = useState(initialUnitName || '');
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 20;

  const containerRef = useRef<HTMLDivElement>(null);

  // カーソル位置を追跡（削除してボタンを常に表示）
  // const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  // const [showPrevButton, setShowPrevButton] = useState(true);
  // const [showNextButton, setShowNextButton] = useState(true);

  // units や initialUnitName の検証
  const isValidUnits = units && units.length > 0;
  const isValidInitialUnitName = initialUnitName && initialUnitName.trim() !== '';


  useEffect(() => {
    setCurrentPage(1); // 単元が変更されたらページ番号をリセット
  }, [selectedUnitName]);

  // 有効な units がない場合の処理
  if (!isValidUnits) {
    return <p>単元データが見つかりません。</p>;
  }

  // 有効な initialUnitName がない場合の処理
  if (!isValidInitialUnitName) {
    return <p>選択された単元が不正です。</p>;
  }

  const selectedUnit = units.find((unit) => unit.name === selectedUnitName);

  // 選択された単元が見つからない場合の処理
  if (!selectedUnit) {
    return <p>選択された単元が見つかりません。</p>;
  }

  const totalPages = Math.ceil(selectedUnit.problems.length / problemsPerPage);

  const currentProblems = selectedUnit.problems.slice(
    (currentPage - 1) * problemsPerPage,
    currentPage * problemsPerPage
  );

  // 現在の単元のインデックスを取得
  const currentUnitIndex = units.findIndex((unit) => unit.name === selectedUnitName);

  // 前後の単元を取得
  const prevUnit = units[currentUnitIndex - 1];
  const nextUnit = units[currentUnitIndex + 1];


  return (
    <div className="relative" ref={containerRef}>
      {/* 上部に各リストのボタンを表示 */}
      <div className="flex justify-center space-x-4 mb-6">
        {units.map((unit) => (
          <button
            key={unit.name}
            className={`px-4 py-2 rounded transition ${
              selectedUnitName === unit.name
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
            }`}
            onClick={() => setSelectedUnitName(unit.name)}
          >
            {unit.name}
          </button>
        ))}
      </div>

      {/* 左矢印ボタン */}
      {prevUnit && (
        <button
          onClick={() => setSelectedUnitName(prevUnit.name)}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-indigo-500 text-white rounded-full shadow-lg transition-opacity duration-300 opacity-80 z-10`}
        >
          &#8249;
        </button>
      )}
      {/* 右矢印ボタン */}
      {nextUnit && (
        <button
          onClick={() => setSelectedUnitName(nextUnit.name)}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-indigo-500 text-white rounded-full shadow-lg transition-opacity duration-300 opacity-80 z-10`}
        >
          &#8250;
        </button>
      )}

      {/* コンテンツ */}
      <div className="px-4">
        {/* 問題一覧 */}
        {currentProblems.length > 0 ? (
          <>
            <ul className="mb-4">
              {currentProblems.map((problem) => (
                <li key={problem.id} className="border-b border-gray-300 py-2">
                  <Link
                    href={`/grammar/list/problem/${problem.id}?unit=${encodeURIComponent(
                      selectedUnitName
                    )}`}
                    className="text-gray-800 relative group"
                  >
                    {problem.problem}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* ページネーション */}
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                前へ
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-800">問題が見つかりません。</p>
        )}
      </div>
    </div>
  );
}
