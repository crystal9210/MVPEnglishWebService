import { Firestore, CollectionReference, DocumentData } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { FirebaseAdmin } from "@/services/firebaseAdmin";
import { User, UserSchema } from "@/schemas/userSchemas";
import { Logger } from "@/utils/logger";

@injectable()
export class UserRepository {
    private firestore: Firestore;
    private userCollection: CollectionReference<DocumentData>;

    constructor(@inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin) {
        this.firestore = this.firebaseAdmin.firestore;
        this.userCollection = this.firestore.collection("users");
    }

    async saveUser
}
