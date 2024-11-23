// app/grammar/dashboard/_components/ChartSection.tsx

'use client';

import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { mockActivities, Activity } from './mockData';

// Chart.jsの必要なコンポーネントを登録
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function ChartSection() {
  const activities: Activity[] = mockActivities;

  const data = {
    labels: activities.map((activity) => activity.date),
    datasets: [
      {
        label: 'Completed Tasks',
        data: activities.map((activity) => activity.completed),
        borderColor: 'rgba(59, 130, 246, 1)', // Tailwindのindigo-500
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Total Tasks',
        data: activities.map((activity) => activity.total),
        borderColor: 'rgba(239, 68, 68, 1)', // Tailwindのred-500
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Past Activity History',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <Line data={data} options={options} />
    </div>
  );
}
