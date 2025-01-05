import { NextResponse } from "next/server";
import { getProblemById, getEmbeddingDocs } from "@/domain/serviceLayer";
import { ServiceTypeProblem } from "@/schemas/problemSchemas";

export async function GET(request: Request) {
    const allProblems: ServiceTypeProblem[] = [];

    return NextResponse.json(allProblems);
}
