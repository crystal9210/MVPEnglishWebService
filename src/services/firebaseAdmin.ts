import * as admin from "firebase-admin"; // admin名前空間で全メンバーインポート
import { injectable, inject } from "tsyringe";
import { LoggerService } from "@/services/loggerService";
import { Firestore } from "firebase-admin/firestore";

@injectable()
export class FirebaseAdmin {
    public auth: admin.auth.Auth;
    public firestore: Firestore;

    constructor(
        @inject(LoggerService) private logger: LoggerService
    ) {
        try {
            if (!admin.apps.length) {
                const projectId = process.env.FIREBASE_PROJECT_ID;
                const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
                let privateKey = process.env.FIREBASE_PRIVATE_KEY;

                if (!projectId || !clientEmail || !privateKey) {
                    this.logger.error("Firebase environment variables are not set properly.");
                    throw new Error("Firebase environment variables are missing.");
                }

                privateKey = privateKey.replace(/\\n/g, "\n");

                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
                this.logger.info("Firebase Admin SDK initialized.");
            } else {
                this.logger.info("Firebase Admin SDK already initialized.");
            }

            this.auth = admin.auth();
            this.firestore = admin.firestore();
        } catch (error) {
            this.logger.error("Failed to initialize Firebase Admin SDK.", { error });
            throw new Error("Firebase initialization failed.");
        }
    }
}
