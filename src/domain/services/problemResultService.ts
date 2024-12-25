import { injectable, inject } from "tsyringe";
import type { IProblemResultService } from "@/interfaces/services/IProblemResultService";
import type { IProblemResultRepository } from "@/interfaces/repositories/IProblemResultRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { ProblemResult } from "@/schemas/activity/problemHistorySchemas";

@injectable()
export class ProblemResultService implements IProblemResultService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject("IProblemResultRepository") private readonly problemResultRepository: IProblemResultRepository,
        // eslint-disable-next-line no-unused-vars
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async findProblemResult(problemType: string, userId: string, problemId: string): Promise<ProblemResult | null> {
        const result = await this.problemResultRepository.findProblemResult(problemType, userId, problemId);
        if (result) {
            this.logger.info(`Problem result found in service: Type=${problemType}, UID=${userId}, PID=${problemId}`);
        } else {
            this.logger.warn(`Problem result not found in service: Type=${problemType}, UID=${userId}, PID=${problemId}`);
        }
        return result;
    }

    async saveProblemResult(problemType: string, userId: string, problemResult: ProblemResult): Promise<void> {
        await this.problemResultRepository.saveProblemResult(problemType, userId, problemResult);
        this.logger.info(`Problem result saved in service: Type=${problemType}, UID=${userId}, PID=${problemResult.problemId}`);
    }

    async updateProblemResult(problemType: string, userId: string, problemId: string, updateData: Partial<ProblemResult>): Promise<void> {
        await this.problemResultRepository.updateProblemResult(problemType, userId, problemId, updateData);
        this.logger.info(`Problem result updated in service: Type=${problemType}, UID=${userId}, PID=${problemId}`);
    }

    async deleteProblemResult(problemType: string, userId: string, problemId: string): Promise<void> {
        await this.problemResultRepository.deleteProblemResult(problemType, userId, problemId);
        this.logger.info(`Problem result deleted in service: Type=${problemType}, UID=${userId}, PID=${problemId}`);
    }
}
