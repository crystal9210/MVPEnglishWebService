// app/dashboard/_components/GoalProgress.tsx

"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { mockGoalsPerService, GoalItem } from "./mockData";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

type GoalProgressProps = {
  serviceName: string;
};

export default function GoalProgress({ serviceName }: GoalProgressProps) {
  const goals: GoalItem[] = mockGoalsPerService[serviceName] || [];

  // ダミーデータ: 各目標の達成度（0〜100）
  const goalProgress: Record<string, number> = {
    "Master all grammar units": 70,
    "Achieve 90% score on quizzes": 85,
    "Complete daily grammar exercises": 60,
    "Expand vocabulary by 500 words": 50,
    // 他の目標
  };

  const chartData = {
    labels: goals.map((goal) => goal.task),
    datasets: [
      {
        label: "達成度 (%)",
        data: goals.map((goal) => goalProgress[goal.task] || 0),
        backgroundColor: "rgba(59, 130, 246, 0.6)", // Tailwindのindigo-500
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${serviceName} - 目標達成度`,
      },
    },
    scales: {
      x: {
        max: 100,
        title: {
          display: true,
          text: "達成度 (%)",
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <Bar data={chartData} options={options} />
    </div>
  );
}
