/* eslint-disable no-unused-vars */
import type { AdapterAuthenticator } from "next-auth/adapters";

export interface IAuthenticatorRepository {
    /**
     * Retrieves an authenticator by its credentialID.
     * @param credentialID - The credential ID.
     * @returns The authenticator or null if not found.
     */
    getAuthenticator(
        credentialID: string
    ): Promise<AdapterAuthenticator | null>;

    /**
     * Creates a new authenticator.
     * @param authenticator - The authenticator data to create.
     * @returns The created authenticator.
     */
    createAuthenticator(
        authenticator: Omit<AdapterAuthenticator, "id">
    ): Promise<AdapterAuthenticator>;

    /**
     * Lists all authenticators associated with a user ID.
     * @param userId - The user ID.
     * @returns An array of authenticators.
     */
    listAuthenticatorsByUserId(userId: string): Promise<AdapterAuthenticator[]>;

    /**
     * Updates an authenticator's counter.
     * @param credentialID - The credential ID.
     * @param newCounter - The new counter value.
     * @returns The updated authenticator or null if not found.
     */
    updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<AdapterAuthenticator>;
}
