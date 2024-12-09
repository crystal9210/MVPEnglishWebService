import { injectable, inject } from "tsyringe";
import { ActivityServiceInterface } from "@/interfaces/services/IActivityService";
import { ActivitySession } from "@/domain/entities/ActivitySession";
import { UserHistoryItem } from "@/domain/entities/userHistoryItem";
import type { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";

@injectable()
export class ActivityService implements ActivityServiceInterface {
    constructor(
        @inject("IActivitySessionRepository") private repository: IActivitySessionRepository,
        @inject("ILoggerService") private logger: ILoggerService
    ) {}

    async createSession(session: ActivitySession): Promise<void> {
        try {
        await this.repository.create(session);
        this.logger.info(`Session created: ID = ${session.sessionId}`);
        } catch (error) {
        this.logger.error(`Failed to create session: ID = ${session.sessionId}`, { error });
        throw error;
        }
    }

    async endSession(sessionId: string): Promise<void> {
        try {
        const session = await this.repository.findById(sessionId);
        if (!session) {
            this.logger.warn(`Session not found: ID = ${sessionId}`);
            throw new Error("Session not found");
        }
        session.endedAt = new Date().toISOString();
        await this.repository.update(session);
        this.logger.info(`Session ended: ID = ${sessionId}`);
        } catch (error) {
        this.logger.error(`Failed to end session: ID = ${sessionId}`, { error });
        throw error;
        }
    }

    async getSession(sessionId: string): Promise<ActivitySession | null> {
        try {
        const session = await this.repository.findById(sessionId);
        if (session) {
            this.logger.info(`Session retrieved: ID = ${sessionId}`);
        } else {
            this.logger.warn(`Session not found: ID = ${sessionId}`);
        }
        return session;
        } catch (error) {
        this.logger.error(`Failed to retrieve session: ID = ${sessionId}`, { error });
        throw error;
        }
    }

    async submitAnswer(sessionId: string, historyItem: UserHistoryItem): Promise<void> {
        try {
        const session = await this.repository.findById(sessionId);
        if (!session) {
            this.logger.warn(`Session not found: ID = ${sessionId}`);
            throw new Error("Session not found");
        }
        session.history.push(historyItem);
        await this.repository.update(session);
        this.logger.info(`Answer submitted: SessionID = ${sessionId}, ProblemID = ${historyItem.problemId}`);
        } catch (error) {
        this.logger.error(`Failed to submit answer: SessionID = ${sessionId}, ProblemID = ${historyItem.problemId}`, { error });
        throw error;
        }
    }
}
