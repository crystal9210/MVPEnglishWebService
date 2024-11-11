import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";

/**
 * Firestore にユーザーを保存し、確認メールを送信
 * @param email - ユーザーのメールアドレス
 * @param actionCodeSettings - メール確認リンク設定
 */
export async function sendVerificationEmail(
  email: string,
  actionCodeSettings: { url: string; handleCodeInApp: boolean }
): Promise<string> {
  try {
    console.log("=== メールアドレス確認処理を開始 ===");
    console.log("送信対象メールアドレス:", email);

    const userDocRef = firestoreAdmin.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      console.log("既存のユーザーを確認しました:", userDoc.data());
    } else {
      console.log("新規ユーザーとして登録します。");

      // 新規ユーザーの登録
      const newUserData = {
        email,
        verified: false,
        createdAt: new Date(),
      };

      await userDocRef.set(newUserData, { merge: true });
      console.log("Firestore に新規ユーザーを保存しました:", newUserData);
    }

    // 確認メールリンクを生成
    const verificationLink = `${actionCodeSettings.url}?email=${encodeURIComponent(email)}`;

    console.log("生成した確認リンク:", verificationLink);

    // 確認メールを送信
    await sendEmail(
      email,
      "メールアドレスの確認",
      `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${verificationLink}">${verificationLink}</a>`
    );

    console.log("確認メール送信完了");
    console.log("=== メールアドレス確認処理が完了しました ===");
    return verificationLink;
  } catch (error) {
    console.error("確認メール送信エラー:", error);
    throw new Error("確認メールの送信に失敗しました");
  }
}
