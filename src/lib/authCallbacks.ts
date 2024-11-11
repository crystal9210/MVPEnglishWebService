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
    const userRef = firestoreAdmin.collection("users").doc(email);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.log(`ユーザー ${email} が見つかりません。登録が必要です。`);
      return "/register"; // 未登録ユーザーの場合は登録ページへリダイレクト
    }

    // ユーザーデータ取得と型チェック
    const userData = userSnap.data() as FirestoreUserData;

    if (!userData) {
      console.error(`Firestoreから取得したデータが無効です: ${email}`);
      return false;
    }

    // 確認済みでない場合の処理
    if (!userData.verified) {
      console.log(`ユーザー ${email} は未確認です。確認メールを再送します。`);
      const verificationLink = await sendVerificationEmail(email);
      console.log(`確認メールを送信しました: ${verificationLink}`);
      return `/verify-email-sent?email=${email}`; // 確認メールページへリダイレクト
    }

    // プロバイダの一致を確認
    if (userData.provider !== "google") {
      console.error(`ユーザー ${email} はGoogle認証以外のプロバイダで登録されています。`);
      return "/error"; // プロバイダが一致しない場合はエラー
    }

    console.log(`ユーザー ${email} のログインが成功しました。`);
    return true; // ログイン成功
  } catch (error) {
    console.error("handleSignInエラー:", error);
    return false; // サインインを拒否
  }
}


/**
 * JWT生成時の処理を管理
 */
export async function initializeUserData(token: any, account: any): Promise<any> {
  if (!account) return token;

  const userRef = firestoreAdmin.collection("users").doc(token.email);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    // 新規ユーザーを登録
    console.log(`初回ログイン: ユーザー ${token.email} を登録します。`);
    const newUser = {
      email: token.email,
      name: token.name || "Unknown",
      avatar: token.picture || "", // 'avatar'として保存
      verified: false, // 初期状態は未確認
      provider: account.provider, // 認証プロバイダ（Googleなど）
      permissions: ["read"], // 初期権限
      createdAt: new Date().toISOString(), // ISO形式で登録
    };
    await userRef.set(newUser);

    // 確認メールを送信
    const verificationLink = await sendVerificationEmail(token.email);
    console.log(`確認メールを送信しました: ${verificationLink}`);
  }

  return token;
}
