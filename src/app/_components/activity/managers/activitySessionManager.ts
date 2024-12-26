import { ActivitySession, SessionAttempt, SessionAttemptSchema, GoalActivitySession, ServiceActivitySession } from "@/schemas/activity/activitySessionSchema";
import { SESSION_STATUS, SESSION_TYPES } from "@/constants/sessions/sessions";
import { IIndexedDBActivitySessionRepository } from "@/interfaces/clientSide/repositories/IIdbActivitySessionRepository";


/**
 * Listener type for session state changes.
 */
/* eslint-disable no-unused-vars */
type Listener = (session: ActivitySession | null) => void;

/**
 * ActivityManager class manages activity sessions and their attempts using a repository.
 */
export class ActivityManager {
    private currentSession: ActivitySession | null = null;
    private listeners: Listener[] = [];
    private repository: IIndexedDBActivitySessionRepository;

    constructor(repository: IIndexedDBActivitySessionRepository) {
        this.repository = repository;
        this.initialize();
    }

    /**
     * Initializes the ActivityManager by loading the current session from the repository.
     */
    private async initialize() {
        const allSessions = await this.repository.getAllSessions();
        this.currentSession = allSessions.length > 0 ? allSessions[0] : null;
        this.notifyListeners();
    }

    /**
     * Starts a new activity session.
     * @param session - The ActivitySession to start.
     */
    async startSession(session: ActivitySession): Promise<void> {
        await this.repository.addSession(session);
        this.currentSession = session;
        this.notifyListeners();
    }

    /**
     * Ends the current activity session.
     */
    async endSession(): Promise<void> {
        if (!this.currentSession) return;

        const updatedSession: Partial<ActivitySession> = {
            endAt: new Date(),
            lastUpdatedAt: new Date(),
        };

        if (this.isGoalActivitySession(this.currentSession)) {
            (updatedSession as Partial<GoalActivitySession>).status = SESSION_STATUS.COMPLETED;
        }

        await this.repository.updateSession(this.currentSession.sessionId, updatedSession);
        this.currentSession = null;
        this.notifyListeners();
    }


    /**
     * Submits an answer (SessionAttempt) to the current session.
     * @param historyItem - The SessionAttempt to submit.
     */
    async submitAnswer(historyItem: SessionAttempt): Promise<void> {
        if (!this.currentSession) throw new Error("No active session");

        SessionAttemptSchema.parse(historyItem);

        await this.repository.addAttempt(this.currentSession.sessionId, historyItem);

        this.currentSession = await this.repository.getSessionById(this.currentSession.sessionId);
        this.notifyListeners();
    }

    /**
     * Retrieves the current active session.
     * @returns The current ActivitySession or null.
     */
    getCurrentSession(): ActivitySession | null {
        return this.currentSession;
    }

    /**
     * Subscribes to session state changes.
     * @param listener - The callback to invoke on session state changes.
     * @returns A function to unsubscribe.
     */
    subscribe(listener: Listener): () => void {
        this.listeners.push(listener);
        listener(this.currentSession);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notifies all subscribed listeners of the current session state.
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentSession));
    }

    /**
     * Retrieves the history (attempts) of a specific session.
     * @param sessionId - The ID of the session.
     * @returns An array of SessionAttempt.
     */
    async getSessionHistory(sessionId: string): Promise<SessionAttempt[]> {
        const session = await this.repository.getSessionById(sessionId);
        if (this.isGoalActivitySession(session)) {
            return session.attempts;
        }
        throw new Error("Session type does not support history retrieval.");
    }

    /**
     * Retrieves all activity sessions.
     * @returns An array of ActivitySession.
     */
    async getAllSessions(): Promise<ActivitySession[]> {
        return await this.repository.getAllSessions();
    }

    /**
     * Deletes a specific session.
     * @param sessionId - The ID of the session to delete.
     */
    async deleteSession(sessionId: string): Promise<void> {
        await this.repository.deleteSession(sessionId);
        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession = null;
            this.notifyListeners();
        }
    }

    /**
     * Updates a specific session.
     * @param sessionId - The ID of the session to update.
     * @param updatedSession - The updates to apply to the session.
     */
    async updateSession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void> {
        await this.repository.updateSession(sessionId, updatedSession);
        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession = await this.repository.getSessionById(sessionId);
            this.notifyListeners();
        }
    }

    /**
     * Retrieves all history (attempts) across all sessions.
     * @returns An array of objects containing sessionId and SessionAttempt.
     */
    async getAllHistory(): Promise<{ sessionId: string; historyItem: SessionAttempt }[]> {
        const sessions = await this.repository.getAllSessions();
        return sessions.flatMap(session =>
            this.isGoalActivitySession(session)
                ? session.attempts.map(attempt => ({ sessionId: session.sessionId, historyItem: attempt }))
                : []
        );
    }

    /**
     * Deletes a specific history item (SessionAttempt) from a session.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to delete.
     */
    async deleteHistoryItem(sessionId: string, attemptId: string): Promise<void> {
        const session = await this.repository.getSessionById(sessionId);
        if (this.isGoalActivitySession(session)) {
            const attemptIndex = session.attempts.findIndex(a => a.attemptId === attemptId);
            if (attemptIndex === -1) throw new Error(`Attempt with ID ${attemptId} not found`);

            session.attempts.splice(attemptIndex, 1);
            await this.repository.updateSession(sessionId, { attempts: session.attempts });
        } else {
            throw new Error("Session type does not support deleting history items.");
        }
    }

    /**
     * Updates a specific history item (SessionAttempt) within a session.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to update.
     * @param updatedAttempt - The updates to apply to the attempt.
     */
    async updateHistoryItem(sessionId: string, attemptId: string, updatedAttempt: Partial<SessionAttempt>): Promise<void> {
        const session = await this.repository.getSessionById(sessionId);
        if (this.isGoalActivitySession(session)) {
            const attemptIndex = session.attempts.findIndex(a => a.attemptId === attemptId);
            if (attemptIndex === -1) throw new Error(`Attempt with ID ${attemptId} not found`);

            session.attempts[attemptIndex] = { ...session.attempts[attemptIndex], ...updatedAttempt };
            await this.repository.updateSession(sessionId, { attempts: session.attempts });
        } else {
            throw new Error("Session type does not support updating history items.");
        }
    }

    /**
     * Checks if the session is a GoalActivitySession.
     * @param session - The session to check.
     * @returns True if the session is a GoalActivitySession.
     */
    private isGoalActivitySession(session: ActivitySession | null): session is GoalActivitySession {
        return session?.sessionType === SESSION_TYPES.GOAL;
    }

    /**
     * Checks if the session is a ServiceActivitySession.
     * @param session - The session to check.
     * @returns True if the session is a ServiceActivitySession.
     */
    private isServiceActivitySession(session: ActivitySession | null): session is ServiceActivitySession {
        return session?.sessionType === SESSION_TYPES.SERVICE;
    }
}
