import type { AdapterSession, AdapterUser } from "next-auth/adapters";

export interface IAuthSessionService {
    /**
     * Creates a new session.
     * @param session - The session data to create.
     * @returns The created session.
     */
    createSession(session: {
        sessionToken: string;
        userId: string;
        expires: Date;
    }): Promise<AdapterSession>;

    /**
     * Retrieves a session and its associated user by session token.
     * @param sessionToken - The session token.
     * @returns The session and user, or null if not found.
     */
    getSessionAndUser(
        sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null>;

    /**
     * Updates an existing session.
     * @param session - The session data to update.
     * @returns The updated session or null if not found.
     */
    updateSession(
        session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null>;

    /**
     * Deletes a session by its token and returns the deleted session.
     * @param sessionToken - The session token to delete.
     * @returns The deleted session or null if not found.
     */
    deleteSession(sessionToken: string): Promise<AdapterSession | null>;
}
