// ok
import type { UserProfile } from "@/schemas/userSchemas";

export interface IUserProfileService {
    getUserProfile(userId: string): Promise<UserProfile | null>;
    upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void>;
    deleteUserProfile(userId: string): Promise<void>;
}
