import "reflect-metadata";
import { injectable, inject } from "tsyringe";
import {
    Adapter,
    AdapterUser,
    AdapterAccount,
    AdapterSession,
    VerificationToken,
    AdapterAuthenticator,
} from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthUserService } from "@/interfaces/services/IAuthUserService";
import type { IAuthAccountService } from "@/interfaces/services/IAuthAccountService";
import type { IAuthSessionService } from "@/interfaces/services/IAuthSessionService";
import type { IAuthVerificationTokenService } from "@/interfaces/services/IAuthVerificationTokenService";
import type { IAuthenticatorService } from "@/interfaces/services/IAuthenticatorService";

@injectable()
export class CustomFirestoreAdapter implements Adapter {
    constructor(
        @inject(TSYRINGE_TOKENS.ILoggerService) private logger: ILoggerService,
        @inject(TSYRINGE_TOKENS.IAuthUserService)
        private userService: IAuthUserService,
        @inject(TSYRINGE_TOKENS.IAuthAccountService)
        private accountService: IAuthAccountService,
        @inject(TSYRINGE_TOKENS.IAuthSessionService)
        private sessionService: IAuthSessionService,
        @inject(TSYRINGE_TOKENS.IAuthVerificationTokenService)
        private verificationTokenService: IAuthVerificationTokenService,
        @inject(TSYRINGE_TOKENS.IAuthenticatorService)
        private authenticatorService: IAuthenticatorService
    ) {}

    /**
     * Creates a new user in Firestore and Firebase Auth if they don't exist.
     * @param user The user object containing email, name, and image.
     * @returns The created AdapterUser.
     */
    async createUser(user: AdapterUser): Promise<AdapterUser> {
        this.logger.info("Creating user", { user });
        try {
            const createdUser = await this.userService.createUser(user);
            return createdUser;
        } catch (error) {
            this.logger.error("Failed to create user", { error });
            throw error;
        }
    }

    /**
     * Retrieves a user by their ID.
     * @param id The user's ID.
     * @returns The AdapterUser or null if not found.
     */
    async getUser(id: string): Promise<AdapterUser | null> {
        this.logger.info("Getting user by ID", { id });
        try {
            return await this.userService.getUserById(id);
        } catch (error) {
            this.logger.error(`Failed to get user with ID ${id}`, { error });
            throw error;
        }
    }

