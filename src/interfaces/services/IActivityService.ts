/* eslint-disable no-unused-vars */
import { ActivitySession, SessionAttempt } from "@/schemas/activity/activitySessionSchema";

export interface IActivityService {
    /**
     * Saves an activity session.
     * @param session The activity session to save.
     */
    saveActivitySession(session: ActivitySession): Promise<void>;

    /**
     * Updates an activity session.
     * @param sessionId The ID of the session to update.
     * @param updatedSession The updated session data.
     */
    updateActivitySession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void>;

    /**
     * Gets an activity session by ID.
     * @param sessionId The ID of the session to retrieve.
     * @returns The activity session, or null if not found.
     */
    getActivitySessionById(sessionId: string): Promise<ActivitySession | null>;

    /**
     * Gets all activity sessions.
     * @returns An array of all activity sessions.
     */
    getAllActivitySessions(): Promise<ActivitySession[]>;

    /**
     * Deletes an activity session.
     * @param sessionId The ID of the session to delete.
     */
    deleteActivitySession(sessionId: string): Promise<void>;

    /**
     * Adds an attempt to an activity session.
     * @param sessionId The ID of the session to add the attempt to.
     * @param attempt The attempt to add.
     */
    addAttemptToSession(sessionId: string, attempt: SessionAttempt): Promise<void>;

    /**
     * Updates an attempt in an activity session.
     * @param sessionId The ID of the session containing the attempt.
     * @param attemptId The ID of the attempt to update.
     * @param updatedAttempt The updated attempt data.
     */
    updateAttemptInSession(sessionId: string, attemptId: string, updatedAttempt: Partial<SessionAttempt>): Promise<void>;

    /**
     * Gets all attempts for an activity session.
     * @param sessionId The ID of the session to get attempts for.
     * @returns An array of attempts.
     */
    getAttemptsBySessionId(sessionId: string): Promise<SessionAttempt[]>;
}
