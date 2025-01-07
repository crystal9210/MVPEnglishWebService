import { injectable, inject } from "tsyringe";
import { IAuthUserService } from "@/interfaces/services/IAuthUserService";
import type { IAuthUserRepository } from "@/interfaces/repositories/IAuthUserRepository";
import { AdapterUser } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthUserService implements IAuthUserService {
    constructor(
        @inject(TSYRINGE_TOKENS.IAuthUserRepository)
        private userRepository: IAuthUserRepository
    ) {}

    /**
     * Creates a new user.
     * @param user - The user data to create.
     */
    async createUser(user: AdapterUser): Promise<AdapterUser> {
        return await this.userRepository.createUser(user);
    }

    /**
     * Retrieves a user by their ID.
     * @param id - The user ID.
     * @returns The user or null if not found.
     */
    async getUserById(id: string): Promise<AdapterUser | null> {
        return await this.userRepository.findUserById(id);
    }

    /**
     * Retrieves a user by their email.
     * @param email - The user's email.
     * @returns The user or null if not found.
     */
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
        return await this.userRepository.findUserByEmail(email);
    }

    /**
     * Updates a user's data.
     * @param user - Partial user data with the user ID.
     */
    async updateUser(
        user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser> {
        return await this.userRepository.updateUser(user);
    }

    /**
     * Deletes a user by their ID.
     * @param id - The user ID.
     */
    async deleteUser(id: string): Promise<void> {
        await this.userRepository.deleteUser(id);
    }
}
