/* eslint-disable no-unused-vars */
import type { ProblemResult } from "@/schemas/userHistorySchemas";

export interface IProblemResultService {
    findProblemResult(problemType: string, userId: string, problemId: string): Promise<ProblemResult | null>;
    saveProblemResult(problemType: string, userId: string, problemResult: ProblemResult): Promise<void>;
    updateProblemResult(problemType: string, userId: string, problemId: string, updateData: Partial<ProblemResult>): Promise<void>;
    deleteProblemResult(problemType: string, userId: string, problemId: string): Promise<void>;
}
