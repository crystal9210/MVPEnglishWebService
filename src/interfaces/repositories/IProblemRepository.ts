/* eslint-disable no-unused-vars */
import { Problem } from "@/schemas/problemSchemas";
import { QuestionType } from "@/constants/problemTypes";
import { ProblemDifficultyLevel } from "@/constants/userStatisticTypes";

/**
 * ProblemFilters:
 *   - Defines filters for querying problems.
 */
export type ProblemFilters = {
    categories?: string[];
    difficulties?: ProblemDifficultyLevel[];
    orderBy?: { field: string; direction: "asc" | "desc" };
    limit?: number;
    startAfter?: unknown; // TODO >> correct to "QueryDocumentSnapshot" type
};

/**
 * IProblemRepository:
 *   - Interface for ProblemRepository.
 *   - Defines methods for accessing Problem entities.
 */
export interface IProblemRepository {
    /**
     * Retrieves a problem by its ID.
     * @param serviceId - The ID of the service the problem belongs to.
     * @param problemId - The ID of the problem.
     * @param questionType - The type of the question.
     * @returns The matching Problem object or null if not found.
     */
    getProblemById(
        serviceId: string,
        problemId: string,
        questionType: QuestionType
    ): Promise<Problem | null>;

    /**
     * Finds problems with the specified filters.
     * @param serviceId - The ID of the service the problems belong to.
     * @param questionType - The type of the questions.
     * @param filters - The filters to apply.
     * @returns An array of Problem objects matching the filters.
     */
    findProblemsWithFilters(
        serviceId: string,
        questionType: QuestionType,
        filters: ProblemFilters
    ): Promise<Problem[]>;

    /**
     * Finds problems by service ID and difficulty level.
     * @param serviceId - The service identifier.
     * @param difficulty - The difficulty level.
     * @returns An array of Problem objects matching the criteria.
     */
    findByServiceAndDifficulty(
        serviceId: string,
        difficulty: ProblemDifficultyLevel
    ): Promise<Problem[]>;

    /**
     * Retrieves all problems from the repository.
     * @returns An array of all Problem objects.
     */
    getAllProblems(): Promise<Problem[]>;

    /**
     * Adds a new problem to the repository.
     * @param problem - The Problem object to add.
     */
    addProblem(problem: Problem): Promise<void>;
}
