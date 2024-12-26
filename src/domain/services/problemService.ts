/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import { IProblemService } from "@/interfaces/services/IProblemService";
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import { Problem } from "@/schemas/problemSchemas";
import { QuestionType } from "@/constants/problemTypes";

/**
 * The ProblemService class implements the IProblemService interface.
 * It provides business logic for managing problems, utilizing the ProblemRepository.
 */
@injectable()
export class ProblemService implements IProblemService {
    /**
     * The ProblemRepository instance used for data access.
     */
    private readonly problemRepository: IProblemRepository;

    /**
     * Constructor for the ProblemService.
     * @param problemRepository The injected ProblemRepository instance.
     */
    constructor(@inject("IProblemRepository") problemRepository: IProblemRepository) {
        this.problemRepository = problemRepository;
    }

    /**
     * Retrieves a problem by its ID.
     * @param serviceId The ID of the service the problem belongs to.
     * @param problemId The ID of the problem to retrieve.
     * @param questionType The type of the question.
     * @returns A promise that resolves to the problem data, or null if not found.
     */
    async getProblemById(serviceId: string, problemId: string, questionType: QuestionType): Promise<Problem | null> {
        return this.problemRepository.getProblemById(serviceId, problemId, questionType);
    }

    /**
     * Finds problems based on the specified filters.
     * @param serviceId The ID of the service the problems belong to.
     * @param questionType The type of the question.
     * @param filters The filters to apply when searching for problems.
     * @returns A promise that resolves to an array of problems matching the filters.
     */
    async findProblemsWithFilters(
        serviceId: string,
        questionType: QuestionType,
        filters: {
            categories?: string[];
            difficulties?: string[];
            limit?: number;
            orderBy?: { field: string; direction: "asc" | "desc" };
            startAfter?: unknown;
        }
    ): Promise<Problem[]> {
        return this.problemRepository.findProblemsWithFilters(serviceId, questionType, filters);
    }
}
