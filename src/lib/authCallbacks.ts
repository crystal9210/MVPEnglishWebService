import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

/**
 * 登録処理を管理
 */
export async function handleSignUp(user: { email: string; name?: string; image?: string }): Promise<boolean | string> {
  try {
    const userRef = firestoreAdmin.collection("users").doc(user.email);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      // ユーザーが既に確認済みの場合は何もしない
      if (userData?.verified) {
        console.log(`ユーザー ${user.email} は既に確認済み`);
        return true;
      }

      // 未確認の場合、確認メールを再送
      console.log(`ユーザー ${user.email} は未確認。確認メールを送信します。`);
      const verificationLink = await sendVerificationEmail(user.email);
      console.log(`確認メールを送信しました: ${verificationLink}`);
      return `/verify-email-sent?email=${user.email}`;
    }

    // 新規ユーザーの仮登録
    console.log(`新規ユーザー ${user.email} を仮登録します。`);
    const tempUser = {
      email: user.email,
      name: user.name || "Unknown",
      image: user.image || "",
      verified: false,
      createdAt: new Date(),
    };
    await userRef.set(tempUser);

    // 確認メールを送信
    const verificationLink = await sendVerificationEmail(user.email);
    console.log(`確認メールを送信しました: ${verificationLink}`);

    return "/verify-email-sent";
  } catch (error) {
    console.error("handleSignUpエラー:", error);
    return false;
  }
}

/**
 * ログイン処理を管理
 */
export async function handleSignIn(email: string): Promise<boolean | string> {
  try {
    const userRef = firestoreAdmin.collection("users").doc(email);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      if (userData?.verified) {
        console.log(`ユーザー ${email} は確認済み。ログイン許可。`);
        return true; // ログイン成功
      }

      console.log(`ユーザー ${email} は未確認。`);
      return `/verify-email-sent?email=${email}`; // 未確認の場合、確認ページにリダイレクト
    }

    console.log(`ユーザー ${email} は未登録。`);
    return "/register"; // 未登録の場合、登録ページにリダイレクト
  } catch (error) {
    console.error("handleLoginエラー:", error);
    return false;
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
      avatar: token.picture || "",
      verified: false,
      permissions: ["read"],
      createdAt: new Date(),
    };
    await userRef.set(newUser);

    // 確認メールを送信
    const verificationLink = await sendVerificationEmail(token.email);
    console.log(`確認メールを送信しました: ${verificationLink}`);
  }

  return token;
}
