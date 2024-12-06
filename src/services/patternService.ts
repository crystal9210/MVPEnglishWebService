import { injectable, inject } from "tsyringe";
import { Pattern } from "../schemas/problemSchemas";
import { PatternRepository } from "@/repositories/patternRepository";
import { LoggerService } from "@/services/loggerService";

@injectable()
export class PatternService {
    constructor(
        @inject(PatternRepository) private patternRepository: PatternRepository,
        @inject(LoggerService) private logger: LoggerService
    ) {}

    async getAllPatterns(): Promise<Pattern[]> {
        return this.patternRepository.findAll();
    }

    async getPatternById(id: string): Promise<Pattern | null> {
        return this.patternRepository.findById(id);
    }

    async addPattern(patternData: Pattern): Promise<string> {
        return this.patternRepository.create(patternData);
    }

    async updatePattern(id: string, patternData: Partial<Pattern>): Promise<void> {
        return this.patternRepository.update(id, patternData);
    }

    async deletePattern(id: string): Promise<void> {
        return this.patternRepository.delete(id);
    }
}
