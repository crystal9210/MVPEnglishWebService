import { firestoreAdmin } from "@/lib/firebaseAdmin";

/**
 * JWT生成時の処理を管理
 */
export async function initializeUserData(token: any, account: any): Promise<any> {
  try {
    console.log("initializeUserData開始:", { token, account });

    if (!account) {
      console.warn("アカウント情報が存在しません。トークンのみを返します。");
      return token;
    }

    const email = token.email;
    if (!email) {
      console.error("トークンにメールアドレスが含まれていません。");
      throw new Error("無効なトークンです");
    }

    // Firestoreからユーザーをクエリ
    const usersCollection = firestoreAdmin.collection("users");
    const userQuery = await usersCollection.where("email", "==", email).limit(1).get();

    if (userQuery.empty) {
      console.warn(`Firestoreにユーザー ${email} が存在しません。`);
      throw new Error("ユーザーが存在しません");
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    console.log(`Firestore: ユーザーデータを取得しました: ${JSON.stringify(userData)}`);

    if (!userData?.emailVerified) {
      console.warn(`ユーザー ${email} は未確認です。`);
      throw new Error("ユーザーが未確認です");
    }

    console.log(`トークン生成完了: ユーザー ${email}`);
    return token; // 必要に応じてトークンに追加情報を設定可能
  } catch (error: any) {
    console.error("initializeUserDataエラー:", error.message);
    throw error; // 呼び出し元でエラー処理
  }
}

