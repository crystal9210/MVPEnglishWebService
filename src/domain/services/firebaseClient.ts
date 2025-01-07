// TODO セキュリティ的な脅威モデリングと適切にハンドリング・対策実装 >> この機能は使う予定が今のところないので(セキュリティ的な話で)実装調整は後で。一応後で形にはしたい...(?)
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp;
let firestore: Firestore;

if (!getApps().length) {
    firebaseApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    firestore = getFirestore(firebaseApp);
} else {
    firebaseApp = getApps()[0];
    firestore = getFirestore(firebaseApp);
}

export { firebaseApp, firestore };
