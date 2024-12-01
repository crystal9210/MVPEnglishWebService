import { authAdmin } from "./firebaseAdmin";
import { FirebaseError } from "firebase/app";

export async function getUserByEmail(email: string) {
    try {
        return await authAdmin.getUserByEmail(email);
    } catch (error) {
        if (error instanceof FirebaseError && error.code === "auth/user-not-found") {
            return undefined;
        }
        throw error;
    }
}

export async function createUser(email: string, name?: string, photoURL?: string) {
    return await authAdmin.createUser({
        email,
        displayName: name,
        photoURL,
        emailVerified: false,
    });
}
