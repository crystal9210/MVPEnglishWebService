import * as admin from "firebase-admin"; // TODO * as がない場合と何が違う？
import { injectable } from "tsyringe";
import { Logger } from "@/utils/logger";

@injectable()
export class FirebaseAdmin {
    public auth: admin.auth.Auth;
    public firestore: admin.firestore.Firestore;

    constructor() {
        try {
            if (!admin.apps.length) {
                admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    }),
                });
                Logger.info("Firebase Admin SDK initialized.");
            } else {
                Logger.info("Firebase Admin SDK already initialized.");
            }

            this.auth = admin.auth();
            this.firestore = admin.firestore();

        } catch (error) {
            Logger.error("Failed to initialize Firebase Admin SDK.", error);
            throw new Error("Firebase initialization failed.");
        }
    };
}
