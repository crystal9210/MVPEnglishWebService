import type { VerificationToken } from "next-auth/adapters";

export interface IAuthVerificationTokenService {
    /**
     * Creates a new verification token.
     * @param verificationToken - The verification token data to create.
     * @returns The created verification token.
     */
    createVerificationToken(
        verificationToken: VerificationToken
    ): Promise<VerificationToken>;

    /**
     * Uses a verification token, retrieving and deleting it.
     * @param identifier - The identifier associated with the token.
     * @param token - The token string.
     * @returns The verification token or null if not found.
     */
    useVerificationToken(params: {
        identifier: string;
        token: string;
    }): Promise<VerificationToken | null>;
}
