"use client";

import React, { useState } from "react";
import { Problem } from "@/schemas/problemSchemas";
import { QUESTION_TYPES } from "@/constants/problemTypes";
import { SERVICE_IDS } from "@/constants/serviceIds";
import { PROBLEM_DIFFICULTY_LEVEL_TYPES } from "@/constants/userStatisticTypes";

/**
 * Sample problems for demonstration purposes.
 */
const sampleProblems: Problem[] = [
    {
        id: "problem1",
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
        serviceId: SERVICE_IDS.WRITING,
        categoryId: "categoryX",
        stepId: "stepY",
        title: "What is the capital of France?",
        description: "Choose the correct capital city of France.",
        difficulty: PROBLEM_DIFFICULTY_LEVEL_TYPES.EASY,
        tags: ["geography", "capital"],
        problemText: "Select the correct capital of France.",
        items: [
            {
                options: [
                    { text: "Berlin", images: [] },
                    { text: "Madrid", images: [] },
                    { text: "Paris", images: [] },
                    { text: "Rome", images: [] },
                ],
                correctAnswer: "Paris",
                tips: ["It's also known as the City of Light."],
            },
        ],
    },
    // Add more problems as needed
];

/**
 * DownloadProblemSetPage component allows users to generate and download PDF files.
 */
const DownloadProblemSetPage: React.FC = () => {
    const [title, setTitle] = useState<string>("Custom Problem Set");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles PDF generation and download.
     *
     * @param type - Type of PDF to generate ("problems", "answers-memos", or "combined")
     */
    const handleDownloadPDF = async (
        type: "problems" | "answers-memos" | "combined"
    ) => {
        setLoading(true);
        setError(null);

        // Sample answers and memos
        const answers: Record<string, string> = {
            problem1: "Paris",
            // Add more answers as needed
        };

        const memos: Record<string, string[]> = {
            problem1: ["Remember to associate the capital with its country."],
            // Add more memos as needed
        };

        try {
            // Determine the API endpoint based on PDF type
            let endpoint: string;
            let downloadName: string;

            switch (type) {
                case "problems":
                    endpoint = "/api/dev/generate-pdf";
                    downloadName = `${title}.pdf`;
                    break;
                case "answers-memos":
                    endpoint = "/api/dev/generate-pdf/answers-memos";
                    downloadName = "answers-memos.pdf";
                    break;
                case "combined":
                    endpoint = "/api/dev/generate-pdf/combined";
                    downloadName = "combined-problem-set.pdf";
                    break;
                default:
                    throw new Error("Invalid PDF type.");
            }

            // Prepare the request payload
            const payload = {
                title:
                    type === "problems"
                        ? title
                        : type === "answers-memos"
                        ? "Answers and Memos"
                        : "Combined Problem Set",
                problems: sampleProblems,
                answers,
                memos,
            };

            // Send POST request to the API endpoint
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // If the response is not ok, extract and throw the error message
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate PDF.");
            }

            // Create a blob from the PDF buffer
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header Section */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-gray-800">
                    Download Problem Set PDF
                </h1>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto">
                {/* PDF Title Input */}
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 mb-2">
                        PDF Title:
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-gray-700"
                        placeholder="Enter PDF title..."
                    />
                </div>

                {/* Download Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => handleDownloadPDF("problems")}
                        className={`w-full p-2 rounded ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-700"
                        } text-white font-bold`}
                        disabled={loading}
                    >
                        {loading
                            ? "Generating PDF..."
                            : "Download Problems PDF"}
                    </button>

                    <button
                        onClick={() => handleDownloadPDF("answers-memos")}
                        className={`w-full p-2 rounded ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-700"
                        } text-white font-bold`}
                        disabled={loading}
                    >
                        {loading
                            ? "Generating PDF..."
                            : "Download Answers & Memos PDF"}
                    </button>

                    <button
                        onClick={() => handleDownloadPDF("combined")}
                        className={`w-full p-2 rounded ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-500 hover:bg-purple-700"
                        } text-white font-bold`}
                        disabled={loading}
                    >
                        {loading
                            ? "Generating PDF..."
                            : "Download Combined PDF"}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                        <p>{error}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DownloadProblemSetPage;
