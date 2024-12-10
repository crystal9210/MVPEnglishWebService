"use client";
import React, { useState } from "react";
import { useActivity } from "@/app/_contexts/activityContext";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";
import { toast } from "react-toastify";

const ActivityStepComponent = () => {
    const { session, submitAnswer } = useActivity();
    const [answer, setAnswer] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");

    const handleSubmitAnswer = async () => {
        if (!session) return;
        if (!answer.trim()) {
            toast.error("Answer cannot be empty.");
            return;
        }
        const correctAnswer = "went"; // 正解の例
        const isCorrect = answer.trim().toLowerCase() === correctAnswer;

        const historyItem: ClientActivitySessionHistoryItem = {
            problemId: "category1-step2-problem1",
            result: isCorrect ? "correct" : "incorrect",
            attempts: 1, // 必要に応じて増加させる
            lastAttemptAt: new Date().toISOString(),
            notes: isCorrect ? undefined : "Incorrect answer.",
        };
        try {
            await submitAnswer(historyItem);
            toast.success("Answer submitted successfully!");
            setAnswer("");
            setFeedback(isCorrect ? "Correct answer!" : "Incorrect answer.");
        } catch (error) {
            console.error("Failed to submit answer", error);
            toast.error("Failed to submit answer.");
            setFeedback("Failed to submit answer.");
        }
    };

    return (
        <div className="p-8 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Session: {session?.sessionId}</h2>
            <h3 className="text-xl mb-2">Category 1 - Step 2</h3>
            <p className="mb-4">Problem: What is the past tense of "go"?</p>
            <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer"
                className="border p-2 rounded w-full mb-4"
            />
            <button
                onClick={handleSubmitAnswer}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
                Submit Answer
            </button>
            {feedback && <p className="mt-4 text-green-500">{feedback}</p>}
        </div>
    );
};

export default ActivityStepComponent;
