"use client";
import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { mockProblemSets } from "@/sample_datasets/v1/activity/mockProblemSets1";
import { ProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";
import { useActivity } from "@/app/_contexts/activityContext";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";

const ProblemSetSelector: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const { serviceId, categoryId, stepId } = params;
    const { startSession } = useActivity();

    useEffect(() => {
        console.log("ProblemSetSelector params:", { serviceId, categoryId, stepId });
    }, [serviceId, categoryId, stepId]);

    if (!serviceId || !categoryId || !stepId) {
        return <p>Invalid selection parameters.</p>;
    }

    const filteredProblemSets = mockProblemSets.filter(ps =>
        ps.serviceId === serviceId &&
        (ps.categoryId ?? "defaultCategory") === categoryId &&
        (ps.stepId ?? "defaultStep") === stepId
    );

    if (filteredProblemSets.length === 0) {
        return <p>選択された条件に一致する問題セットがありません。</p>;
    }

    const handleSelectProblemSet = async (problemSet: ProblemSet) => {
        // 新規セッション作成
        const newSession = new ClientActivitySession({
            sessionId: `session-${Date.now()}`,
            startedAt: new Date().toISOString(),
            history: [],
            problemSet: problemSet,
        });
        console.log("Starting session:", newSession);
        await startSession(newSession);
        // アクティビティページ(最初の問題)に遷移
        const firstProblemId = problemSet.problems[0].problemId;
        console.log("Navigating to first problem:", firstProblemId);
        router.push(`/activity/${problemSet.serviceId}/${problemSet.categoryId}/${problemSet.stepId}/${firstProblemId}`);
    };

    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Select Problem Set</h3>
            <div className="flex space-x-4 overflow-x-auto">
                {filteredProblemSets.map((problemSet) => (
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
