"use client";

import React, { useState } from "react";

/**
 * Props for the QuestionForm component.
 */
interface QuestionFormProps {
    problemId: string;
}

/**
 * QuestionForm component allows users to ask questions related to a specific problem.
 * @param problemId - The ID of the selected problem.
 * @returns JSX Element for the question form.
 */
const QuestionForm: React.FC<QuestionFormProps> = ({ problemId }) => {
    const [question, setQuestion] = useState<string>("");
    const [answer, setAnswer] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handles the form submission to ask a question.
     * @param e - The form submission event.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAnswer("");

        try {
            const response = await fetch("/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question, problemId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "An error occurred.");
            } else {
                setAnswer(data.answer);
            }
        } catch (err) {
            setError("Failed to fetch answer.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded">
            <form onSubmit={handleSubmit}>
                <label
                    htmlFor="question"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Ask a Question:
                </label>
                <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Enter your question here..."
                    required
                ></textarea>
                <button
                    type="submit"
                    className={`w-full p-2 rounded ${
                        loading
                            ? "bg-gray-400"
                            : "bg-blue-500 hover:bg-blue-700"
                    } text-white font-bold`}
                    disabled={loading}
                >
                    {loading ? "Asking..." : "Ask"}
                </button>
            </form>
            {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            {answer && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                    <h3 className="font-bold mb-2">Answer:</h3>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default QuestionForm;
