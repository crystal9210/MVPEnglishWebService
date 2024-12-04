// src/lib/firebaseAuthCheck.ts

import { firestoreAdmin } from "../services/firebaseAdmin";

/**
 * ユーザーのロールを設定
 * @param userId ユーザーID
 * @param role ロール（例: "admin", "user"）
 */
export const setUserRole = async (userId: string, role: string) => {
    const userRef = firestoreAdmin.collection("users").doc(userId);
    await userRef.set({ role, permissions: ["read"] }, { merge: true });
};

/**
 * ユーザーの権限をチェック
 * @param userId ユーザーID
 * @param requiredRole 必要なロール
 */
export const checkPermissions = async (
    userId: string,
    requiredRole: string
) => {
    const userRef = firestoreAdmin.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        throw new Error("User not found");
    }

    const userData = userSnap.data();
    return userData?.role === requiredRole;
};
