// src/app/activity/[serviceId]/[categoryId]/[stepId]/[problemId]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useActivity } from "@/app/_contexts/activityContext";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";
import { toast } from "react-toastify";
import ProblemSetSelector from "@/app/_components/problemSetSelector";
import { mockProblemSets } from "@/sample_datasets/v1/activity/mockProblemSets1";
import { IProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

const ActivityPage = () => {
    const router = useRouter();
    const params = useParams();
    const { session, submitAnswer, getSessionHistory } = useActivity();

    const [currentProblem, setCurrentProblem] = useState<{
        problemId: string;
        question: string;
        correctAnswer: string;
    } | null>(null);
    const [answer, setAnswer] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");
    const [isLastProblem, setIsLastProblem] = useState<boolean>(false);

    useEffect(() => {
        if (!session) {
            // セッションがない場合は ActivityLayout でリダイレクトされます
            return;
        }

        const { serviceId, categoryId, stepId, problemId } = params;

        if (serviceId && categoryId && stepId && problemId) {
            const problemSet = session.problemSet;
            const problem = problemSet.problems.find(
                (p) => p.problemId === problemId
            );
            if (problem) {
                setCurrentProblem(problem);
            } else {
                toast.error("Problem not found.");
                router.push("/dashboard");
            }
        }
    }, [params, router, session]);

    const handleSubmitAnswer = async () => {
        if (!currentProblem || !session) return;
        if (!answer.trim()) {
            toast.error("Answer cannot be empty.");
            return;
        }

        const isCorrect = answer.trim().toLowerCase() === currentProblem.correctAnswer.toLowerCase();

        // 履歴アイテムの作成
        const historyItem = new ClientActivitySessionHistoryItem({
            problemId: currentProblem.problemId,
            result: isCorrect ? "correct" : "incorrect",
            attempts: 1, // 必要に応じて増加させる
            lastAttemptAt: new Date().toISOString(),
            notes: isCorrect ? undefined : "Incorrect answer.",
        });

        try {
            await submitAnswer(historyItem);
            toast.success("Answer submitted successfully!");
            setFeedback(isCorrect ? "Correct answer!" : "Incorrect answer.");
            setAnswer("");

            // 全ての問題が解答されたか確認
            const updatedHistory = await getSessionHistory(session.sessionId);
            const totalProblems = session.problemSet.problems.length;
            if (updatedHistory.length >= totalProblems) {
                setIsLastProblem(true);
            }
        } catch (error) {
            console.error("Failed to submit answer", error);
            toast.error("Failed to submit answer.");
            setFeedback("Failed to submit answer.");
        }
    };

    const handleNextProblem = () => {
        if (!currentProblem) return;
        const { serviceId, categoryId, stepId, problemId } = params;

        const problemSet = session?.problemSet;
        if (!problemSet) {
            toast.error("Problem set not found.");
            router.push("/dashboard");
            return;
        }

        const problemOrder = problemSet.problems.map((p) => p.problemId);
        const currentIndex = problemOrder.indexOf(currentProblem.problemId);
        const nextIndex = currentIndex + 1;

        if (nextIndex < problemOrder.length) {
            const nextProblemId = problemOrder[nextIndex];
            router.push(`/activity/${serviceId}/${categoryId}/${stepId}/${nextProblemId}`);
        } else {
            // 全ての問題が終了した場合
            setIsLastProblem(true);
            toast.info("All problems completed. You can view your results.");
        }
    };

    const handleViewResults = () => {
        router.push("/activity/results");
    };

    if (!currentProblem) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-8">
            <ProblemSetSelector />
            <div className="bg-white shadow-md rounded p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Problem: {currentProblem.problemId}</h2>
                <p className="mb-4">{currentProblem.question}</p>
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer"
                    className="border p-2 rounded w-full mb-4"
                />
                <button
                    onClick={handleSubmitAnswer}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mr-4"
                >
                    Submit Answer
                </button>
                <button
                    onClick={handleNextProblem}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Next
                </button>
                {feedback && <p className="mt-4 text-green-500">{feedback}</p>}
            </div>
            {isLastProblem && (
                <div className="fixed bottom-4 right-4">
                    <button
                        onClick={handleViewResults}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        結果詳細
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityPage;
