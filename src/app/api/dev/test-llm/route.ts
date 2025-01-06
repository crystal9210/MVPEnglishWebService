import { NextResponse } from "next/server";
import { container } from "tsyringe";
import { ILLMService } from "@/interfaces/services/ILLMService";
import { sampleProblems } from "@/sample_datasets/testGpt/sampleProblems";

/**
 * POST /api/test-llm
 *
 * ユーザーが選択した問題IDとカスタム質問を受け取り、それぞれの問題文と質問を組み合わせてLLMサービスに送信し、回答を取得。
 * 各回答は1000文字以内に制限。
 *
 * リクエストボディの形式:
 * {
 *   "questions": [
 *     {
 *       "problemId": "1",
 *       "customQuestion": "Can you explain why Paris is the capital?"
 *     },
 *     // ... other question from the user here.
 *   ]
 * }
 *
 * レスポンスボディの形式:
 * {
 *   "responses": [
 *     {
 *       "problemId": "1",
 *       "question": "Can you explain why Paris is the capital?",
 *       "answer": "..."
 *     },
 *     // ... other response from the llm here.
 *   ]
 * }
 */

/**
 * POST /api/test-llm
 *
 * Receives selected problem IDs and custom questions, combines them with problem texts,
 * sends them to the LLM service, and returns the answers.
 */
export async function POST(request: Request) {
    try {
        console.log("Received request at /api/test-llm");

        const { questions } = await request.json();
        console.log("Parsed questions:", questions);

        // Input validation
        if (!Array.isArray(questions) || questions.length === 0) {
            console.warn("Invalid questions format.");
            return NextResponse.json(
                { error: "questions must be a non-empty array." },
                { status: 400 }
            );
        }

        // Validate each question and retrieve the corresponding problem
        const validQuestions = questions.filter((q) => {
            const problem = sampleProblems.find((p) => p.id === q.problemId);
            if (!problem) {
                console.warn(`Problem ID ${q.problemId} not found.`);
                return false;
            }
            if (!q.customQuestion || typeof q.customQuestion !== "string") {
                console.warn(
                    `Invalid customQuestion for Problem ID ${q.problemId}.`
                );
                return false;
            }
            return true;
        });

        console.log("Valid questions:", validQuestions);

        if (validQuestions.length === 0) {
            console.warn("No valid questions provided.");
            return NextResponse.json(
                { error: "No valid questions provided." },
                { status: 400 }
            );
        }

        // Resolve ILLMService from the container
        const llmService = container.resolve<ILLMService>("ILLMService");
        console.log("Resolved LLMService from container.");

        // Initialize the responses array
        const responses: {
            problemId: string;
            question: string;
            answer: string;
        }[] = [];

        for (const q of validQuestions) {
            const problem = sampleProblems.find((p) => p.id === q.problemId)!; // Already confirmed existence
            const prompt = `${problem.text}\n\nQuestion: ${q.customQuestion}\n\nPlease provide a concise answer in plain text, without any HTML tags, in less than 1000 characters.`;
            console.log(
                `Generating completion for Problem ID ${q.problemId}:`,
                prompt
            );

            try {
                const answer = await llmService.generateCompletion(
                    prompt,
                    "gpt-3.5-turbo"
                );

                // Remove HTML tags (just in case)
                const cleanResponse = answer.replace(/<\/?[^>]+(>|$)/g, "");

                responses.push({
                    problemId: q.problemId,
                    question: q.customQuestion,
                    answer: cleanResponse,
                });
            } catch (error) {
                console.error(
                    `Error generating response for Problem ID ${q.problemId}:`,
                    error
                );
                responses.push({
                    problemId: q.problemId,
                    question: q.customQuestion,
                    answer: "Error generating response.",
                });
            }
        }

        // Return the responses
        console.log("Returning responses:", responses);
        return NextResponse.json({ responses });
    } catch (error: any) {
        console.error("Error in /api/test-llm:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error." },
            { status: 500 }
        );
    }
}
