import { Problem } from "@/schemas/problemSchemas";

export interface IProblemService {
    getProblemsByCategory(category: string): Promise<Problem[]>;
    getProblemsByDifficulty(difficulty: string): Promise<Problem[]>;
    getProblemById(id: string): Promise<Problem | null>;
    addProblem(problemData: Problem): Promise<string>;
    updateProblem(id: string, problemData: Partial<Problem>): Promise<void>;
    deleteProblem(id: string): Promise<void>;
}
