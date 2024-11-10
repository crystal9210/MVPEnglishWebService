import { authAdmin } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";

/**
 * Firebase Authentication にユーザーを登録し、確認メールリンクを送信
 * @param email - ユーザーのメールアドレス
 * @param actionCodeSettings - Firebase 認証リンクの設定
 */
export async function sendVerificationEmail(
  email: string,
  actionCodeSettings: { url: string; handleCodeInApp: boolean }
): Promise<string> {
  try {
    // Firebase Authentication にユーザーを仮登録
    try {
      await authAdmin.getUserByEmail(email); // 既存ユーザー確認
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        await authAdmin.createUser({ email, emailVerified: false }); // 仮登録
      } else {
        throw error; // 他のエラーは再スロー
      }
    }

    // 確認メールリンクを生成
    const verificationLink = await authAdmin.generateEmailVerificationLink(email, actionCodeSettings);

    // 確認メールを送信
    await sendEmail(
      email,
      "メールアドレスの確認",
      `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${verificationLink}">${verificationLink}</a>`
    );

    return verificationLink;
  } catch (error) {
    console.error("確認メール送信エラー:", error);
    throw new Error("確認メールの送信に失敗しました。");
  }
}
