import { injectable, inject } from "tsyringe";
import type { IUserProfileService } from "@/interfaces/services/IUserProfileService";
import type { IProfileRepository } from "@/interfaces/repositories/IProfileRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { UserProfile } from "@/schemas/userSchemas";

@injectable()
export class UserProfileService implements IUserProfileService {
    constructor(
        @inject("IProfileRepository") private readonly profileRepository: IProfileRepository,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const profile = await this.profileRepository.getProfile(userId);
        if (profile) {
            this.logger.info(`User profile retrieved in service: UID=${userId}`);
        } else {
            this.logger.warn(`User profile not found in service: UID=${userId}`);
        }
        return profile;
    }

    async upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
        await this.profileRepository.upsertProfile(userId, profileData);
        this.logger.info(`User profile upserted in service: UID=${userId}`);
    }

    async deleteUserProfile(userId: string): Promise<void> {
        await this.profileRepository.deleteProfile(userId);
        this.logger.info(`User profile deleted in service: UID=${userId}`);
    }
}
