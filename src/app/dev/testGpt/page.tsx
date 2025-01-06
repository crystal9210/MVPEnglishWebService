"use client";

import React, { useState } from "react";
import { sampleProblems } from "@/sample_datasets/testGpt/sampleProblems";

/**
 * 型定義
 */
type UserQuestion = {
    problemId: string;
    customQuestion: string;
};

type AIResponse = {
    problemId: string;
    question: string;
    answer: string;
};

/**
 * TestLLMPageコンポーネント
 *
 * ユーザーが複数のサンプル問題を選択し、それぞれに対するカスタム質問を設定してLLMサービスからの回答を取得・表示。
 */
const TestLLMPage: React.FC = () => {
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [userQuestions, setUserQuestions] = useState<{
        [key: string]: string;
    }>({});
    const [aiResponses, setAIResponses] = useState<AIResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * チェックボックスの変更ハンドラー
     *
     * 問題の選択・解除を管理。
     * @param problemId 選択された問題のID
     */
    const handleCheckboxChange = (problemId: string) => {
        setSelectedProblems((prev) => {
            if (prev.includes(problemId)) {
                const updated = prev.filter((id) => id !== problemId);
                const { [problemId]: _, ...rest } = userQuestions;
                setUserQuestions(rest);
                return updated;
            } else {
                return [...prev, problemId];
            }
        });
    };

    /**
     * 質問入力の変更ハンドラー
     *
     * 各問題に対するカスタム質問を管理。
     * @param problemId 問題のID
     * @param question 質問内容
     */
    const handleQuestionChange = (problemId: string, question: string) => {
        setUserQuestions((prev) => ({
            ...prev,
            [problemId]: question,
        }));
    };

    /**
     * フォームの送信ハンドラー
     *
     * 選択された問題IDとカスタム質問をAPIエンドポイントに送信し、回答を取得。
     * @param e フォーム送信イベント
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 質問が設定されていない問題がある場合のバリデーション
        const incompleteQuestions = selectedProblems.filter(
            (id) => !userQuestions[id] || userQuestions[id].trim() === ""
        );
        if (incompleteQuestions.length > 0) {
            setError("Please set a custom question for all selected problems.");
            setLoading(false);
            return;
        }
        // APIリクエスト準備
        const questions: UserQuestion[] = selectedProblems.map((id) => ({
            problemId: id,
            customQuestion: userQuestions[id],
        }));

        try {
            const res = await fetch("/api/dev/test-llm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ questions }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "An error occurred.");
            } else {
                setAIResponses((prev) => [...prev, ...data.responses]);
            }
        } catch (err) {
            setError("Failed to fetch AI responses.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-gray-800">
                    LLM Service Test
                </h1>
            </header>

            <main className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Select Sample Problems
                        </h2>
                        <div className="space-y-4">
                            {sampleProblems.map((problem) => (
                                <div key={problem.id} className="flex flex-col">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`problem-${problem.id}`}
                                            name={`problem-${problem.id}`}
                                            value={problem.id}
                                            checked={selectedProblems.includes(
                                                problem.id
                                            )}
                                            onChange={() =>
                                                handleCheckboxChange(problem.id)
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor={`problem-${problem.id}`}
                                            className="ml-2 block text-gray-700"
                                        >
                                            <span className="font-semibold">
                                                {problem.number}.{" "}
                                                {problem.title}:
                                            </span>{" "}
                                            {problem.description ||
                                                problem.text}
                                        </label>
                                    </div>
                                    {selectedProblems.includes(problem.id) && (
                                        <div className="mt-2 ml-6">
                                            <label
                                                htmlFor={`customQuestion-${problem.id}`}
                                                className="block text-gray-600 mb-1"
                                            >
                                                Custom Question:
                                            </label>
                                            <input
                                                type="text"
                                                id={`customQuestion-${problem.id}`}
                                                name={`customQuestion-${problem.id}`}
                                                value={
                                                    userQuestions[problem.id] ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleQuestionChange(
                                                        problem.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="Enter your custom question..."
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <button
                        type="submit"
                        className={`w-full p-2 rounded ${
                            loading
                                ? "bg-gray-400"
                                : "bg-blue-500 hover:bg-blue-700"
                        } text-white font-bold`}
                        disabled={loading}
                    >
                        {loading ? "Testing..." : "Test LLM Service"}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                        <p>{error}</p>
                    </div>
                )}

                {aiResponses.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            AI Responses
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {aiResponses.map((response, index) => {
                                const problem = sampleProblems.find(
                                    (p) => p.id === response.problemId
                                );
                                return (
                                    <div
                                        key={`${response.problemId}-${index}`}
                                        className="p-4 bg-white shadow rounded flex"
                                    >
                                        <div className="w-1/2 pr-2 border-r border-gray-300">
                                            <h3 className="text-xl font-medium text-gray-800">
                                                {problem?.number}.{" "}
                                                {problem?.title ||
                                                    "Unknown Problem"}
                                            </h3>
                                            <p className="mt-2 text-gray-700">
                                                <strong>Question:</strong>{" "}
                                                {response.question}
                                            </p>
                                        </div>
                                        <div className="w-1/2 pl-2">
                                            <h3 className="text-xl font-medium text-gray-800">
                                                Answer:
                                            </h3>
                                            <p className="mt-2 text-gray-700">
                                                {response.answer}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default TestLLMPage;
