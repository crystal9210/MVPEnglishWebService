"use client";

import React, { useEffect, useState } from "react";
import { container } from "tsyringe";
import { IProblemService } from "@/interfaces/services/IProblemService";
import { IRAGService } from "@/interfaces/services/IRAGService";
import { Problem } from "@/schemas/problemSchemas";
import QuestionForm from "@/components/dev/QuestionForm";

/**
 * HomePage component displays a list of sample problems and allows users to ask questions.
 */
const HomePage: React.FC = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
        null
    );

    // サービスの解決
    const problemService =
        container.resolve<IProblemService>("IProblemService");
    const ragService = container.resolve<IRAGService>("IRAGService");

    useEffect(() => {
        async function fetchProblems() {
            try {
                const fetchedProblems =
                    await problemService.getProblemsByCategory("grammar");
                setProblems(fetchedProblems);
            } catch (err) {
                console.error("Failed to fetch problems:", err);
            }
        }
        fetchProblems();
    }, [problemService]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-gray-800">
                    English Learning Q&A
                </h1>
            </header>

            <main className="max-w-4xl mx-auto">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Sample Problems
                    </h2>
                    <div className="space-y-4">
                        {problems.map((problem) => (
                            <div
                                key={problem.id}
                                className="p-4 bg-white shadow rounded"
                            >
                                <h3 className="text-xl font-medium text-gray-800">
                                    Problem ID: {problem.id}
                                </h3>
                                <p className="mt-2 text-gray-700">
                                    <strong>Title:</strong> {problem.title}
                                </p>
                                <p className="mt-1 text-gray-700">
                                    <strong>Description:</strong>{" "}
                                    {problem.description || "N/A"}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {problem.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                                    onClick={() => setSelectedProblem(problem)}
                                >
                                    Ask a Question
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {selectedProblem && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Ask a Question
                        </h2>
                        <div className="p-4 bg-white shadow rounded">
                            <h3 className="text-lg font-medium text-gray-800">
                                Selected Problem: {selectedProblem.title}
                            </h3>
                            {"problemText" in selectedProblem &&
                                selectedProblem.problemText && (
                                    <p className="mt-2 text-gray-700">
                                        <strong>Problem Text:</strong>{" "}
                                        {selectedProblem.problemText}
                                    </p>
                                )}
                            {"inputs" in selectedProblem &&
                                selectedProblem.inputs.length > 0 && (
                                    <p className="mt-2 text-gray-700">
                                        <strong>Correct Answer:</strong>{" "}
                                        {
                                            selectedProblem.inputs[0]
                                                .correctAnswer
                                        }
                                    </p>
                                )}
                            {/* Additional problem details can be added here */}
                        </div>
                        <QuestionForm problemId={selectedProblem.id} />
                        <button
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                            onClick={() => setSelectedProblem(null)}
                        >
                            Close
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
};

export default HomePage;
