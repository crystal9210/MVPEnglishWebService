import { User } from "@/schemas/userSchemas";
import { ProblemResult } from "@/schemas/userHistorySchemas";

export interface IUserService {
    createUser(user: User): Promise<void>;
    getUserById(uid: string): Promise<User | null>;
    updateUser(user: Partial<User> & { uid: string }): Promise<void>;
    deleteUser(uid: string): Promise<void>;
    saveAllProblemResults(userId: string, problemResults: ProblemResult[]): Promise<void>;
}
