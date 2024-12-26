/* eslint-disable no-unused-vars */
import { Problem } from "@/schemas/problemSchemas";
import { QuestionType } from "@/constants/problemTypes";

/**
 * Defines the interface for the ProblemService.
 * This interface outlines the methods that the ProblemService should implement.
 */
export interface IProblemService {
    /**
     * Retrieves a problem by its ID.
     * @param serviceId The ID of the service the problem belongs to.
     * @param problemId The ID of the problem to retrieve.
     * @param questionType The type of the question.
     * @returns A promise that resolves to the problem data, or null if not found.
     */
    getProblemById(serviceId: string, problemId: string, questionType: QuestionType): Promise<Problem | null>;

    /**
     * Finds problems based on the specified filters.
     * @param serviceId The ID of the service the problems belong to.
     * @param questionType The type of the question.
     * @param filters The filters to apply when searching for problems.
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
