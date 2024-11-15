import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

interface HandleSignUpArgs {
  email: string;
  name?: string;
  image?: string;
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface FirestoreUserData {
  email: string;
  name?: string;
  avatar?: string;
  verified: boolean;
  provider: string;
  permissions: string[];
  createdAt: string;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}


/**
 * 登録処理を管理
 */
export async function handleSignUp({
  email,
  name,
  image,
  idToken,
  accessToken,
  refreshToken,
  expiresAt,
}: HandleSignUpArgs): Promise<boolean | string> {
  try {
    console.log(`handleSignUp開始: ${email}`);
    console.log(`idToken: ${idToken}`);
    console.log(`accessToken: ${accessToken}`);
    console.log(`refreshToken: ${refreshToken}`);
    console.log(`expiresAt: ${expiresAt}`);

    // 型ガード
    if (!idToken || !accessToken || !refreshToken || !expiresAt) {
      console.error("トークン情報が不足しています:", {
        idToken,
        accessToken,
        refreshToken,
        expiresAt,
      });
      return false;
    }

    const userRef = firestoreAdmin.collection("users").doc(email);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      console.log(`既存ユーザー確認: ${JSON.stringify(userData)}`);
      if (userData?.verified) {
        console.log(`ユーザー ${email} は既に確認済み`);
        return true;
      }
    } else {
      console.log(`ユーザー ${email} は新規ユーザーです。登録を開始します。`);
    }

    const newUser = {
      email,
      name: name || "Unknown",
      avatar: image || "",
      verified: true,
      provider: "google",
      permissions: ["read"],
      createdAt: new Date().toISOString(),
      idToken,
      accessToken,
      refreshToken,
      expiresAt,
    };

    await userRef.set(newUser);
    console.log(`新規ユーザー ${email} を登録しました: ${JSON.stringify(newUser)}`);

    return true;
  } catch (error) {
    console.error("handleSignUp エラー:", error);
    return false;
  }
}


/**
 * ログイン処理を管理
 */
export async function handleSignIn(email: string): Promise<boolean | string> {
  try {
    console.log(`handleSignIn開始: ${email}`);

    // Firestore 参照
    const usersCollection = firestoreAdmin.collection("users");
    const userQuery = await usersCollection.where("email", "==", email).limit(1).get();

    if (userQuery.empty) {
      console.log(`Firestore: ユーザー ${email} が見つかりません。登録が必要です。`);
      return "/register"; // 未登録ユーザーの場合は登録ページへリダイレクト
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as FirestoreUserData | undefined;

    if (!userData) {
      console.error(`Firestore: データが無効です: ${email}`);
      return false;
    }

    console.log(`Firestore: ユーザーデータを取得しました: ${JSON.stringify(userData)}`);

    // 確認済みでない場合の処理
    if (!userData.verified) {
      console.warn(`Firestore: ユーザー ${email} は未確認です。確認メールを再送します。`);
      const verificationLink = await sendVerificationEmail(email);
      console.log(`確認メールを送信しました: ${verificationLink}`);
      return `/verify-email-sent?email=${email}`; // 確認メールページへリダイレクト
    }

    console.log(`ログイン成功: ユーザー ${email}`);
    return true; // ログイン成功
  } catch (error: any) {
    console.error("handleSignInエラー:", error.message);
    return false; // サインインを拒否
  }
}




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

