import { inject, injectable } from "tsyringe";
import { IAuthVerificationTokenService } from "@/interfaces/services/IAuthVerificationTokenService";
import type { IAuthVerificationTokenRepository } from "@/interfaces/repositories/IAuthVerificationTokenRepository";
import { VerificationToken } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthVerificationTokenService
    implements IAuthVerificationTokenService
{
    constructor(
        @inject(TSYRINGE_TOKENS.IAuthVerificationTokenRepository)
        private verificationTokenRepository: IAuthVerificationTokenRepository
    ) {}

    /**
     * Creates a new verification token.
     * @param verificationToken - The verification token data to create.
     * @returns The created verification token.
     */
    async createVerificationToken(
        verificationToken: VerificationToken
    ): Promise<VerificationToken> {
        await this.verificationTokenRepository.createToken(verificationToken);
        return verificationToken;
    }

    /**
     * Uses a verification token, retrieving and deleting it.
     * @param identifier - The identifier associated with the token.
     * @param token - The token string.
     * @returns The verification token or null if not found.
     */
    async useVerificationToken(params: {
        identifier: string;
        token: string;
    }): Promise<VerificationToken | null> {
        const verificationToken =
            await this.verificationTokenRepository.findToken(
                params.identifier,
                params.token
            );
        if (!verificationToken) return null;
        await this.verificationTokenRepository.deleteToken(
            params.identifier,
            params.token
        );
        return verificationToken;
    }
}
