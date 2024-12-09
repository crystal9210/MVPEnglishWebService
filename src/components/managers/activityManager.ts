import { injectable, inject } from "tsyringe";
import { ActivityManagerInterface } from "@/interfaces/components/managers/IActivityManager";
import { ActivitySession } from "@/domain/entities/ActivitySession";
import { UserHistoryItem } from "@/domain/entities/userHistoryItem";
import type { ActivityServiceInterface } from "@/interfaces/services/IActivityService";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";

@injectable()
export class ActivityManager implements ActivityManagerInterface {
    private currentSession: ActivitySession | null = null;
    private listeners: Array<(session: ActivitySession | null) => void> = [];

    constructor(
        @inject("IActivityService") private activityService: ActivityServiceInterface,
        @inject("ILoggerService") private logger: ILoggerService
    ) {}

    async startSession(session: ActivitySession): Promise<void> {
        try {
        await this.activityService.createSession(session);
        this.currentSession = session;
        this.logger.info(`Session started: ID = ${session.sessionId}`);
        this.notifyListeners();
        } catch (error) {
        this.logger.error(`Failed to start session: ID = ${session.sessionId}`, { error });
        throw error;
        }
    }

    async endSession(sessionId: string): Promise<void> {
        try {
        await this.activityService.endSession(sessionId);
        this.currentSession = null;
        this.logger.info(`Session ended: ID = ${sessionId}`);
        this.notifyListeners();
        } catch (error) {
        this.logger.error(`Failed to end session: ID = ${sessionId}`, { error });
        throw error;
        }
    }

    getCurrentSession(): ActivitySession | null {
        return this.currentSession;
    }

    async submitAnswer(sessionId: string, historyItem: UserHistoryItem): Promise<void> {
        try {
        await this.activityService.submitAnswer(sessionId, historyItem);
        this.logger.info(`Answer submitted: SessionID = ${sessionId}, ProblemID = ${historyItem.problemId}`);
        // Optionally, update currentSession's history if it's loaded
        if (this.currentSession && this.currentSession.sessionId === sessionId) {
            this.currentSession.history.push(historyItem);
            this.notifyListeners();
        }
        } catch (error) {
        this.logger.error(`Failed to submit answer: SessionID = ${sessionId}, ProblemID = ${historyItem.problemId}`, { error });
        throw error;
        }
    }

    subscribe(listener: (session: ActivitySession | null) => void): () => void {
        this.listeners.push(listener);
        // Immediately call the listener with current state
        listener(this.currentSession);
        return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentSession));
    }
}
