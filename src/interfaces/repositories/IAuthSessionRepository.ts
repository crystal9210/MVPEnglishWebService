/* eslint-disable no-unused-vars */
import type { AdapterSession } from "next-auth/adapters";

export interface IAuthSessionRepository {
    /**
     * Creates a new session in the database.
     * @param session - The session data to create.
     */
    createSession(session: AdapterSession): Promise<void>;

    /**
     * Finds a session by its sessionToken.
     * @param sessionToken - The session token.
     * @returns The session or null if not found.
     */
    findSession(sessionToken: string): Promise<AdapterSession | null>;

    /**
     * Updates a session's data.
     * @param sessionToken - The session token.
     * @param session - The session data to update.
     * @returns The updated session or null if not found.
     */
    updateSession(
        sessionToken: string,
        session: Partial<AdapterSession>
    ): Promise<AdapterSession | null>;

    /**
     * Deletes a session by its sessionToken.
     * @param sessionToken - The session token.
     * @returns The deleted session or null if not found.
     */
    deleteSession(sessionToken: string): Promise<AdapterSession | null>;
}
