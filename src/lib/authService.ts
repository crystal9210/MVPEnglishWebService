// import { authAdmin, firestoreAdmin } from "../services/firebaseAdmin";
// import { FirebaseError } from "firebase/app";
// import { Adapter, AdapterAccount } from "next-auth/adapters";

// export async function createAccountEntry(uid: string, accountData: AdapterAccount) {
//     try {
//         // 必須フィールドの定義
//         const requiredFields: (keyof AdapterAccount)[] = [
//             "provider",
//             "providerAccountId",
//             "access_token",
//             "refresh_token",
//             "id_token",
//             "token_type",
//             "scope",
//             "expires_at",
//             "type",
//         ];

//         // 必須フィールドの検証
//         const missingFields = requiredFields.filter((field) => !(field in accountData));
//         if (missingFields.length > 0) {
//             throw new Error(`Missing required account data fields: ${missingFields.join(", ")}`);
//         }

//         const accountsCollection = firestoreAdmin.collection("accounts");
//         const accountDocRef = accountsCollection.doc(uid); // Firebase Authenticationがuidを一意に管理しているためdocIdに使うと検索コストを踏まえても最善と判断

//         await accountDocRef.set({
//             userId: uid,
//             provider: accountData.provider,
//             providerAccountId: accountData.providerAccountId,
//             access_token: accountData.access_token,
//             refresh_token: accountData.refresh_token,
//             id_token: accountData.id_token,
//             token_type: accountData.token_type,
//             scope: accountData.scope,
//             expires_at: accountData.expires_at,
//             type: accountData.type,
//         });

//         console.log(`Account entry created/updated in Firestore for userId: ${uid}`);
//     } catch (error) {
//         console.error(`Failed to create account entry for userId: ${uid}`, error);
//         throw error;
//     }
// }

// export async function getUserByEmail(email: string) {
//     try {
//         console.log(`Fetching user for email: ${email}`);
//         const userRecord = await authAdmin.getUserByEmail(email);
//         console.log(`User record found: ${JSON.stringify(userRecord, null, 2)}`);
//         return userRecord;
//     } catch (error) {
//         const errorCode = (error as FirebaseError).code;
//         console.error(`Error code: ${errorCode}, Error message: ${(error as FirebaseError).message}`);

//         if (errorCode === "auth/user-not-found") {
//             console.warn(`User not found for email: ${email}`);
//             return undefined;
//         }

//         throw error; // それ以外のエラーは再スロー
//     }
// }

// // uidの生成はFirebase Authenticationが管理
// export async function createUser(email: string, name?: string, photoURL?: string) {
//     return await authAdmin.createUser({
//         email,
//         displayName: name,
//         photoURL,
//         emailVerified: false,
//     });
// }

// export async function deleteUserFromAuth(uid: string): Promise<void> {
//     try {
//         await authAdmin.deleteUser(uid);
//         console.log(`Firebase Authentication ユーザ削除完了: ${uid}`);
//     } catch (error) {
//         console.error(`FIrebase Authentication ユーザ削除失敗: ${uid}`, error);
//         throw error;
//     }
// }
