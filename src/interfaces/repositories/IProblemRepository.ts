import { Problem } from "@/schemas/problemSchemas";

export interface IProblemRepository {
    findByCategory(category: string): Promise<Problem[]>;
    findByDifficulty(difficulty: string): Promise<Problem[]>;
    findById(id: string): Promise<Problem | null>;
    create(problemData: Problem): Promise<string>;
    update(id: string, problemData: Partial<Problem>): Promise<void>;
    delete(id: string): Promise<void>;
}
