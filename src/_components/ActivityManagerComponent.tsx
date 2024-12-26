"use client";

import React, { useState } from "react";
import { useActivity } from "@/app/_contexts/activitySessionContext";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'; // UUIDのインポート

const ActivityManagerComponent = () => {
    const { state, dispatch } = useActivity();
    const { session } = state;
    const [problemId, setProblemId] = useState<string>("");
    const [result, setResult] = useState<"correct" | "incorrect">("correct");
    const [attempts, setAttempts] = useState<number>(1);
    const [notes, setNotes] = useState<string>("");

    const router = useRouter();

    const handleStartSession = async () => {
        const newSession = new ClientActivitySession({
            sessionId: `session-${Date.now()}`,
            startedAt: new Date(), // Dateオブジェクトを直接渡す
            history: [],
        });
        dispatch({ type: "START_SESSION", payload: newSession });
        toast.success("セッションが正常に開始されました！");
        // IndexedDBやFirestoreへの保存処理を必要に応じて追加
    };

    const handleSubmit = async () => {
        if (!session) return;
        if (!problemId.trim()) {
            toast.error("問題IDは空にできません。");
            return;
        }
        const historyItem = new ClientActivitySessionHistoryItem({
            id: uuidv4(), // ユニークなIDを生成
            problemId,
            result,
            attempts,
            lastAttemptAt: new Date(), // Dateオブジェクトを渡す
            notes: notes.trim() ? notes : undefined,
        });
        try {
            dispatch({ type: "SUBMIT_ANSWER", payload: historyItem });
            toast.success("回答が正常に提出されました！");
            // IndexedDBやFirestoreへの保存処理を必要に応じて追加
            // フォームのリセット
            setProblemId("");
            setResult("correct");
            setAttempts(1);
            setNotes("");
        } catch (error) {
            console.error("回答の提出に失敗しました", error);
            toast.error("回答の提出に失敗しました。");
        }
    };

    const handleEndSession = async () => {
        try {
            dispatch({ type: "END_SESSION" });
            toast.success("セッションが正常に終了しました！");
            // IndexedDBやFirestoreへの保存処理を必要に応じて追加
            router.push("/dashboard");
        } catch (error) {
            console.error("セッションの終了に失敗しました", error);
            toast.error("セッションの終了に失敗しました。");
        }
    };

    const handleViewHistory = async () => {
        if (!session) return;
        try {
            // IndexedDBまたはFirestoreから履歴を取得
            const history = await getSessionHistory(session.sessionId); // この関数は実装が必要
            dispatch({ type: "SET_HISTORY", payload: history });
            console.log(history);
            toast.info("履歴が正常に取得されました。コンソールを確認してください。");
            // 必要に応じてUIに履歴を表示
        } catch (error) {
            console.error("履歴の取得に失敗しました", error);
            toast.error("履歴の取得に失敗しました。");
        }
    };

    if (!session) {
        return (
            <div className="p-8 bg-white shadow-md rounded">
                <p>アクティブなセッションがありません。</p>
                <button
                    onClick={handleStartSession}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                >
                    セッションを開始
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">アクティビティセッション: {session.sessionId}</h2>
            <p className="mb-6">開始時刻: {session.startedAt.toLocaleString()}</p>
            <div className="mb-6">
                <h3 className="text-xl mb-2">回答の提出</h3>
                <input
                    type="text"
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                    placeholder="問題ID"
                    className="border p-2 rounded w-full mb-4"
                />
                <select
                    value={result}
                    onChange={(e) => setResult(e.target.value as "correct" | "incorrect")}
                    className="border p-2 rounded w-full mb-4"
                >
                    <option value="correct">正解</option>
                    <option value="incorrect">不正解</option>
                </select>
                <input
                    type="number"
                    value={attempts}
                    onChange={(e) => setAttempts(Number(e.target.value))}
                    min={1}
                    placeholder="試行回数"
                    className="border p-2 rounded w-full mb-4"
                />
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="オプションのメモ"
                    className="border p-2 rounded w-full mb-4"
                />
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                    回答を提出
                </button>
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={handleEndSession}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                >
                    セッションを終了
                </button>
                <button
                    onClick={handleViewHistory}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                >
                    履歴を見る
                </button>
                <button
                    onClick={() => router.push("/activity/results")}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
                >
                    結果を見る
                </button>
            </div>
        </div>
    );
};

export default ActivityManagerComponent;
