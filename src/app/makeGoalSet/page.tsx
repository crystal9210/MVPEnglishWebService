"use client";
import React, { useEffect, useState } from 'react';
// import { container } from 'tsyringe';
// import { ProblemSetRepository } from '@/repositories/ProblemSetRepository';
import { ProblemSet, ProblemSetSchema } from '@/schemas/customProblemSetSchema';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { mockProblemSets } from '@/sample_datasets/v1/goals';

interface ProblemSetCardProps {
  problemSet: { id: string } & ProblemSet;
  isSelected: boolean;
  toggleSelect: (id: string) => void;
}

const ProblemSetCard: React.FC<ProblemSetCardProps> = ({ problemSet, isSelected, toggleSelect }) => {
  return (
    <div className={`border rounded p-4 shadow bg-white ${isSelected ? 'border-blue-500' : ''}`}>
      <h3 className="text-lg font-medium mb-2">Service: {problemSet.serviceId}</h3>
      <p>Category: {problemSet.categoryId || 'N/A'}</p>
      <p>Step: {problemSet.stepId || 'N/A'}</p>
      <p>Problems: {problemSet.problemIds.length}</p>
      <button
        onClick={() => toggleSelect(problemSet.id)}
        className={`mt-4 px-4 py-2 rounded ${
          isSelected ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}
      >
        {isSelected ? '選択解除' : '選択'}
      </button>
    </div>
  );
};

const MakeGoalSetPage: React.FC = () => {
  const [problemSets, setProblemSets] = useState<{ id: string } & ProblemSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
//   const problemSetRepo = container.resolve(ProblemSetRepository);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Firestoreから問題セットを取得するロジックを実装
      // ここではモックデータを使用
      setProblemSets(mockProblemSets);
    }
  }, [status, session]);

  const toggleSelect = (id: string) => {
    setSelectedSets(prev =>
      prev.includes(id) ? prev.filter(setId => setId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (selectedSets.length === 0) {
      alert('少なくとも1つの問題セットを選択してください');
      return;
    }
    // 目標作成ロジックを実装
    // ここでは選択した問題セットを保存し、目標管理ページに戻る
    router.push('/goals');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4">
      <div className="flex justify-between items-center mb-12 mt-8">
        <h1 className="text-4xl font-bold text-indigo-600">Select Problem Sets</h1>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          保存
        </button>
      </div>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {problemSets.map(set => (
            <ProblemSetCard
              key={set.id}
              problemSet={set}
              isSelected={selectedSets.includes(set.id)}
              toggleSelect={toggleSelect}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MakeGoalSetPage;
