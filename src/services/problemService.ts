import { injectable, inject } from "tsyringe";
import { Problem } from "../schemas/problemSchemas";
import { ProblemRepository } from "@/repositories/problemRepository";
import { LoggerService } from "@/services/loggerService";

@injectable()
export class ProblemService {
    constructor(
        @inject(ProblemRepository) private problemRepository: ProblemRepository,
        @inject(LoggerService) private logger: LoggerService
    ) {}

    async getProblemsByCategory(category: string): Promise<Problem[]> {
        return this.problemRepository.findByCategory(category);
    }

    async getProblemsByDifficulty(difficulty: string): Promise<Problem[]> {
        return this.problemRepository.findByDifficulty(difficulty);
    }

    async getProblemById(id: string): Promise<Problem | null> {
        return this.problemRepository.findById(id);
    }

    async addProblem(problemData: Problem): Promise<string> {
        return this.problemRepository.create(problemData);
    }

    async updateProblem(id: string, problemData: Partial<Problem>): Promise<void> {
        return this.problemRepository.update(id, problemData);
    }

    async deleteProblem(id: string): Promise<void> {
        return this.problemRepository.delete(id);
    }
}