    /**
     * Retrieves a user by their email.
     * @param email The user's email.
     * @returns The AdapterUser or null if not found.
     */
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
        this.logger.info("Getting user by email", { email });
        try {
            return await this.userService.getUserByEmail(email);
        } catch (error) {
            this.logger.error(`Failed to get user by email ${email}`, {
                error,
            });
            throw error;
        }
    }

    /**
     * Retrieves a user by their account information.
     * @param account The account details containing provider and providerAccountId.
     * @returns The AdapterUser or null if not found.
     */
    async getUserByAccount({
        provider,
        providerAccountId,
    }: {
        provider: string;
        providerAccountId: string;
    }): Promise<AdapterUser | null> {
        this.logger.info("Getting user by account", {
            provider,
            providerAccountId,
        });
        try {
            return await this.accountService
                .getAccount(provider, providerAccountId)
                .then((account) => {
                    if (!account) return null;
                    return this.userService.getUserById(account.userId);
                });
        } catch (error) {
            this.logger.error(
                `Failed to get user by account ${provider}/${providerAccountId}`,
                { error }
            );
            throw error;
        }
    }

    /**
     * Updates a user's information.
     * @param user Partial user object with updates and the user's ID.
     * @returns The updated AdapterUser.
     */
    async updateUser(
        user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser> {
        this.logger.info("Updating user", { user });
        try {
            return await this.userService.updateUser(user);
        } catch (error) {
            this.logger.error(`Failed to update user with ID ${user.id}`, {
                error,
            });
            throw error;
        }
    }

    /**
     * Deletes a user from Firestore and Firebase Auth.
     * @param userId The ID of the user to delete.
     */
    async deleteUser(userId: string): Promise<void> {
        this.logger.info("Deleting user", { userId });
        try {
            await this.userService.deleteUser(userId);
        } catch (error) {
            this.logger.error(`Failed to delete user with ID: ${userId}`, {
                error,
            });
            throw error;
        }
    }

    /**
     * Links an account to a user.
     * @param account The account information to link.
     */
    async linkAccount(account: AdapterAccount): Promise<void> {
        this.logger.info("Linking account", { account });
        try {
            await this.accountService.linkAccount(account);
        } catch (error) {
            this.logger.error("Failed to link account", { error });
            throw error;
        }
    }

    /**
     * Unlinks an account from a user.
     * @param params The provider and providerAccountId of the account to unlink.
     */
    async unlinkAccount({
        provider,
        providerAccountId,
    }: {
        provider: string;
        providerAccountId: string;
    }): Promise<void> {
        this.logger.info("Unlinking account", { provider, providerAccountId });
        try {
            await this.accountService.unlinkAccount({
                provider,
                providerAccountId,
            });
        } catch (error) {
            this.logger.error("Failed to unlink account", { error });
            throw error;
        }
    }

    /**
     * Creates a new session.
     * @param session The session information to create.
     * @returns The created AdapterSession.
     */
    async createSession(session: AdapterSession): Promise<AdapterSession> {
        this.logger.info("Creating session", { session });
        try {
            await this.sessionService.createSession(session);
            return session;
        } catch (error) {
            this.logger.error("Failed to create session", { error });
            throw error;
        }
    }

    /**
     * Retrieves a session and its associated user.
     * @param sessionToken The session token.
     * @returns An object containing the session and user or null if not found.
     */
    async getSessionAndUser(
        sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
        this.logger.info("Getting session and user", { sessionToken });
        try {
            const sessionData = await this.sessionService.getSessionAndUser(
                sessionToken
            );
            if (!sessionData) return null;
            const user = await this.userService.getUserById(
                sessionData.user.id
            );
            if (!user) return null;
            return {
                session: sessionData.session,
                user,
            };
        } catch (error) {
            this.logger.error("Failed to get session and user", { error });
            throw error;
        }
    }

    /**
     * Updates a session's information.
     * @param session Partial session object with updates and the session token.
     * @returns The updated AdapterSession or null if not found.
     */
    async updateSession(
        session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null> {
        this.logger.info("Updating session", { session });
        try {
            return await this.sessionService.updateSession(session);
        } catch (error) {
            this.logger.error("Failed to update session", { error });
            throw error;
        }
    }

    /**
     * Deletes a session.
     * @param sessionToken The session token to delete.
     */
    async deleteSession(sessionToken: string): Promise<void> {
        this.logger.info("Deleting session", { sessionToken });
        try {
            await this.sessionService.deleteSession(sessionToken);
        } catch (error) {
            this.logger.error("Failed to delete session", { error });
            throw error;
        }
    }

    /**
     * Creates a verification token.
     * @param verificationToken The verification token to create.
     * @returns The created VerificationToken.
     */
    async createVerificationToken(
        verificationToken: VerificationToken
    ): Promise<VerificationToken> {
        this.logger.info("Creating verification token", { verificationToken });
        try {
            return await this.verificationTokenService.createVerificationToken(
                verificationToken
            );
        } catch (error) {
            this.logger.error("Failed to create verification token", { error });
            throw error;
        }
    }

    /**
     * Uses a verification token to authenticate a user.
     * @param params The identifier and token to verify.
     * @returns The VerificationToken if valid, otherwise null.
     */
    async useVerificationToken(params: {
        identifier: string;
        token: string;
    }): Promise<VerificationToken | null> {
        this.logger.info("Using verification token", { params });
        try {
            return await this.verificationTokenService.useVerificationToken(
                params
            );
        } catch (error) {
            this.logger.error("Failed to use verification token", { error });
            throw error;
        }
    }

    /**
     * Retrieves an account by provider and providerAccountId.
     * @param provider The provider name.
     * @param providerAccountId The provider's account ID.
     * @returns The AdapterAccount or null if not found.
     */
    async getAccount(
        providerAccountId: string,
        provider: string
    ): Promise<AdapterAccount | null> {
        this.logger.info("Getting account", { provider, providerAccountId });
        try {
            return await this.accountService.getAccount(
                provider,
                providerAccountId
            );
        } catch (error) {
            this.logger.error("Failed to get account", { error });
            throw error;
        }
    }

    /**
     * Retrieves an authenticator by its credentialID.
     * @param credentialID The credential ID.
     * @returns The AdapterAuthenticator or null if not found.
     */
    async getAuthenticator(
        credentialID: string
    ): Promise<AdapterAuthenticator | null> {
        this.logger.info("Getting authenticator", { credentialID });
        try {
            return await this.authenticatorService.getAuthenticator(
                credentialID
            );
        } catch (error) {
            this.logger.error("Failed to get authenticator", { error });
            throw error;
        }
    }

    /**
     * Creates a new authenticator.
     * @param authenticator The authenticator to create.
     * @returns The created AdapterAuthenticator.
     */
    async createAuthenticator(
        authenticator: AdapterAuthenticator
    ): Promise<AdapterAuthenticator> {
        this.logger.info("Creating authenticator", { authenticator });
        try {
            return await this.authenticatorService.createAuthenticator(
                authenticator
            );
        } catch (error) {
            this.logger.error("Failed to create authenticator", { error });
            throw error;
        }
    }

    /**
     * Lists all authenticators associated with a user ID.
     * @param userId The user ID.
     * @returns An array of AdapterAuthenticator.
     */
    async listAuthenticatorsByUserId(
        userId: string
    ): Promise<AdapterAuthenticator[]> {
        this.logger.info("Listing authenticators by user ID", { userId });
        try {
            return await this.authenticatorService.listAuthenticatorsByUserId(
                userId
            );
        } catch (error) {
            this.logger.error("Failed to list authenticators", { error });
            throw error;
        }
    }

    /**
     * Updates an authenticator's counter.
     * @param credentialID The credential ID.
     * @param newCounter The new counter value.
     * @returns The updated AdapterAuthenticator.
     */
    async updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<AdapterAuthenticator> {
        this.logger.info("Updating authenticator counter", {
            credentialID,
            newCounter,
        });
        try {
            return await this.authenticatorService.updateAuthenticatorCounter(
                credentialID,
                newCounter
            );
        } catch (error) {
            this.logger.error("Failed to update authenticator counter", {
                error,
            });
            throw error;
        }
    }
}
