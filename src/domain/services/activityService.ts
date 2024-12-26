/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import { IActivityService } from "@/interfaces/services/IActivityService";
import type { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";
import { ActivitySession, SessionAttempt } from "@/schemas/activity/activitySessionSchema";

@injectable()
export class ActivityService implements IActivityService {
    constructor(
        @inject("IActivitySessionRepository") private activitySessionRepository: IActivitySessionRepository
    ) {}

    async saveActivitySession(session: ActivitySession): Promise<void> {
        await this.activitySessionRepository.addSession(session);
    }

    async updateActivitySession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void> {
        await this.activitySessionRepository.updateSession(sessionId, updatedSession);
    }

    async getActivitySessionById(sessionId: string): Promise<ActivitySession | null> {
        return this.activitySessionRepository.getSessionById(sessionId);
    }

    async getAllActivitySessions(): Promise<ActivitySession[]> {
        return this.activitySessionRepository.getAllSessions();
    }

    async deleteActivitySession(sessionId: string): Promise<void> {
        await this.activitySessionRepository.deleteSession(sessionId);
    }

    async addAttemptToSession(sessionId: string, attempt: SessionAttempt): Promise<void> {
        await this.activitySessionRepository.addAttempt(sessionId, attempt);
    }


    async updateAttemptInSession(
        sessionId: string,
        attemptId: string,
        updatedAttempt: Partial<SessionAttempt>
    ): Promise<void> {
        await this.activitySessionRepository.updateAttempt(sessionId, attemptId, updatedAttempt);
    }

    async getAttemptsBySessionId(sessionId: string): Promise<SessionAttempt[]> {
        return this.activitySessionRepository.getAttemptsBySessionId(sessionId);
    }
}
