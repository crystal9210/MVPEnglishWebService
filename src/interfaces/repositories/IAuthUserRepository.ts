/* eslint-disable no-unused-vars */
import type { AdapterUser } from "next-auth/adapters";

export interface IAuthUserRepository {
    /**
     * Creates a new user in the database.
     * @param user - The user data to create.
     */
    createUser(user: AdapterUser): Promise<AdapterUser>;

    /**
     * Finds a user by their ID.
     * @param id - The user ID.
     * @returns The user or null if not found.
     */
    findUserById(id: string): Promise<AdapterUser | null>;

    /**
     * Finds a user by their email.
     * @param email - The user's email.
     * @returns The user or null if not found.
     */
    findUserByEmail(email: string): Promise<AdapterUser | null>;

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
