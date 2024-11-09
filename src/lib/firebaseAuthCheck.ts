import { firestore } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const setUserRole = async (userId: string, role: string) => {
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, { role, permissions: ["read"] }, { merge: true });
};

export const checkPermissions = async (userId: string, requiredRole: string) => {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("User not found");
    }

    const userData = userSnap.data();
    return userData?.role === requiredRole;
};
