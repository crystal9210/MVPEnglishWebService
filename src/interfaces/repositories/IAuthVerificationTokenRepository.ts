/* eslint-disable no-unused-vars */
import type { VerificationToken } from "next-auth/adapters";

export interface IAuthVerificationTokenRepository {
    /**
     * Creates a new verification token in the database.
     * @param verificationToken - The verification token data to create.
     */
    createToken(verificationToken: VerificationToken): Promise<void>;

    /**
     * Finds a verification token by identifier and token.
     * @param identifier - The identifier associated with the token.
     * @param token - The token string.
     * @returns The verification token or null if not found.
     */
    findToken(
        identifier: string,
        token: string
    ): Promise<VerificationToken | null>;

    /**
     * Deletes a verification token by identifier and token.
     * @param identifier - The identifier associated with the token.
     * @param token - The token string.
     */
    deleteToken(identifier: string, token: string): Promise<void>;
}
