"use client";

import React, { useEffect, useState } from "react";
import { useActivity } from "@/app/_contexts/activitySessionContext";
import { ClientActivitySessionType } from "@/schemas/activity/clientSide/clientActivitySessionSchema";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";

interface ClientActivitySession extends ClientActivitySessionType{}

const ManageActivityPage = () => {
    const {
        getAllSessions,
        deleteSession,
        updateSession,
        getAllHistory,
        deleteHistoryItem,
        updateHistoryItem
    } = useActivity();
    const [sessions, setSessions] = useState<ClientActivitySession[]>([]);
    const [history, setHistory] = useState<{ id: number; sessionId: string; historyItem: ClientActivitySessionHistoryItem }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedSessions = await getAllSessions();
                setSessions(fetchedSessions);
                const fetchedHistory = await getAllHistory();
                setHistory(fetchedHistory);
            } catch (err) {
                console.error(err);
                setError("データの取得に失敗しました。");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [getAllSessions, getAllHistory]);

    const handleDeleteSession = async (sessionId: string) => {
        if (confirm(`セッションID ${sessionId} を本当に削除しますか？`)) {
            try {
                await deleteSession(sessionId);
                setSessions(prev => prev.filter(session => session.sessionId !== sessionId));
                alert("セッションを削除しました。");
            } catch (err) {
                console.error(err);
                alert("セッションの削除に失敗しました。");
            }
        }
    };

    const handleUpdateSession = async (sessionId: string) => {
        const newGoal = prompt("新しいゴールを入力してください:");
        if (newGoal) {
            try {
                const session = sessions.find(s => s.sessionId === sessionId);
                if (!session) {
                    throw new Error("セッションが見つかりません。");
                }
                const updatedProblemSet = {
                    ...session.problemSet,
                    goal: newGoal
                };
                await updateSession(sessionId, { problemSet: updatedProblemSet });
                setSessions(prev =>
                    prev.map(session =>
                        session.sessionId === sessionId
                            ? { ...session, problemSet: updatedProblemSet }
                            : session
                    )
                );
                alert("セッションを更新しました。");
            } catch (err) {
                console.error(err);
                alert("セッションの更新に失敗しました。");
            }
        }
    };

    const handleDeleteHistoryItem = async (id: number) => {
        if (confirm(`履歴ID ${id} を本当に削除しますか？`)) {
            try {
                await deleteHistoryItem(id);
                setHistory(prev => prev.filter(item => item.id !== id));
                alert("履歴を削除しました。");
            } catch (err) {
                console.error(err);
                alert("履歴の削除に失敗しました。");
            }
        }
    };

    const handleUpdateHistoryItem = async (id: number) => {
        const newResult = prompt("結果を 'correct' または 'incorrect' に更新してください:");
        if (newResult && (newResult === "correct" || newResult === "incorrect")) {
            try {
                await updateHistoryItem(id, { result: newResult });
                setHistory(prev =>
                    prev.map(item =>
                        item.id === id
                            ? { ...item, historyItem: { ...item.historyItem, result: newResult } }
                            : item
                    )
                );
                alert("履歴を更新しました。");
            } catch (err) {
                console.error(err);
                alert("履歴の更新に失敗しました。");
            }
        } else {
            alert("有効な結果を入力してください。");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Activity Management</h1>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
                {sessions.length === 0 ? (
                    <p>No sessions found.</p>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Session ID</th>
                                <th className="py-2 px-4 border-b">Started At</th>
                                <th className="py-2 px-4 border-b">Goal</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map(session => (
                                <tr key={session.sessionId}>
                                    <td className="py-2 px-4 border-b">{session.sessionId}</td>
                                    <td className="py-2 px-4 border-b">{new Date(session.startedAt).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b">{session.problemSet.goal}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleUpdateSession(session.sessionId)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                                        >
                                            更新
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session.sessionId)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">History</h2>
                {history.length === 0 ? (
                    <p>No history records found.</p>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">History ID</th>
                                <th className="py-2 px-4 border-b">Session ID</th>
                                <th className="py-2 px-4 border-b">Problem ID</th>
                                <th className="py-2 px-4 border-b">Result</th>
                                <th className="py-2 px-4 border-b">Attempts</th>
                                <th className="py-2 px-4 border-b">Last Attempt</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.id}>
                                    <td className="py-2 px-4 border-b">{item.id}</td>
                                    <td className="py-2 px-4 border-b">{item.sessionId}</td>
                                    <td className="py-2 px-4 border-b">{item.historyItem.problemId}</td>
                                    <td className="py-2 px-4 border-b">{item.historyItem.result}</td>
                                    <td className="py-2 px-4 border-b">{item.historyItem.attempts}</td>
                                    <td className="py-2 px-4 border-b">{new Date(item.historyItem.lastAttemptAt).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleUpdateHistoryItem(item.id)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                                        >
                                            更新
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHistoryItem(item.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default ManageActivityPage;
