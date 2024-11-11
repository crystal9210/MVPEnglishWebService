import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";

export async function sendVerificationEmail(email: string): Promise<string> {
  try {
    console.log("=== 確認メール送信処理開始 ===");

    const userDocRef = firestoreAdmin.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.log("Firestore に新規ユーザーを保存します。");

      // 新規ユーザーを仮登録
      const newUserData = {
        email,
        verified: false,
        createdAt: new Date(),
      };

      await userDocRef.set(newUserData, { merge: true });
      console.log("新規ユーザーを保存しました:", newUserData);
    }

    // 確認リンクを生成
    const verificationLink = `http://localhost:3000/api/confirm-registration?email=${encodeURIComponent(email)}`;
    console.log("確認リンク:", verificationLink);

    // メールを送信
    await sendEmail(
      email,
      "メールアドレスの確認",
      `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${verificationLink}">${verificationLink}</a>`
    );

    console.log("=== 確認メール送信完了 ===");
    return verificationLink;
  } catch (error) {
    console.error("確認メール送信エラー:", error);
    throw new Error("確認メール送信に失敗しました。");
  }
}

