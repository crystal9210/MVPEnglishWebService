// serviceIdに対応化
import type { Problem } from "@/schemas/problemSchemas";

export interface IProblemRepository {
    findByCategory(serviceId: string, category: string): Promise<Problem[]>;
    findByDifficulty(serviceId: string, difficulty: string): Promise<Problem[]>;
    findById(serviceId: string, id: string): Promise<Problem | null>;
    create(serviceId: string, problemData: Problem): Promise<string>;
    update(serviceId: string, id: string, problemData: Partial<Problem>): Promise<void>;
    delete(serviceId: string, id: string): Promise<void>;
}
