// app/dashboard/_components/ActivityChart.tsx

"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { mockActivitiesPerService, Activity } from "./mockData";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

type ActivityChartProps = {
  serviceName: string;
  timeframe: '日別' | '週別' | '月別';
};

export default function ActivityChart({ serviceName, timeframe }: ActivityChartProps) {
  const activities: Activity[] = mockActivitiesPerService[serviceName] || [];

  // データを集計する関数（例: 日別）
  const aggregateData = (data: Activity[], timeframe: '日別' | '週別' | '月別') => {
    // ここでは簡単のため日別データをそのまま使用
    // 実際には週別・月別に集計するロジックを実装
    return data;
  };

  const aggregatedData = aggregateData(activities, timeframe);

  const chartData = {
    labels: aggregatedData.map((activity) => activity.date),
    datasets: [
      {
        label: "Completed Tasks",
        data: aggregatedData.map((activity) => activity.completed),
        borderColor: "rgba(59, 130, 246, 1)", // Tailwindのindigo-500
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
      {
        label: "Total Tasks",
        data: aggregatedData.map((activity) => activity.total),
        borderColor: "rgba(239, 68, 68, 1)", // Tailwindのred-500
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${serviceName} - ${timeframe}の取り組み履歴`,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <Line data={chartData} options={options} />
    </div>
  );
}
