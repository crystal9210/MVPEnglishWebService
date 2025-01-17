/* eslint-disable no-unused-vars */
import { ActivitySession, SessionAttempt } from "@/schemas/activity/activitySessionSchema";

export interface IActivitySessionRepository {
    /**
     * Adds a new session.
     * @param session - The activity session to be added.
     */
    addSession(session: ActivitySession): Promise<void>;

    /**
     * Updates a session with the specified session ID.
     * @param sessionId - The ID of the session to be updated.
     * @param updatedSession - The updates to be applied to the session.
     */
    updateSession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void>;

    /**
     * Retrieves a session with the specified session ID.
     * @param sessionId - The ID of the session to retrieve.
     * @returns The specified session or null if not found.
     */
    getSessionById(sessionId: string): Promise<ActivitySession | null>;

    /**
     * Retrieves all sessions.
     * @returns An array of all activity sessions.
     */
    getAllSessions(): Promise<ActivitySession[]>;

    /**
     * Deletes a session with the specified session ID.
     * @param sessionId - The ID of the session to delete.
     */
    deleteSession(sessionId: string): Promise<void>;

    /**
     * Adds an attempt to the specified session.
     * @param sessionId - The ID of the session to add the attempt to.
     * @param attempt - The attempt to be added.
     */
    addAttempt(sessionId: string, attempt: SessionAttempt): Promise<void>;

    /**
     * Updates an attempt within the specified session.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to update.
     * @param updatedAttempt - The updates to be applied to the attempt.
     */
    updateAttempt(sessionId: string, attemptId: string, updatedAttempt: Partial<SessionAttempt>): Promise<void>;

    /**
     * Retrieves all attempts for the specified session.
     * @param sessionId - The ID of the session to retrieve attempts from.
     * @returns An array of attempts associated with the session.
     */
    getAttemptsBySessionId(sessionId: string): Promise<SessionAttempt[]>;
}
