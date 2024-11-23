// app/grammar/dashboard/_components/GoalList.tsx

'use client';

import { useState } from 'react';
import { GoalItem, mockGoals } from './mockData';
import Link from 'next/link';

export default function GoalList() {
  const [goals, setGoals] = useState<GoalItem[]>(mockGoals);
  const [filter, setFilter] = useState<'全て' | '短期' | '中期' | '長期'>('全て');

  const filteredGoals =
    filter === '全て' ? goals : goals.filter((goal) => goal.category === filter);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">目標リスト</h2>

      {/* フィルター */}
      <div className="mb-4 flex justify-center space-x-2">
        {['全て', '短期', '中期', '長期'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category as '全て' | '短期' | '中期' | '長期')}
            className={`px-3 py-1 rounded ${
              filter === category
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 目標一覧 */}
      <ul>
        {filteredGoals.map((goal) => (
          <li key={goal.id} className="mb-4">
            <div className="flex justify-between items-center">
              <p className="text-lg">{goal.task}</p>
              <span className="px-2 py-1 text-sm bg-indigo-100 text-indigo-800 rounded">
                {goal.category}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
