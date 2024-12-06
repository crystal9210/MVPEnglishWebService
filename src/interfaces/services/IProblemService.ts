import type { Problem } from "@/schemas/problemSchemas";

export interface IProblemService {
    getProblemsByCategory(serviceId: string, category: string): Promise<Problem[]>;
    getProblemsByDifficulty(serviceId: string, difficulty: string): Promise<Problem[]>;
    getProblemById(serviceId: string, id: string): Promise<Problem | null>;
    createProblem(serviceId: string, problemData: Problem): Promise<string>;
    updateProblem(serviceId: string, id: string, problemData: Partial<Problem>): Promise<void>;
    deleteProblem(serviceId: string, id: string): Promise<void>;
}
