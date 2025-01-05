import { NextResponse } from "next/server";
import { container } from "tsyringe";
import { IRAGService } from "@/interfaces/services/IRAGService";
import { getProblemById } from "@/services/serviceLayer";

/**
 * Handles POST requests to generate answers based on user questions and problems.
 * @param request The incoming request.
 * @returns The generated answer or an error message.
 */
export async function POST(request: Request) {
    try {
        const { question, problemId } = await request.json();

        // Validate request payload
        if (!question || !problemId) {
            return NextResponse.json(
                { error: "Question and problemId are required." },
                { status: 400 }
            );
        }

        // Retrieve the problem by ID
        const problem = getProblemById(problemId);

        if (!problem) {
            return NextResponse.json(
                { error: "Problem not found." },
                { status: 404 }
            );
        }

        // Ensure the problem has an embedding
        if (!problem.embedding || problem.embedding.length === 0) {
            return NextResponse.json(
                {
                    error: "Problem embedding not found. Please initialize embeddings.",
                },
                { status: 500 }
            );
        }

        const combinedContext = `Problem: ${
            problem.problemText || problem.inputs?.[0]?.correctAnswer || ""
        }\nUser Question: ${question}`;

        // Convert sample problems to embedding documents
        const embeddingDocs = getEmbeddingDocs();

        // Retrieve RAGService instance from the container
        const ragService = container.resolve<IRAGService>("IRAGService");

        // Generate the answer using RAGService
        const answer = await ragService.retrieveAndGenerate(
            combinedContext,
            question
        );

        return NextResponse.json({ answer }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/ask:", error);
        return NextResponse.json(
            { error: "Internal Server Error." },
            { status: 500 }
        );
    }
}
