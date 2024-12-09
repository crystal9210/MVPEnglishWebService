import * as admin from "firebase-admin";
import { injectable, inject } from "tsyringe";
import { LoggerService } from "@/domain/services/loggerService";
import { Firestore } from "firebase-admin/firestore";
import { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";

@injectable()
export class FirebaseAdmin implements IFirebaseAdmin {
    private authInstance: admin.auth.Auth;
    private firestoreInstance: Firestore;

    constructor(
        // eslint-disable-next-line no-unused-vars
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

            this.authInstance = admin.auth();
            this.firestoreInstance = admin.firestore();
        } catch (error) {
            this.logger.error("Failed to initialize Firebase Admin SDK.", { error });
            throw new Error("Firebase initialization failed.");
        }
    }

    // IFirebaseAdminインターフェースで要求されるメソッドを実装
    getAuth(): admin.auth.Auth {
        return this.authInstance;
    }

    getFirestore(): Firestore {
        return this.firestoreInstance;
    }
}
