"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { mockProblemSets } from "@/sample_datasets/v1/activity/mockProblemSets1";
import { IProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";
import { useActivity } from "@/app/_contexts/activityContext";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";

const ProblemSetSelector: React.FC = () => {
    const router = useRouter();
    const { startSession } = useActivity();

    const handleSelectProblemSet = async (problemSet: IProblemSet) => {
        // 新規セッション作成
        const newSession = new ClientActivitySession({
            sessionId: `session-${Date.now()}`,
            startedAt: new Date().toISOString(),
            history: [],
            problemSet: problemSet,
        });
        await startSession(newSession);
        // アクティビティページ(最初の問題)に遷移
        const firstProblemId = problemSet.problems[0].problemId;
        router.push(`/activity/${problemSet.serviceId}/${problemSet.categoryId}/${problemSet.stepId}/${firstProblemId}`);
    };

    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Select Problem Set</h3>
            <div className="flex space-x-4 overflow-x-auto">
                {mockProblemSets.map((problemSet) => (
                    <button
                        key={problemSet.serviceId}
                        onClick={() => handleSelectProblemSet(problemSet)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                    >
                        {problemSet.goal}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProblemSetSelector;
