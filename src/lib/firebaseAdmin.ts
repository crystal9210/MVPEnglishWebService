import * as admin from "firebase-admin"; // TODO * as がない場合と何が違う？

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth(); // initialization of firebase authentication
