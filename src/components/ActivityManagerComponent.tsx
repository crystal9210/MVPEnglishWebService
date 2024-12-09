"use client";
import React, { useState } from 'react';
import { useActivity } from '@/contexts/activityContext';
import { UserHistoryItem } from '@/domain/entities/userHistoryItem';

const ActivityManagerComponent = () => {
    const { session, submitAnswer, endSession } = useActivity();
    const [problemId, setProblemId] = useState<string>('');
    const [result, setResult] = useState<"correct" | "incorrect">("correct");
    const [attempts, setAttempts] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');

    const handleSubmit = async () => {
        if (!session) return;
        const historyItem = new UserHistoryItem({
        problemId,
        result,
        attempts,
        lastAttemptAt: new Date().toISOString(),
        notes: notes.trim() ? notes : undefined,
        });
        try {
        await submitAnswer(historyItem);
        // フォームのリセット
        setProblemId('');
        setResult("correct");
        setAttempts(1);
        setNotes('');
        } catch (error) {
        console.error("Failed to submit answer", error);
        // 必要に応じてUIにフィードバックを提供
        }
    };

    const handleEndSession = async () => {
        try {
        await endSession();
        // 必要に応じてページ遷移やUIの更新を行う
        } catch (error) {
        console.error("Failed to end session", error);
        // 必要に応じてUIにフィードバックを提供
        }
    };

    if (!session) {
        return (
        <div>
            <p>No active session.</p>
        </div>
        );
    }

    return (
        <div>
        <h2>Activity Session: {session.sessionId}</h2>
        <div>
            <h3>Submit Answer</h3>
            <input
            type="text"
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
            placeholder="Problem ID"
            />
            <select value={result} onChange={(e) => setResult(e.target.value as "correct" | "incorrect")}>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
            </select>
            <input
            type="number"
            value={attempts}
            onChange={(e) => setAttempts(Number(e.target.value))}
            min={1}
            placeholder="Attempts"
            />
            <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
            />
            <button onClick={handleSubmit}>Submit Answer</button>
        </div>
        <button onClick={handleEndSession}>End Session</button>
        </div>
    );
};

export default ActivityManagerComponent;
