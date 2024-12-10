"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

interface ProblemSetCardProps {
    problemSet: IProblemSet;
}

const ProblemSetCard: React.FC<ProblemSetCardProps> = ({ problemSet }) => {
    const router = useRouter();

    const handleStart = () => {
        // `/dashboard` から `/activity/*` への遷移は `ProblemSetSelector` を経由して処理
        router.push("/dashboard");
        // TODO 直接遷移する場合、セッション管理を行わない(今回の仕様としては現段階では直接遷移しない)
    };

    return (
        <div className="p-6 bg-white shadow-md rounded">
            <h3 className="text-xl font-bold mb-2">{problemSet.goal}</h3>
            <p className="mb-4">Service ID: {problemSet.serviceId}</p>
            <button
                onClick={handleStart}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
                取り組む
            </button>
        </div>
    );
};

export default ProblemSetCard;
