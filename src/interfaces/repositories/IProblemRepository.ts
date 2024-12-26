/* eslint-disable no-unused-vars */
import { Problem } from "@/schemas/problemSchemas";
import { QuestionType } from "@/constants/problemTypes";

export interface IProblemRepository {
    /**
     * Gets a problem by ID.
     * @param serviceId The ID of the service the problem belongs to.
     * @param problemId The ID of the problem.
     * @param questionType The type of the question.
     * @returns The problem data, or null if not found.
     */
    getProblemById(serviceId: string, problemId: string, questionType: QuestionType): Promise<Problem | null>;


    /**
     * Finds problems with the specified filters.
     * @param serviceId The ID of the service the problems belong to.
     * @param filters The filters to apply.
     * @returns A promise that resolves to an array of problems matching the filters.
     */
    findProblemsWithFilters(
        serviceId: string,
        questionType: QuestionType,
        filters: {
            categories?: string[];
            difficulties?: string[];
            limit?: number;
            orderBy?: { field: string; direction: "asc" | "desc" };
            startAfter?: unknown;
        }
    ): Promise<Problem[]>;
}
