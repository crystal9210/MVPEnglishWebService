import { authAdmin } from "./firebaseAdmin";
import { sendEmail } from "./sendEmail";

/**
 * 確認メール送信関数
 * @param email ユーザーのメールアドレス
 */
export async function sendVerificationEmail(email: string) {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email`, // 確認ページのURL
    handleCodeInApp: true,
  };

  try {
    // Firebase Admin SDKで確認メールリンクを生成
    const link = await authAdmin.generateEmailVerificationLink(email, actionCodeSettings);

    // メール送信
    await sendEmail(
      email,
      "メールアドレスの確認",
      `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${link}">${link}</a>`
    );

    return link;
  } catch (error) {
    console.error("確認メール送信エラー:", error);
    throw new Error("確認メールの送信に失敗しました。");
  }
}
