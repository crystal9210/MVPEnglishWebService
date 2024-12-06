// ok
import { injectable, inject } from "tsyringe";
import type { IProfileRepository } from "@/interfaces/repositories/IProfileRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { UserProfile } from "@/schemas/userSchemas";
import { UserProfileSchema } from "@/schemas/userSchemas";

@injectable()
export class ProfileRepository implements IProfileRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async getProfile(userId: string): Promise<UserProfile | null> {
        const firestore = this.firebaseAdmin.getFirestore();
        const profileRef = firestore.collection("users").doc(userId).collection("profiles").doc("main");
        const docSnap = await profileRef.get();
        if (!docSnap.exists) {
            this.logger.warn(`Profile not found: UID=${userId}`);
            return null;
        }
        const data = docSnap.data();
        const parsed = UserProfileSchema.safeParse(data);
        if (!parsed.success) {
            this.logger.warn(`Invalid profile data: UID=${userId}`, { errors: parsed.error.errors });
            return null;
        }
        this.logger.info(`Profile retrieved: UID=${userId}`);
        return parsed.data;
    }

    async upsertProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
        const firestore = this.firebaseAdmin.getFirestore();
        const parsed = UserProfileSchema.partial().safeParse(profileData);
        if (!parsed.success) {
            this.logger.warn(`Invalid profile data for upsert: UID=${userId}`, { errors: parsed.error.errors });
            throw new Error("Invalid profile data for upsert");
        }
        const profileRef = firestore.collection("users").doc(userId).collection("profiles").doc("main");
        await profileRef.set(parsed.data, { merge: true });
        this.logger.info(`Profile upserted: UID=${userId}`);
    }

    async deleteProfile(userId: string): Promise<void> {
        const firestore = this.firebaseAdmin.getFirestore();
        const profileRef = firestore.collection("users").doc(userId).collection("profiles").doc("main");
        await profileRef.delete();
        this.logger.info(`Profile deleted: UID=${userId}`);
    }
}
