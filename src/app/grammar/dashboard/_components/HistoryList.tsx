// app/grammar/dashboard/_components/HistoryList.tsx

'use client';

import { HistoryItem, mockHistory } from './mockData';

export default function HistoryList() {
  const history: HistoryItem[] = mockHistory;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">最新の履歴一覧</h2>
      <ul>
        {history.map((item) => (
          <li key={item.id} className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium">{item.unit}</p>
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>
              <p className="text-lg font-semibold text-indigo-600">{item.score} / 10</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
