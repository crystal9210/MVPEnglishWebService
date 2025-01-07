// src/adapters/customFirestoreAdapter.ts

import { injectable, inject } from "tsyringe";
import {
    Adapter,
    AdapterUser,
    AdapterAccount,
    AdapterSession,
    VerificationToken,
} from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthService } from "@/interfaces/services/IAuthService";
import type {
    IAuthenticatorService,
    IAuthenticator,
} from "@/interfaces/services/IAuthenticatorService";
import { FieldValue } from "firebase-admin/firestore";

@injectable()
export class CustomFirestoreAdapter implements Adapter {
    private firebaseAdmin: IFirebaseAdmin;
    private logger: ILoggerService;
    private authService: IAuthService;
    private authenticatorService: IAuthenticatorService;
    private firestore: ReturnType<IFirebaseAdmin["getFirestore"]>;

    constructor(
        @inject(TSYRINGE_TOKENS.IFirebaseAdmin) firebaseAdmin: IFirebaseAdmin,
        @inject(TSYRINGE_TOKENS.ILoggerService) logger: ILoggerService,
        @inject(TSYRINGE_TOKENS.IAuthService) authService: IAuthService,
        @inject(TSYRINGE_TOKENS.IAuthenticatorService)
        authenticatorService: IAuthenticatorService
    ) {
        this.firebaseAdmin = firebaseAdmin;
        this.logger = logger;
        this.authService = authService;
        this.authenticatorService = authenticatorService;
        this.firestore = this.firebaseAdmin.getFirestore();
    }

    /**
     * Creates a new user in Firestore and Firebase Auth if they don't exist.
     * @param user The user object containing email, name, and image.
     * @returns The created AdapterUser.
     */
    async createUser(user: AdapterUser): Promise<AdapterUser> {
        const { email, name, image } = user;

        let firebaseUser = await this.authService.getUserByEmail(email!);
        if (!firebaseUser) {
            firebaseUser = await this.authService.createUser(
                email!,
                name || undefined,
                image || undefined
            );
        }

        const userDocRef = this.firestore
            .collection("users")
            .doc(firebaseUser.uid);
        await userDocRef.set({
            email: firebaseUser.email,
            name: firebaseUser.displayName || name,
            image: firebaseUser.photoURL || image,
            emailVerified: firebaseUser.emailVerified,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || name,
            image: firebaseUser.photoURL || image,
            emailVerified: firebaseUser.emailVerified
                ? new Date(firebaseUser.metadata?.lastSignInTime ?? Date.now())
                : null,
        } as AdapterUser;
    }

    /**
     * Retrieves a user by their ID.
     * @param id The user's ID.
     * @returns The AdapterUser or null if not found.
     */
    async getUser(id: string): Promise<AdapterUser | null> {
        const userDoc = await this.firestore.collection("users").doc(id).get();
        if (!userDoc.exists) return null;

        const data = userDoc.data()!;
        return {
            id,
            email: data.email,
            name: data.name,
            image: data.image,
            emailVerified: data.emailVerified
                ? new Date(data.emailVerified.seconds * 1000)
                : null,
        } as AdapterUser;
    }

    /**
     * Retrieves a user by their email.
     * @param email The user's email.
     * @returns The AdapterUser or null if not found.
     */
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
        const userCollection = this.firestore.collection("users");
        const userQuerySnapshot = await userCollection
            .where("email", "==", email)
            .limit(1)
            .get();

        if (userQuerySnapshot.empty) return null;

        const userDoc = userQuerySnapshot.docs[0];
        const userData = userDoc.data();
        return {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            image: userData.image,
            emailVerified: userData.emailVerified
                ? new Date(userData.emailVerified.seconds * 1000)
                : null,
        } as AdapterUser;
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
        const accountsCollection = this.firestore.collection("accounts");
        const accountQuerySnapshot = await accountsCollection
            .where("provider", "==", provider)
            .where("providerAccountId", "==", providerAccountId)
            .limit(1)
            .get();

        if (accountQuerySnapshot.empty) return null;

        const accountData = accountQuerySnapshot.docs[0].data();
        if (!accountData.userId) {
            throw new Error("Account data does not contain a valid userId.");
        }

        const user = await this.getUser(accountData.userId);
        return user;
    }

