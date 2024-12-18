import { injectable, inject } from "tsyringe";
import { Pattern } from "../../schemas/problemSchemas";
import { PatternRepository } from "@/domain/repositories/patternRepository";
import { LoggerService } from "@/domain/services/loggerService";
import { IPatternService } from "@/interfaces/services/IPatternService";

@injectable()
export class PatternService implements IPatternService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject(PatternRepository) private patternRepository: PatternRepository,
        // eslint-disable-next-line no-unused-vars
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
