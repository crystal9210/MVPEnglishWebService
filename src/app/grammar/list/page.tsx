// app/grammar/list/page.tsx
import fs from 'fs';
import path from 'path';
import UnitProblemList from '@/_components/UnitProblemList';
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

export default function GrammarListPage() {
  const units: Unit[] = [
    {
      name: 'Comparatives and Superlatives',
      filename: 'comparatives_and_superlatives.json',
      problems: [],
    },
    {
      name: 'Adverbs',
      filename: 'adverbs.json',
      problems: [],
    },
    {
      name: 'Demonstratives',
      filename: 'demonstratives.json',
      problems: [],
    },
    // 他の単元を追加可能
  ];

  // 各単元の JSON ファイルからデータを読み込む
  units.forEach((unit) => {
    try {
      const filePath = path.join(process.cwd(), 'src', 'sample_datasets', unit.filename);
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      unit.problems = JSON.parse(fileContents);
    } catch (error) {
      console.error(`Error reading file for unit ${unit.name}:`, error);
      unit.problems = [];
    }
  });

  // デフォルトの単元名（最初の単元）
  const initialUnitName = units[0]?.name;

  // JSX を return する
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative">
      {/* ダッシュボードに戻るボタン */}
      <div className="absolute top-4 left-4">
        <Link href="/dashboard" className="text-indigo-500 hover:underline">
          &larr; ダッシュボードに戻る
        </Link>
      </div>

      {/* コンテンツ全体のラップ */}
      <div className="container mx-auto p-4">
        {/* タイトル */}
        <h1 className="text-3xl font-bold mb-4 text-gray-800 text-center">問題一覧</h1>

        {/* 問題リストコンポーネント */}
        <UnitProblemList units={units} initialUnitName={initialUnitName} />
      </div>
    </div>
  );
}
