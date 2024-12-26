"use client";

import React, { useState } from "react";
import { useActivity } from "@/app/_contexts/activitySessionContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ResultsPageComponent = () => {
    const { session } = useActivity();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const router = useRouter();

    const handleSaveToDB = async () => {
        if (!session) {
            toast.error("No active session to save.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch("/api/activities/results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(session),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save session");
            }

            toast.success("Session saved to database successfully!");
        } catch (error) {
            console.error("Error saving session:", error);
            toast.error("Failed to save session to database.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGoToDashboard = () => {
        router.push("/dashboard");
    };

    return (
        <div className="p-8 bg-white text-black min-h-screen">
            {/* ヘッダーセクション */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Results for Session: {session?.sessionId}</h2>
                <button
                    onClick={handleGoToDashboard}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Go to Dashboard
                </button>
            </div>

            {/* セッション開始日時 */}
            <p className="mb-6">Started At: {session ? new Date(session.startedAt).toLocaleString() : "N/A"}</p>

            {/* 問題セットの詳細表示 */}
            {session?.problemSet && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Problem Set</h3>
                    <p><strong>Goal:</strong> {session.problemSet.goal}</p>
                    <p><strong>Service ID:</strong> {session.problemSet.serviceId}</p>
                    {session.problemSet.categoryId && <p><strong>Category ID:</strong> {session.problemSet.categoryId}</p>}
                    {session.problemSet.stepId && <p><strong>Step ID:</strong> {session.problemSet.stepId}</p>}
                    <div className="mt-2">
                        <strong>Problems:</strong>
                        <ul className="list-disc list-inside">
                            {session.problemSet.problems.map(problem => (
                                <li key={problem.problemId}>
                                    <strong>Question:</strong> {problem.question} <br />
                                    <strong>Correct Answer:</strong> {problem.correctAnswer}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* 履歴の表示 */}
            {session?.history && session.history.length > 0 ? (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">History</h3>
                    <table className="min-w-full bg-gray-100 text-left">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Problem ID</th>
                                <th className="py-2 px-4 border-b">Result</th>
                                <th className="py-2 px-4 border-b">Attempts</th>
                                <th className="py-2 px-4 border-b">Last Attempt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {session.history.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-200">
                                    <td className="py-2 px-4 border-b">{item.problemId}</td>
                                    <td className="py-2 px-4 border-b capitalize">{item.result}</td>
                                    <td className="py-2 px-4 border-b">{item.attempts}</td>
                                    <td className="py-2 px-4 border-b">{new Date(item.lastAttemptAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="mb-6">No history records found.</p>
            )}

            {/* データベースに保存するボタン */}
            <button
                onClick={handleSaveToDB}
                disabled={isSaving}
                className={`mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {isSaving ? "Saving..." : "Save to DB"}
            </button>
        </div>
    );
};

export default ResultsPageComponent;
