// sendVerificationEmail.ts
import { authAdmin, firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";

/**
 * Firebase Authentication にユーザーを登録し、Firestore に保存、確認メールを送信
 * @param email - ユーザーのメールアドレス
 * @param actionCodeSettings - メール確認リンク設定
 */
export async function sendVerificationEmail(
  email: string,
  actionCodeSettings: { url: string; handleCodeInApp: boolean }
): Promise<string> {
  try {
    let uid: string;

    // Firebase Authentication に仮登録または UID 取得
    try {
      const user = await authAdmin.getUserByEmail(email);
      uid = user.uid;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        const newUser = await authAdmin.createUser({
          email,
          emailVerified: false,
        });
        uid = newUser.uid;
      } else {
        throw error;
      }
    }

    // Firestore にユーザー情報を保存
    const userDocRef = firestoreAdmin.collection("users").doc(uid);
    await userDocRef.set(
      {
        email,
        verified: false,
        createdAt: new Date(),
      },
      { merge: true }
    );

    // 確認メールリンクを生成
    const verificationLink = await authAdmin.generateEmailVerificationLink(
      email,
      actionCodeSettings
    );

    // 確認メールを送信
    await sendEmail(
      email,
      "メールアドレスの確認",
      `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${verificationLink}">${verificationLink}</a>`
    );

    console.log("確認メール送信完了");
    return verificationLink;
  } catch (error) {
    console.error("確認メール送信エラー:", error);
    throw new Error("確認メールの送信に失敗しました");
  }
}
