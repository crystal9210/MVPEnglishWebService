import { injectable, inject } from "tsyringe";
import type { IUserHistoryService } from "@/interfaces/services/IUserHistoryService";
import type { IUserHistoryRepository } from "@/interfaces/repositories/IUserHistoryRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { UserHistoryItem } from "@/schemas/userSchemas";

@injectable()
export class UserHistoryService implements IUserHistoryService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject("IUserHistoryRepository") private readonly userHistoryRepository: IUserHistoryRepository,
        // eslint-disable-next-line no-unused-vars
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async getUserHistory(uid: string): Promise<UserHistoryItem[]> {
        const history = await this.userHistoryRepository.getUserHistory(uid);
        this.logger.info(`User history retrieved in service: UID=${uid}, Count=${history.length}`);
        return history;
    }

    async recordUserHistory(uid: string, historyItem: UserHistoryItem): Promise<void> {
        await this.userHistoryRepository.recordUserHistory(uid, historyItem);
        this.logger.info(`User history recorded in service: UID=${uid}, ProblemID=${historyItem.problemId}`);
    }
}
