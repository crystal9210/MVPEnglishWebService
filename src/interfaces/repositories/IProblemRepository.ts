/* eslint-disable no-unused-vars */
import type { Problem } from "@/schemas/problemSchemas";

export interface IProblemRepository {
    getProblemById(serviceId: string, problemId: string): Promise<Problem | null>;
    findProblemsByCategory(serviceId: string, category: string): Promise<Problem[]>;
    findProblemsByDifficulty(serviceId: string, difficulty: string): Promise<Problem[]>;
    findAllProblems(serviceId: string): Promise<Problem[]>;
    findProblemsByCategories(serviceId: string, categories: string[]): Promise<Problem[]>;
    findProblemsByDifficulties(serviceId: string, difficulties: string[]): Promise<Problem[]>;
    findProblemsWithFilters(serviceId: string, filters: {categories?: string[], difficulties?: string[]}): Promise<Problem[]>;
}
