import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "tsyringe";
import { IRAGService } from "@/interfaces/services/IRAGService";

// リクエストボディのスキーマ
const AskSchema = z.object({
    question: z.string(),
    problemId: z.string(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = AskSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request data." },
                { status: 400 }
            );
        }

        const { question, problemId } = parsed.data;

        const ragService = container.resolve<IRAGService>("IRAGService");
        const answer = await ragService.retrieveAndGenerate(
            question,
            problemId
        );

        return NextResponse.json({ answer });
    } catch (error) {
        console.error("Error in /api/ask:", error);
        return NextResponse.json(
            { error: "Internal Server Error." },
            { status: 500 }
        );
    }
}
