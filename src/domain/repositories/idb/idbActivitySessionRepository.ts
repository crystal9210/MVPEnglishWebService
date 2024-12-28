"use client";

import { IIndexedDBActivitySessionRepository } from "@/interfaces/clientSide/repositories/IIdbActivitySessionRepository";
import { ActivitySession, GoalActivitySessionSchema, ServiceActivitySessionSchema, SessionAttempt, SessionAttemptSchema } from "@/schemas/activity/activitySessionSchema";
import { GenericRepository } from "./genericRepository";
import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
import { SESSION_TYPES } from "@/constants/sessions/sessions";

export class IndexedDBActivitySessionRepository extends GenericRepository<"activitySessions"> implements IIndexedDBActivitySessionRepository {
    constructor(idbManager: IIndexedDBManager) {
        super(idbManager, "activitySessions");
    }

    /**
     * Adds a new session.
     * @param session - The activity session to be added.
     */
    async addSession(session: ActivitySession): Promise<void> {
        if (session.sessionType === SESSION_TYPES.GOAL) {
            GoalActivitySessionSchema.parse(session);
        } else if (session.sessionType === SESSION_TYPES.SERVICE) {
            ServiceActivitySessionSchema.parse(session);
        } else {
            throw new Error(`Unknown session type is detected. The session is: ${JSON.stringify(session, null, 2)}`);
        }

        await this.add(session);
    }

    /**
     * Updates a session with the specified session ID.
     * @param sessionId - The ID of the session to be updated.
     * @param updatedSession - The updates to be applied to the session.
     */
    async updateSession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void> {
        await this.update(updatedSession, sessionId);
    }

    /**
     * Retrieves a session with the specified session ID.
     * @param sessionId - The ID of the session to retrieve.
     * @returns The specified session or null if not found.
     */
    async getSessionById(sessionId: string): Promise<ActivitySession | null> {
        const session = await this.get(sessionId);
        if (!session) {
            return null;
        }

        if (session.sessionType === SESSION_TYPES.GOAL) {
            return GoalActivitySessionSchema.parse(session);
        } else if (session.sessionType === SESSION_TYPES.SERVICE) {
            return ServiceActivitySessionSchema.parse(session);
        } else {
            throw new Error(`Unknown session type. The session is : ${JSON.stringify(session)}`);
        }
    }

    /**
     * Retrieves all sessions.
     * @returns An array of all activity sessions.
     */
    async getAllSessions(): Promise<ActivitySession[]> {
        const sessions = await this.getAll();
        return sessions.map(session => {
            if (session.sessionType === SESSION_TYPES.GOAL) {
                return GoalActivitySessionSchema.parse(session);
            } else if (session.sessionType === SESSION_TYPES.SERVICE) {
                return ServiceActivitySessionSchema.parse(session);
            } else {
                throw new Error(`Unknown session type. The session is : ${JSON.stringify(session)}`);
            }
        });
    }

    /**
     * Deletes a session with the specified session ID.
     * @param sessionId - The ID of the session to delete.
     */
    async deleteSession(sessionId: string): Promise<void> {
        await this.delete(sessionId);
    }

    /**
     * Adds an attempt to the specified session.
     * @param sessionId - The ID of the session to add the attempt to.
     * @param attempt - The attempt to be added.
     */
    async addAttempt(sessionId: string, attempt: SessionAttempt): Promise<void> {
        const session = await this.getSessionById(sessionId);
        if (!session) {
            throw new Error(`Session with ID ${sessionId} not found.`);
        }

        if (session.sessionType !== SESSION_TYPES.GOAL) {
            throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and cannot have attempts.`);
        }

        SessionAttemptSchema.parse(attempt);

        const updatedAttempts = [...session.attempts, attempt];
        await this.updateSession(sessionId, { attempts: updatedAttempts, lastUpdatedAt: new Date() });
    }

    /**
     * Adds multiple attempts to the specified session.
     * @param sessionId - The ID of the session to add the attempts to.
     * @param attempts - The array of attempts to be added.
     */
    async addSessionAttempts(sessionId: string, attempts: SessionAttempt[]): Promise<void> {
        const session = await this.getSessionById(sessionId);
        if (!session) {
            throw new Error(`Session with ID ${sessionId} not found.`);
        }

        if (session.sessionType !== SESSION_TYPES.GOAL) {
            throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and cannot have attempts.`);
        }

        attempts.forEach(attempt => {
            SessionAttemptSchema.parse(attempt);
        });

        const updatedAttempts = [...session.attempts, ...attempts];
        await this.updateSession(sessionId, { attempts: updatedAttempts, lastUpdatedAt: new Date() });
    }

    /**
     * Updates an attempt within the specified session.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to update.
     * @param updatedAttempt - The updates to be applied to the attempt.
     */
    async updateAttempt(sessionId: string, attemptId: string, updatedAttempt: Partial<SessionAttempt>): Promise<void> {
        const session = await this.getSessionById(sessionId);
        if (!session) {
            throw new Error(`Session with ID ${sessionId} not found.`);
        }

        if (session.sessionType !== SESSION_TYPES.GOAL) {
            throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and cannot have attempts.`);
        }

        const attemptIndex = session.attempts.findIndex(a => a.attemptId === attemptId);
        if (attemptIndex === -1) {
            throw new Error(`Attempt with ID ${attemptId} not found in session ${sessionId}.`);
        }

        const updatedAttempts = [...session.attempts];
        updatedAttempts[attemptIndex] = { ...updatedAttempts[attemptIndex], ...updatedAttempt };

        await this.updateSession(sessionId, { attempts: updatedAttempts, lastUpdatedAt: new Date() });
    }

    /**
     * Retrieves all attempts for the specified session.
     * @param sessionId - The ID of the session to retrieve attempts from.
     * @returns An array of attempts associated with the session.
     */
    async getAttemptsBySessionId(sessionId: string): Promise<SessionAttempt[]> {
        const session = await this.getSessionById(sessionId);
        if (!session) {
            throw new Error(`Session with ID ${sessionId} not found.`);
        }

        if (session.sessionType !== SESSION_TYPES.GOAL) {
            throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and does not have attempts.`);
        }

        return session.attempts;
    }
}
