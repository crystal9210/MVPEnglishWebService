import { injectable, inject } from "tsyringe";
import { IAuthenticatorService } from "@/interfaces/services/IAuthenticatorService";
import type { IAuthenticatorRepository } from "@/interfaces/repositories/IAuthenticatorRepository";
import { AdapterAuthenticator } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthenticatorService implements IAuthenticatorService {
    constructor(
        @inject(TSYRINGE_TOKENS.IAuthenticatorRepository)
        private authenticatorRepository: IAuthenticatorRepository
    ) {}

    /**
     * Retrieves an authenticator by its credential ID.
     * @param credentialID The credential ID.
     * @returns The AdapterAuthenticator or null if not found.
     */
    async getAuthenticator(
        credentialID: string
    ): Promise<AdapterAuthenticator | null> {
        return await this.authenticatorRepository.getAuthenticator(
            credentialID
        );
    }

    /**
     * Creates a new authenticator.
     * @param authenticator The authenticator to create.
     * @returns The created AdapterAuthenticator.
     */
    async createAuthenticator(
        authenticator: Omit<AdapterAuthenticator, "id"> & { userId: string }
    ): Promise<AdapterAuthenticator> {
        return await this.authenticatorRepository.createAuthenticator(
            authenticator
        );
    }

    /**
     * Lists all authenticators associated with a user ID.
     * @param userId The user ID.
     * @returns An array of AdapterAuthenticator.
     */
    async listAuthenticatorsByUserId(
        userId: string
    ): Promise<AdapterAuthenticator[]> {
        return await this.authenticatorRepository.listAuthenticatorsByUserId(
            userId
        );
    }

    /**
     * Updates the counter for a specific authenticator.
     * @param credentialID The credential ID.
     * @param newCounter The new counter value.
     * @returns The updated AdapterAuthenticator.
     */
    async updateAuthenticatorCounter(
        credentialID: string,
        newCounter: number
    ): Promise<AdapterAuthenticator> {
        return await this.authenticatorRepository.updateAuthenticatorCounter(
            credentialID,
            newCounter
        );
    }
}
