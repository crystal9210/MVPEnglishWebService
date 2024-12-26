/* eslint-disable no-unused-vars */
import { AdapterAccount } from "next-auth/adapters";
import type { UserRecord } from "firebase-admin/auth";

export interface IAuthService {
    /**
     * Creates an account entry in the authentication system.
     * @param uid The unique identifier for the user.
     * @param accountData The account data to be stored.
     * @returns A promise that resolves when the account entry is created.
     */
    createAccountEntry(uid: string, accountData: AdapterAccount): Promise<void>;

    /**
     * Retrieves a user record by their email address.
     * @param email The email address of the user to retrieve.
     * @returns A promise that resolves to the user record, or undefined if not found.
     */
    getUserByEmail(email: string): Promise<UserRecord | undefined>;

    /**
     * Creates a new user in the authentication system.
     * @param email The email address of the new user.
     * @param name The optional name of the new user.
     * @param photoURL The optional photo URL of the new user.
     * @returns A promise that resolves to the created user record.
     */
    createUser(email: string, name?: string, photoURL?: string): Promise<UserRecord>;

    /**
     * Deletes a user from the authentication system.
     * @param uid The unique identifier of the user to delete.
     * @returns A promise that resolves when the user is deleted.
     */
    deleteUser(uid: string): Promise<void>;
}
