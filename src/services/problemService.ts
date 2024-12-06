import { injectable, inject } from "tsyringe";
import type { IProblemService } from "@/interfaces/services/IProblemService";
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { Problem } from "@/schemas/problemSchemas";

@injectable()
export class ProblemService implements IProblemService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject("IProblemRepository") private readonly problemRepository: IProblemRepository,
        // eslint-disable-next-line no-unused-vars
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    private pickRandom<T>(arr: T[], count: number): T[] {
        if (count >= arr.length) return arr;
        const result: T[] = [];
        const used = new Set<number>();
        while (result.length < count) {
            const idx = Math.floor(Math.random() * arr.length);
            if (!used.has(idx)) {
                used.add(idx);
                result.push(arr[idx]);
            }
        }
        return result;
    }

    private limitAndMaybeRandom(problems: Problem[], limit?: number, random?: boolean): Problem[] {
        if (random) {
            return this.pickRandom(problems, limit ?? problems.length);
        } else {
            return problems.slice(0, limit ?? problems.length);
        }
    }

    async getProblemById(serviceId: string, problemId: string): Promise<Problem | null> {
        const p = await this.problemRepository.getProblemById(serviceId, problemId);
        if (!p) this.logger.warn(`Problem not found in service: SID=${serviceId}, PID=${problemId}`);
        else this.logger.info(`Problem retrieved by ID in service: SID=${serviceId}, PID=${problemId}`);
        return p;
    }

    async getProblemsByCategory(serviceId: string, category: string, limit?: number, random?: boolean): Promise<Problem[]> {
        const all = await this.problemRepository.findProblemsByCategory(serviceId, category);
        const chosen = this.limitAndMaybeRandom(all, limit, random);
        this.logger.info(`Problems by category in service: SID=${serviceId}, Category=${category}, Count=${chosen.length}`);
        return chosen;
    }

    async getProblemsByDifficulty(serviceId: string, difficulty: string, limit?: number, random?: boolean): Promise<Problem[]> {
        const all = await this.problemRepository.findProblemsByDifficulty(serviceId, difficulty);
        const chosen = this.limitAndMaybeRandom(all, limit, random);
        this.logger.info(`Problems by difficulty in service: SID=${serviceId}, Difficulty=${difficulty}, Count=${chosen.length}`);
        return chosen;
    }

    async getAllProblems(serviceId: string, limit?: number, random?: boolean): Promise<Problem[]> {
        const all = await this.problemRepository.findAllProblems(serviceId);
        const chosen = this.limitAndMaybeRandom(all, limit, random);
        this.logger.info(`All problems in service: SID=${serviceId}, Count=${chosen.length}`);
        return chosen;
    }

    async getProblemsByCategories(
        serviceId: string,
        categoryRequests: {category: string; limit: number}[],
        random?: boolean
    ): Promise<Problem[]> {
        // 複数カテゴリ要求を処理
        // categoriesを集めて一括取得後、各カテゴリごとにlimit分選択
        const categories = categoryRequests.map(cr => cr.category);
        const all = await this.problemRepository.findProblemsByCategories(serviceId, categories);

        // カテゴリごとにフィルタリング・limit分取得
        let result: Problem[] = [];
        for (const req of categoryRequests) {
            const catProblems = all.filter(p => p.category === req.category);
            const chosen = this.limitAndMaybeRandom(catProblems, req.limit, random);
            result = result.concat(chosen);
        }
        this.logger.info(`Problems by multiple categories in service: SID=${serviceId}, TotalCount=${result.length}`);
        return result;
    }

    async getProblemsByDifficulties(
        serviceId: string,
        difficultyRequests: {difficulty: string; limit: number}[],
        random?: boolean
    ): Promise<Problem[]> {
        const diffs = difficultyRequests.map(dr => dr.difficulty);
        const all = await this.problemRepository.findProblemsByDifficulties(serviceId, diffs);

        let result: Problem[] = [];
        for (const req of difficultyRequests) {
            const diffProblems = all.filter(p => p.difficulty === req.difficulty);
            const chosen = this.limitAndMaybeRandom(diffProblems, req.limit, random);
            result = result.concat(chosen);
        }
        this.logger.info(`Problems by multiple difficulties in service: SID=${serviceId}, TotalCount=${result.length}`);
        return result;
    }

    async getProblemsWithFilters(
        serviceId: string,
        options: {categories?: string[]; difficulties?: string[]; limit?: number; random?: boolean}
    ): Promise<Problem[]> {
        const { categories, difficulties, limit, random } = options;
        const all = await this.problemRepository.findProblemsWithFilters(serviceId, { categories, difficulties });
        const chosen = this.limitAndMaybeRandom(all, limit, random);
        this.logger.info(`Problems with filters in service: SID=${serviceId}, Count=${chosen.length}`);
        return chosen;
    }
}
