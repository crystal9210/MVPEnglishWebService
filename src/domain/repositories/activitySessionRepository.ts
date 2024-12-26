/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";
import {
    ActivitySession,
    ActivitySessionSchema,
    GoalActivitySessionSchema,
    ServiceActivitySessionSchema,
    SessionAttempt,
    SessionAttemptSchema,
} from "@/schemas/activity/activitySessionSchema";
import { SESSION_TYPES } from "@/constants/sessions/sessions";

@injectable()
export class ActivitySessionRepository implements IActivitySessionRepository {
    private readonly sessionsCollection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {
        try {
            const firestore = this.firebaseAdmin.getFirestore();
            this.sessionsCollection = firestore.collection("activitySessions");
            this.logger.info("ActivitySessions collection reference initialized.");
        } catch (error) {
            this.logger.error("Failed to initialize ActivitySessions collection reference.", { error });
            throw new Error("Initialization of ActivitySessions collection failed.");
        }
    }

    /**
     * Generates a document reference for a specific session by sessionId.
     * @param sessionId - The ID of the session.
     * @returns Firestore Document Reference for the session.
     */
    private activitySessionDocRef(sessionId: string): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
        return this.sessionsCollection.doc(sessionId);
    }

    /**
     * Adds a new activity session after validating it against the appropriate schema.
     * @param session - The activity session to be added.
     */
    async addSession(session: ActivitySession): Promise<void> {
        try {
            // Validate session based on its type
            if (session.sessionType === SESSION_TYPES.GOAL) {
                GoalActivitySessionSchema.parse(session);
            } else if (session.sessionType === SESSION_TYPES.SERVICE) {
                ServiceActivitySessionSchema.parse(session);
            } else {
                this.logger.warn("Attempted to add session with unknown session type.", { session });
                throw new Error(`Unknown session type. The session is: ${JSON.stringify(session)}`);
            }

            // Add the session to Firestore
            await this.sessionsCollection.doc(session.sessionId).set(session);
            this.logger.info(`Session added successfully: sessionId=${session.sessionId}`);
        } catch (error) {
            this.logger.error("Failed to add activity session.", { error, session });
            throw error;
        }
    }

    /**
     * Updates an existing session with the specified session ID after validating the updates.
     * @param sessionId - The ID of the session to be updated.
     * @param updatedSession - The updates to be applied to the session.
     */
    async updateSession(sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void> {
        try {
            const sessionDoc = this.activitySessionDocRef(sessionId);
            const existingDoc = await sessionDoc.get();
            if (!existingDoc.exists) {
                this.logger.warn(`Attempted to update non-existent session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} does not exist.`);
            }

            const existingData = existingDoc.data() as ActivitySession;
            const mergedData = { ...existingData, ...updatedSession };
            ActivitySessionSchema.parse(mergedData);

            await sessionDoc.update(updatedSession);
            this.logger.info(`Session updated successfully: sessionId=${sessionId}`);
        } catch (error) {
            this.logger.error("Failed to update activity session.", { error, sessionId, updatedSession });
            throw error;
        }
    }

    /**
     * Retrieves a session with the specified session ID after validating its structure.
     * @param sessionId - The ID of the session to retrieve.
     * @returns The specified session or null if not found.
     */
    async getSessionById(sessionId: string): Promise<ActivitySession | null> {
        try {
            const sessionDoc = this.activitySessionDocRef(sessionId);
            const docSnapshot = await sessionDoc.get();
            if (!docSnapshot.exists) {
                this.logger.warn(`Session not found: sessionId=${sessionId}`);
                return null;
            }
            const data = docSnapshot.data();
            if (!data) {
                this.logger.warn(`Session data is undefined despite document existing: sessionId=${sessionId}`);
                return null;
            }

            let parsedSession: ActivitySession;
            if (data.sessionType === SESSION_TYPES.GOAL) {
                parsedSession = GoalActivitySessionSchema.parse(data);
            } else if (data.sessionType === SESSION_TYPES.SERVICE) {
                parsedSession = ServiceActivitySessionSchema.parse(data);
            } else {
                this.logger.warn(`Unknown session type encountered: sessionType=${data.sessionType}`, { data });
                throw new Error(`Unknown session type: ${data.sessionType}`);
            }

            this.logger.info(`Session retrieved successfully: sessionId=${sessionId}`);
            return parsedSession;
        } catch (error) {
            this.logger.error("Failed to retrieve activity session.", { error, sessionId });
            throw error;
        }
    }

    /**
     * Retrieves all activity sessions after validating their structures.
     * @returns An array of all activity sessions.
     */
    async getAllSessions(): Promise<ActivitySession[]> {
        try {
            const querySnapshot = await this.sessionsCollection.get();
            const sessions: ActivitySession[] = [];

            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                try {
                    if (data.sessionType === SESSION_TYPES.GOAL) {
                        sessions.push(GoalActivitySessionSchema.parse(data));
                    } else if (data.sessionType === SESSION_TYPES.SERVICE) {
                        sessions.push(ServiceActivitySessionSchema.parse(data));
                    } else {
                        this.logger.warn(`Unknown session type encountered during retrieval: sessionType=${data.sessionType}`, { data });
                        // Optionally, you can decide to skip or throw an error
                        throw new Error(`Unknown session type: ${data.sessionType}`);
                    }
                } catch (parseError) {
                    this.logger.warn("Failed to parse activity session during retrieval.", { parseError, data });
                    // Optionally, skip invalid sessions or rethrow
                    throw parseError;
                }
            }

            this.logger.info(`All sessions retrieved successfully. Total sessions: ${sessions.length}`);
            return sessions;
        } catch (error) {
            this.logger.error("Failed to retrieve all activity sessions.", { error });
            throw error;
        }
    }

    /**
     * Deletes a session with the specified session ID.
     * @param sessionId - The ID of the session to delete.
     */
    async deleteSession(sessionId: string): Promise<void> {
        try {
            const sessionDoc = this.activitySessionDocRef(sessionId);
            const docSnapshot = await sessionDoc.get();

            if (!docSnapshot.exists) {
                this.logger.warn(`Attempted to delete non-existent session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} does not exist.`);
            }

            await sessionDoc.delete();
            this.logger.info(`Session deleted successfully: sessionId=${sessionId}`);
        } catch (error) {
            this.logger.error("Failed to delete activity session.", { error, sessionId });
            throw error;
        }
    }

    /**
     * Adds an attempt to the specified session after validating the attempt and session type.
     * @param sessionId - The ID of the session to add the attempt to.
     * @param attempt - The attempt to be added.
     */
    async addAttempt(sessionId: string, attempt: SessionAttempt): Promise<void> {
        try {
            const session = await this.getSessionById(sessionId);
            if (!session) {
                this.logger.warn(`Attempted to add attempt to non-existent session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} not found.`);
            }
            if (session.sessionType !== SESSION_TYPES.GOAL) {
                this.logger.warn(`Attempted to add attempt to non-goal session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and cannot have attempts.`);
            }
            SessionAttemptSchema.parse(attempt);

            // Append the new attempt
            const updatedAttempts = [...session.attempts, attempt];

            // Update the session with the new attempts and last updated timestamp
            await this.updateSession(sessionId, { attempts: updatedAttempts, lastUpdatedAt: new Date() });
            this.logger.info(`Attempt added successfully to session: sessionId=${sessionId}, attemptId=${attempt.attemptId}`);
        } catch (error) {
            this.logger.error("Failed to add attempt to activity session.", { error, sessionId, attempt });
            throw error;
        }
    }

    /**
     * Adds multiple attempts to the specified session after validating each attempt.
     * @param sessionId - The ID of the session to add the attempts to.
     * @param attempts - The array of attempts to be added.
     */
    async addSessionAttempts(sessionId: string, attempts: SessionAttempt[]): Promise<void> {
        try {
            const session = await this.getSessionById(sessionId);
            if (!session) {
                this.logger.warn(`Attempted to add attempts to non-existent session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} not found.`);
            }
            if (session.sessionType !== SESSION_TYPES.GOAL) {
                this.logger.warn(`Attempted to add attempts to non-goal session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and cannot have attempts.`);
            }

            attempts.forEach((attempt) => {
                SessionAttemptSchema.parse(attempt);
            });

            const updatedAttempts = [...session.attempts, ...attempts];

            // Update the session with the new attempts and last updated timestamp
            await this.updateSession(sessionId, { attempts: updatedAttempts, lastUpdatedAt: new Date() });
            this.logger.info(`Multiple attempts added successfully to session: sessionId=${sessionId}, attemptsAdded=${attempts.length}`);
        } catch (error) {
            this.logger.error("Failed to add multiple attempts to activity session.", { error, sessionId, attempts });
            throw error;
        }
    }

    /**
     * Updates a specific attempt within a session after validating the updates.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to update.
     * @param updatedAttempt - The updates to be applied to the attempt.
     */
    async updateAttempt(sessionId: string, attemptId: string, updatedAttempt: Partial<SessionAttempt>): Promise<void> {
        try {
            const session = await this.getSessionById(sessionId);
            if (!session) {
                this.logger.warn(`Attempted to update attempt in non-existent session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} not found.`);
            }
            if (session.sessionType !== SESSION_TYPES.GOAL) {
                this.logger.warn(`Attempted to update attempt in non-goal session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and cannot have attempts.`);
            }

            const attemptIndex = session.attempts.findIndex((a) => a.attemptId === attemptId);
            if (attemptIndex === -1) {
                this.logger.warn(`Attempt not found: attemptId=${attemptId} in sessionId=${sessionId}`);
                throw new Error(`Attempt with ID ${attemptId} not found in session ${sessionId}.`);
            }

            // Merge existing attempt data with updates for validation
            const existingAttempt = session.attempts[attemptIndex];
            const mergedAttempt = { ...existingAttempt, ...updatedAttempt };

            // Validate the merged attempt
            SessionAttemptSchema.parse(mergedAttempt);
            // Update the attempt in the attempts array
            const updatedAttempts = [...session.attempts];
            updatedAttempts[attemptIndex] = mergedAttempt;

            // Update the session with the modified attempts and last updated timestamp
            await this.updateSession(sessionId, { attempts: updatedAttempts, lastUpdatedAt: new Date() });
            this.logger.info(`Attempt updated successfully: sessionId=${sessionId}, attemptId=${attemptId}`);
        } catch (error) {
            this.logger.error("Failed to update attempt in activity session.", { error, sessionId, attemptId, updatedAttempt });
            throw error;
        }
    }

    /**
     * Retrieves all attempts associated with a specific session after validating the session type.
     * @param sessionId - The ID of the session to retrieve attempts from.
     * @returns An array of attempts associated with the session.
     */
    async getAttemptsBySessionId(sessionId: string): Promise<SessionAttempt[]> {
        try {
            const session = await this.getSessionById(sessionId);

            if (!session) {
                this.logger.warn(`Attempted to retrieve attempts from non-existent session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} not found.`);
            }

            if (session.sessionType !== SESSION_TYPES.GOAL) {
                this.logger.warn(`Attempted to retrieve attempts from non-goal session: sessionId=${sessionId}`);
                throw new Error(`Session with ID ${sessionId} is not a GoalActivitySession and does not have attempts.`);
            }

            this.logger.info(`Attempts retrieved successfully for session: sessionId=${sessionId}`);
            return session.attempts;
        } catch (error) {
            this.logger.error("Failed to retrieve attempts from activity session.", { error, sessionId });
            throw error;
        }
    }
}
