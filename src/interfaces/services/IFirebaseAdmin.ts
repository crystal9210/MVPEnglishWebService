import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

export interface IFirebaseAdmin {
    getAuth(): Auth;
    getFirestore(): Firestore;
}
