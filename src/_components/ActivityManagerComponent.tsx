"use client";
import React, { useState } from "react";
import { useActivity } from "@/app/_contexts/activityContext";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ActivityManagerComponent = () => {
    const { session, startSession, submitAnswer, endSession, getSessionHistory } = useActivity();
    const [problemId, setProblemId] = useState<string>("");
    const [result, setResult] = useState<"correct" | "incorrect">("correct");
    const [attempts, setAttempts] = useState<number>(1);
    const [notes, setNotes] = useState<string>("");

    const router = useRouter();

    const handleStartSession = async () => {
        const newSession = new ClientActivitySession({
            sessionId: `session-${Date.now()}`,
            startedAt: new Date().toISOString(),
            history: [],
        });
        await startSession(newSession);
        toast.success("Session started successfully!");
    };

    const handleSubmit = async () => {
        if (!session) return;
        if (!problemId.trim()) {
            toast.error("Problem ID cannot be empty.");
            return;
        }
        const historyItem = new ClientActivitySessionHistoryItem({
            problemId,
            result,
            attempts,
            lastAttemptAt: new Date().toISOString(),
            notes: notes.trim() ? notes : undefined,
        });
        try {
            await submitAnswer(historyItem);
            toast.success("Answer submitted successfully!");
            // フォームのリセット
            setProblemId("");
            setResult("correct");
            setAttempts(1);
            setNotes("");
        } catch (error) {
            console.error("Failed to submit answer", error);
            toast.error("Failed to submit answer.");
        }
    };

    const handleEndSession = async () => {
        try {
            await endSession();
            toast.success("Session ended successfully!");
            // 必要に応じてページ遷移・UIの更新
            router.push("/dashboard"); // 例: ダッシュボードに戻る
        } catch (error) {
            console.error("Failed to end session", error);
            toast.error("Failed to end session.");
        }
    };

    const handleViewHistory = async () => {
        if (!session) return;
        try {
            const history = await getSessionHistory(session.sessionId);
            console.log(history);
            toast.info("History fetched successfully. Check console for details.");
            // 必要に応じて UI に表示
        } catch (error) {
            console.error("Failed to fetch history", error);
            toast.error("Failed to fetch history.");
        }
    };

    if (!session) {
        return (
            <div className="p-8 bg-white shadow-md rounded">
                <p>No active session.</p>
                <button
                    onClick={handleStartSession}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Start Session
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Activity Session: {session.sessionId}</h2>
            <p className="mb-6">Started At: {session.startedAt}</p>
            <div className="mb-6">
                <h3 className="text-xl mb-2">Submit Answer</h3>
                <input
                    type="text"
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                    placeholder="Problem ID"
                    className="border p-2 rounded w-full mb-4"
                />
                <select
                    value={result}
                    onChange={(e) => setResult(e.target.value as "correct" | "incorrect")}
                    className="border p-2 rounded w-full mb-4"
                >
                    <option value="correct">Correct</option>
                    <option value="incorrect">Incorrect</option>
                </select>
                <input
                    type="number"
                    value={attempts}
                    onChange={(e) => setAttempts(Number(e.target.value))}
                    min={1}
                    placeholder="Attempts"
                    className="border p-2 rounded w-full mb-4"
                />
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="border p-2 rounded w-full mb-4"
                />
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Submit Answer
                </button>
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={handleEndSession}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                >
                    End Session
                </button>
                <button
                    onClick={handleViewHistory}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                >
                    View History
                </button>
                <button
                    onClick={() => router.push("/activity/results")}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
                >
                    View Results
                </button>
            </div>
        </div>
    );
};

export default ActivityManagerComponent;
