/* eslint-disable no-unused-vars */
import { User } from "@/schemas/userSchemas";

export interface IUserRepository {
    /**
     * Finds a user by their unique identifier.
     * @param uid The unique identifier of the user to find.
     * @returns A promise that resolves to the user data, or null if not found.
     */
    findUserById(uid: string): Promise<User | null>;

    /**
     * Creates a new user in the data store.
     * @param user The user data to be stored.
     * @returns A promise that resolves when the user is created.
     */
    createUser(user: User): Promise<void>;

    /**
     * Updates an existing user in the data store.
     * @param user The partial user data to update, including the user's unique identifier.
     * @returns A promise that resolves when the user is updated.
     */
    updateUser(user: Partial<User> & { uid: string }): Promise<void>;

    /**
     * Deletes a user from the data store.
     * @param uid The unique identifier of the user to delete.
     * @returns A promise that resolves when the user is deleted.
     */
    deleteUser(uid: string): Promise<void>;
}
