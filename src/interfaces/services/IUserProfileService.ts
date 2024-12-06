import { UserProfile } from "@/schemas/userSchemas";

export interface IUserProfileService {
    getUserProfile(uid: string, profileId: string): Promise<UserProfile | null>;
    upsertUserProfile(uid: string, profileId: string, profileData: Partial<UserProfile>): Promise<void>;
}
