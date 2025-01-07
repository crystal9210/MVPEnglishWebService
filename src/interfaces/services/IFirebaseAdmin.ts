import type { Auth } from "firebase-admin/auth";
import type { Firestore, FieldValue } from "firebase-admin/firestore";

export interface IFirebaseAdmin {
    /**
     * Retrieves the Firebase Authentication instance.
     * @returns The Firebase Authentication instance.
     */
    getAuth(): Auth;

    /**
     * Retrieves the Firestore database instance.
     * @returns The Firestore database instance.
     */
    getFirestore(): Firestore;

    /**
     * Retrieves Firestore FieldValue for serverTimestamp.
     * @returns The Firestore FieldValue.
     */
    getFieldValue(): typeof FieldValue;
}
