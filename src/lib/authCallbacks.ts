import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

/**
 * サインイン時の処理を管理
 */
export async function handleSignIn(user: any): Promise<boolean | string> {
  try {
    const existingUser = await firestoreAdmin.collection("users").doc(user.email).get();

    if (existingUser.exists && existingUser.data()?.emailVerified) {
      // メール確認済みユーザーの場合はそのまま進む
      return true;
    }

    // 仮登録状態でFirestoreに保存
    const tempUser = {
      email: user.email,
      name: user.name || "Unknown",
      image: user.image || "",
      createdAt: new Date(), // 仮登録時のタイムスタンプを保持
    };
    await firestoreAdmin.collection("temporaryUsers").doc(user.email).set(tempUser);
    console.log(`メールアドレス確認 user.email: ${user.email}`);

    // 確認メールリンクを生成して送信
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm-email`, // リダイレクト先URL
      handleCodeInApp: true, // アプリ内で確認
    };
    const verificationLink = await sendVerificationEmail(user.email, actionCodeSettings);

    console.log(`確認メールを送信しました: ${verificationLink}`);
    return "/verify-email-sent"; // メール送信完了ページにリダイレクト
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
    // ユーザーが存在しない場合、新規作成
    await userRef.set(
      {
        email: token.email,
        name: token.name,
        avatar: token.picture,
        role: "user",
        emailVerified: false,
        permissions: ["read"],
        createdAt: new Date(), // 作成時のタイムスタンプを保持
      },
      { merge: true } // 既存データを保持
    );

    // 初回登録時に確認メールを送信
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm-email`, // リダイレクト先URL
      handleCodeInApp: true, // アプリ内で確認
    };
    await sendVerificationEmail(token.email, actionCodeSettings);
  }

  return token;
}
