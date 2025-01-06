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
export async function POST(request: Request) {
    try {
        const { questions } = await request.json();

        // validate inputs.
        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: "questions must be a non-empty array." },
                { status: 400 }
            );
        }

        // validate each question and get the problem.
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

        if (validQuestions.length === 0) {
            return NextResponse.json(
                { error: "No valid questions provided." },
                { status: 400 }
            );
        }

        const llmService = container.resolve<ILLMService>("ILLMService");

        // initialize the array of an object to store the response from the llm.
        const responses: {
            problemId: string;
            question: string;
            answer: string;
        }[] = [];

        for (const q of validQuestions) {
            const problem = sampleProblems.find((p) => p.id === q.problemId)!; // confirm the question info is valid and exists.
            const prompt = `${problem.text}\n\nQuestion: ${q.customQuestion}\n\nPlease provide a concise answer in plain text, without any HTML tags, in less than 1000 characters.`;

            try {
                const llmResponse = await llmService.generateCompletion(
                    prompt,
                    "gpt-3.5-turbo"
                );
                // HTMLタグ削除
                const cleanResponse = llmResponse.replace(
                    /<\/?[^>]+(>|$)/g,
                    ""
                );
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

        // return the response from the llm, which is adjusted to appropriate format for the ui required response.
        return NextResponse.json({ responses });
    } catch (error) {
        console.error("Error in /api/test-llm:", error);
        return NextResponse.json(
            { error: "Internal Server Error." },
            { status: 500 }
        );
    }
}
