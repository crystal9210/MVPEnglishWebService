// TODO セキュリティ的にどうか検証
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp;
let firestore: Firestore;

if (!getApps().length) {
    firebaseApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        // 他の設定
    });
    firestore = getFirestore(firebaseApp);
} else {
    firebaseApp = getApps()[0];
    firestore = getFirestore(firebaseApp);
}

export { firebaseApp, firestore };
