/* eslint-disable no-unused-vars */
/**
 * Defines the structure of an Authenticator object.
 */
export interface IAuthenticator {
    /** Unique identifier for the Authenticator */
    id: string;
    /** Associated user's ID */
    userId: string;
    /** Type of Authenticator (e.g., totp, webauthn) */
    type: string;
    /** Credential's unique ID */
    credentialID: string;
    /** Counter value (if applicable) */
    counter: number;
}

/**
 * Defines the contract for AuthenticatorService.
 */
export interface IAuthenticatorService {
    /**
     * Retrieves an Authenticator by its credential ID.
     * @param credentialID - The unique credential ID of the Authenticator.
     * @returns The Authenticator object or null if not found.
     */
    getAuthenticator(credentialID: string): Promise<IAuthenticator | null>;

    /**
     * Creates a new Authenticator.
     * @param authenticator - The Authenticator data excluding the ID.
     * @returns The created Authenticator object.
     */
    createAuthenticator(
        authenticator: Omit<IAuthenticator, "id">
    ): Promise<IAuthenticator>;

    /**
     * Lists all Authenticators associated with a user ID.
     * @param userId - The user's ID.
     * @returns An array of Authenticator objects.
     */
    listAuthenticatorsByUserId(userId: string): Promise<IAuthenticator[]>;

    /**
     * Updates the counter for a specific Authenticator.
     * @param credentialID - The unique credential ID of the Authenticator.
     * @param newCounter - The new counter value.
     * @returns The updated Authenticator object or null if not found.
     */
    updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<IAuthenticator | null>;
}
