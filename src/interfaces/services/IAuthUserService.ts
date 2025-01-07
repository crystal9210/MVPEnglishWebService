/* eslint-disable no-unused-vars */
import type { AdapterUser } from "next-auth/adapters";

export interface IAuthUserService {
    /**
     * Creates a new user.
     * @param user - The user data to create.
     */
    createUser(user: AdapterUser): Promise<AdapterUser>;

    /**
     * Retrieves a user by their ID.
     * @param id - The user ID.
     * @returns The user or null if not found.
     */
    getUserById(id: string): Promise<AdapterUser | null>;

    /**
     * Retrieves a user by their email.
     * @param email - The user's email.
     * @returns The user or null if not found.
     */
    getUserByEmail(email: string): Promise<AdapterUser | null>;

    /**
     * Updates a user's data.
     * @param user - Partial user data with the user ID.
     */
    updateUser(
        user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser>;

    /**
     * Deletes a user by their ID.
     * @param id - The user ID.
     */
    deleteUser(id: string): Promise<void>;
}
