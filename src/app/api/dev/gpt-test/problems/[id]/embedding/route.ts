import { NextResponse } from "next/server";
import { container } from "tsyringe";
import { IEmbeddingRepository } from "@/interfaces/repositories/IEmbeddingRepository";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const embeddingRepo = container.resolve<IEmbeddingRepository>(
        "IEmbeddingRepository"
    );
    const embeddingDoc = embeddingRepo.getEmbeddingByProblemId(params.id);

    if (!embeddingDoc) {
        return NextResponse.json(
            { error: "Embedding not found." },
            { status: 404 }
        );
    }

    return NextResponse.json(embeddingDoc);
}
