// app/grammar/dashboard/page.tsx

import Link from 'next/link';
import ChartSection from './_components/ChartSelection';
import HistoryList from './_components/HistoryList';
import TodoList from './_components/ToDoList';
import GoalList from './_components/GoalList';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* ナビゲーションバー */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-600">Grammar Dashboard</h1>
        <Link href="/grammar/quiz" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition">
          クイズページへ
        </Link>
      </div>

      {/* コンテンツエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 過去の取り組み履歴 */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <ChartSection />
        </div>

        {/* 最新の履歴一覧 */}
        <div>
          <HistoryList />
        </div>

        {/* TODOリスト */}
        <div>
          <TodoList />
        </div>

        {/* 目標リスト */}
        <div className="lg:col-span-2">
          <GoalList />
        </div>
      </div>
    </div>
  );
}
