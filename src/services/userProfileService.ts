import { FirebaseAdmin } from "./firebaseAdmin";
import { Firestore } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { UserProfileSchema, UserProfile } from "../schemas/userSchemas";
import { Logger } from "@/services/loggerService";

@injectable()
export class UserProfileService {
    private firestore: Firestore;

    constructor(@inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin) {
        this.firestore = this.firebaseAdmin.firestore;
    }

    async getUserProfile(uid: string, profileId: string): Promise<UserProfile | null> {
        try {
        const profileRef = this.firestore.collection("users").doc(uid).collection("profiles").doc(profileId);
        const docSnap = await profileRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            const parsed = UserProfileSchema.safeParse(data);
            if (parsed.success) {
            return parsed.data;
            } else {
            Logger.warn(`Invalid profile data: UID = ${uid}, Profile ID = ${profileId}`);
            }
        }
        return null;
        } catch (error) {
        Logger.error(`Failed to get profile for UID: ${uid}, Profile ID: ${profileId}`, error);
        throw error;
        }
    }

    async upsertUserProfile(uid: string, profileId: string, profileData: Partial<UserProfile>): Promise<void> {
        try {
        const profileRef = this.firestore.collection("users").doc(uid).collection("profiles").doc(profileId);
        const parsed = UserProfileSchema.partial().safeParse(profileData);
        if (!parsed.success) {
            throw new Error("Invalid profile data for upsert");
        }
        await profileRef.set(parsed.data, { merge: true });
        Logger.info(`Profile upserted for UID: ${uid}, Profile ID: ${profileId}`);
        } catch (error) {
        Logger.error(`Failed to upsert profile for UID: ${uid}, Profile ID: ${profileId}`, error);
        throw error;
        }
    }
}