    /**
     * Updates a user's information.
     * @param user Partial user object with updates and the user's ID.
     * @returns The updated AdapterUser.
     */
    async updateUser(
        user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser> {
        const userDocRef = this.firestore.collection("users").doc(user.id);

        await userDocRef.update({
            ...(user.name && { name: user.name }),
            ...(user.image && { image: user.image }),
            ...(user.emailVerified !== undefined && {
                emailVerified: user.emailVerified,
            }),
            updatedAt: FieldValue.serverTimestamp(),
        });

        const updatedDoc = await userDocRef.get();
        const data = updatedDoc.data();

        if (!data) {
            throw new Error(
                `Failed to fetch updated user data for id: ${user.id}`
            );
        }

        return {
            id: user.id,
            email: data.email || "",
            name: data.name || null,
            image: data.image || null,
            emailVerified: data.emailVerified
                ? new Date(data.emailVerified.seconds * 1000)
                : null,
        } as AdapterUser;
    }

    /**
     * Deletes a user from Firestore and Firebase Auth.
     * @param userId The ID of the user to delete.
     */
    async deleteUser(userId: string): Promise<void> {
        try {
            await this.authService.deleteUser(userId);

            const userDocRef = this.firestore.collection("users").doc(userId);
            await userDocRef.delete();
        } catch (error) {
            this.logger.error(`Error deleting user with ID: ${userId}`, {
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
        try {
            const accountsCollection = this.firestore.collection("accounts");
            const accountDocRef = accountsCollection.doc(
                `${account.provider}-${account.providerAccountId}`
            );

            await accountDocRef.set({
                userId: account.userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token || null,
                refresh_token: account.refresh_token || null,
                expires_at: account.expires_at || null,
                token_type: account.token_type || null,
                scope: account.scope || null,
                id_token: account.id_token || null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
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
        try {
            const accountsCollection = this.firestore.collection("accounts");
            const accountDocRef = accountsCollection.doc(
                `${provider}-${providerAccountId}`
            );

            await accountDocRef.delete();
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
        try {
            const sessionsCollection = this.firestore.collection("sessions");
            const sessionDocRef = sessionsCollection.doc(session.sessionToken);

            await sessionDocRef.set({
                sessionToken: session.sessionToken,
                userId: session.userId,
                expires: session.expires,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

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
        try {
            const sessionsCollection = this.firestore.collection("sessions");
            const sessionDoc = await sessionsCollection.doc(sessionToken).get();

            if (!sessionDoc.exists) return null;

            const sessionData = sessionDoc.data()!;
            const user = await this.getUser(sessionData.userId);

            if (!user) return null;

            return {
                session: {
                    sessionToken: sessionData.sessionToken,
                    userId: sessionData.userId,
                    expires: sessionData.expires.toDate(),
                },
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
    ): Promise<AdapterSession | null | undefined> {
        try {
            const sessionsCollection = this.firestore.collection("sessions");
            const sessionDocRef = sessionsCollection.doc(session.sessionToken);

            await sessionDocRef.update({
                ...(session.userId && { userId: session.userId }),
                ...(session.expires && { expires: session.expires }),
                updatedAt: FieldValue.serverTimestamp(),
            });

            const updatedDoc = await sessionDocRef.get();
            if (!updatedDoc.exists) return null;

            const data = updatedDoc.data()!;
            return {
                sessionToken: data.sessionToken,
                userId: data.userId,
                expires: data.expires.toDate(),
            } as AdapterSession;
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
        try {
            const sessionsCollection = this.firestore.collection("sessions");
            const sessionDocRef = sessionsCollection.doc(sessionToken);

            await sessionDocRef.delete();
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
    ): Promise<VerificationToken | null | undefined> {
        try {
            const verificationRequestsCollection = this.firestore.collection(
                "verificationRequests"
            );
            const verificationDocRef = verificationRequestsCollection.doc(
                verificationToken.identifier
            );

            await verificationDocRef.set({
                identifier: verificationToken.identifier,
                token: verificationToken.token,
                expires: verificationToken.expires,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

            return verificationToken;
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
        try {
            const verificationRequestsCollection = this.firestore.collection(
                "verificationRequests"
            );
            const verificationDoc = await verificationRequestsCollection
                .doc(params.identifier)
                .get();

            if (!verificationDoc.exists) return null;

            const verificationData = verificationDoc.data()!;
            if (verificationData.token !== params.token) return null;
            if (verificationData.expires.toDate() < new Date()) return null;

            // Delete the verification token after use
            await verificationRequestsCollection
                .doc(params.identifier)
                .delete();

            return verificationData as VerificationToken;
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
        try {
            const accountsCollection = this.firestore.collection("accounts");
            const accountDoc = await accountsCollection
                .doc(`${provider}-${providerAccountId}`)
                .get();

            if (!accountDoc.exists) return null;

            const accountData = accountDoc.data()!;
            if (accountData.provider !== provider) return null;

            return {
                type: accountData.type,
                provider: accountData.provider,
                providerAccountId: accountData.providerAccountId,
                userId: accountData.userId,
                access_token: accountData.access_token || null,
                refresh_token: accountData.refresh_token || null,
                expires_at: accountData.expires_at || null,
                token_type: accountData.token_type || null,
                scope: accountData.scope || null,
                id_token: accountData.id_token || null,
            } as AdapterAccount;
        } catch (error) {
            this.logger.error("Failed to get account", { error });
            throw error;
        }
    }

    /**
     * Retrieves an authenticator by its credential ID.
     * @param credentialID The credential ID.
     * @returns The IAuthenticator or null if not found.
     */
    async getAuthenticator(
        credentialID: string
    ): Promise<IAuthenticator | null> {
        return this.authenticatorService.getAuthenticator(credentialID);
    }

    /**
     * Creates a new authenticator.
     * @param authenticator The authenticator to create.
     * @returns The created IAuthenticator.
     */
    async createAuthenticator(
        authenticator: Omit<IAuthenticator, "id">
    ): Promise<IAuthenticator> {
        return this.authenticatorService.createAuthenticator(authenticator);
    }

    /**
     * Lists all authenticators associated with a user ID.
     * @param userId The user ID.
     * @returns An array of IAuthenticator.
     */
    async listAuthenticatorsByUserId(
        userId: string
    ): Promise<IAuthenticator[]> {
        return this.authenticatorService.listAuthenticatorsByUserId(userId);
    }

    /**
     * Updates the counter for a specific authenticator.
     * @param credentialID The credential ID.
     * @param newCounter The new counter value.
     * @returns The updated IAuthenticator or null if not found.
     */
    async updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<IAuthenticator | null> {
        return this.authenticatorService.updateAuthenticatorCounter(
            credentialID,
            newCounter
        );
    }

    // Implement other methods as needed with proper types and comments
}
