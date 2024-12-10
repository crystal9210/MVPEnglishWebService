"use client";
import React, { useEffect, useState } from "react";
import { useActivity } from "@/app/_contexts/activityContext";
import { UserHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";
import { toast } from "react-toastify";

export default function ResultsPage()  {
    const { session, getSessionHistory } = useActivity();
    const [history, setHistory] = useState<UserHistoryItem[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (session) {
                try {
                    const data = await getSessionHistory(session.sessionId);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to fetch history", error);
                    toast.error("Failed to fetch history.");
                }
            }
        };
        fetchHistory();
    }, [session, getSessionHistory]);

    if (!session) {
        return <p>No active session.</p>;
    }

    return (
        <div className="p-8 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Results for Session: {session.sessionId}</h2>
            <p className="mb-6">Started At: {session.startedAt}</p>
            <h3 className="text-xl mb-2">Submitted Answers:</h3>
            {history.length === 0 ? (
                <p>No answers submitted.</p>
            ) : (
                <ul className="list-disc pl-5">
                    {history.map((item, index) => (
                        <li key={index} className="mb-4">
                            <p>
                                <strong>Problem ID:</strong> {item.problemId}
                            </p>
                            <p>
                                <strong>Result:</strong> {item.result}
                            </p>
                            <p>
                                <strong>Attempts:</strong> {item.attempts}
                            </p>
                            <p>
                                <strong>Last Attempt At:</strong> {item.lastAttemptAt}
                            </p>
                            {item.notes && (
                                <p>
                                    <strong>Notes:</strong> {item.notes}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
