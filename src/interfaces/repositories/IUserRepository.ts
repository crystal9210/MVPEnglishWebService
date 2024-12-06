/* eslint-disable no-unused-vars */
import { User } from "@/schemas/userSchemas";

export interface IUserRepository {
    findUserById(uid: string): Promise<User | null>;
    createUser(user: User): Promise<void>;
    updateUser(user: Partial<User> & { uid: string }): Promise<void>;
    deleteUser(uid: string): Promise<void>;
}
