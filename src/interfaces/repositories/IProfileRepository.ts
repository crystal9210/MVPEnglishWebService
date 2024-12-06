// ok
import type { UserProfile } from "@/schemas/userSchemas";

export interface IProfileRepository {
    getProfile(userId: string): Promise<UserProfile | null>;
    upsertProfile(userId: string, profileData: Partial<UserProfile>): Promise<void>;
    deleteProfile(userId: string): Promise<void>;
}
