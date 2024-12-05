import { FirebaseAdmin } from "./firebaseAdmin";
import { Firestore, CollectionReference, DocumentData } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { UserSchema, User } from "../schemas/userSchemas";
import { Logger } from "@/utils/logger";

@injectable()
export class UserService {
    private firestore: Firestore;
    private usersCollection: CollectionReference<DocumentData>;

    constructor(@inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin) {
        this.firestore = this.firebaseAdmin.firestore;
        this.usersCollection = this.firestore.collection("users");
    }

    async getUserById(uid: string): Promise<User | null> {
        try {
            const userRef = this.usersCollection.doc(uid);
            const docSnap = await userRef.get();
            if (docSnap.exists) {
                const data = docSnap.data() as DocumentData;
                const parsed = UserSchema.safeParse(data);
                if (parsed.success) {
                    return parsed.data;
                } else {
                    Logger.warn(`Invalid user data: UID = ${uid}`);
                }
            }
            return null;
        } catch (error) {
            Logger.error(`Failed to get user by UID: ${uid}`, error);
            throw error;
        }
    }

    async updateUser(uid: string, userData: Partial<User>): Promise<void> {
        try {
            const userRef = this.usersCollection.doc(uid);
            const parsed = UserSchema.partial().safeParse(userData);
            if (!parsed.success) {
                throw new Error("Invalid user data for update");
            }
            await userRef.update(parsed.data);
            Logger.info(`User updated with UID: ${uid}`);
        } catch (error) {
            Logger.error(`Failed to update user with UID: ${uid}`, error);
            throw error;
        }
    }
}
