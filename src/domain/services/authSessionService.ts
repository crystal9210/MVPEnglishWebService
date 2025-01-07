import { injectable, inject } from "tsyringe";
import { IAuthSessionService } from "@/interfaces/services/IAuthSessionService";
import type { IAuthSessionRepository } from "@/interfaces/repositories/IAuthSessionRepository";
import type { IAuthUserRepository } from "@/interfaces/repositories/IAuthUserRepository";
import { AdapterSession, AdapterUser } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthSessionService implements IAuthSessionService {
    constructor(
        @inject(TSYRINGE_TOKENS.IAuthSessionRepository)
        private sessionRepository: IAuthSessionRepository,
        @inject(TSYRINGE_TOKENS.IAuthUserRepository)
        private userRepository: IAuthUserRepository
    ) {}

    /**
     * Creates a new session.
     * @param session - The session data to create.
     * @returns The created session.
     */
    async createSession(session: AdapterSession): Promise<AdapterSession> {
        await this.sessionRepository.createSession(session);
        return session;
    }

    /**
     * Retrieves a session and its associated user by session token.
     * @param sessionToken - The session token.
     * @returns The session and user, or null if not found.
     */
    async getSessionAndUser(
        sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
        const session = await this.sessionRepository.findSession(sessionToken);
        if (!session) return null;
        const user = await this.userRepository.findUserById(session.userId);
        if (!user) return null;
        return { session, user };
    }

    /**
     * Updates an existing session.
     * @param session - The session data to update.
     * @returns The updated session or null if not found.
     */
    async updateSession(
        session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null> {
        return await this.sessionRepository.updateSession(
            session.sessionToken,
            session
        );
    }

    /**
     * Deletes a session by its token and returns the deleted session.
     * @param sessionToken - The session token to delete.
     * @returns The deleted session or null if not found.
     */
    async deleteSession(sessionToken: string): Promise<AdapterSession | null> {
        const session = await this.sessionRepository.findSession(sessionToken);
        if (!session) return null;
        await this.sessionRepository.deleteSession(sessionToken);
        return session;
    }
}
