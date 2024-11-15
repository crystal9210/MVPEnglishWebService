import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";
import { sign } from "jsonwebtoken";

export async function sendVerificationEmail(email: string): Promise<string> {
  try {
    const userDocRef = firestoreAdmin.collection("users").doc(email);

    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      await userDocRef.set(
        {
          email,
          verified: false,
          createdAt: new Date(),
        },
        { merge: true }
      );
    }

    const secret = process.env.JWT_SECRET!;
    const registrationToken = sign({ email }, secret, { expiresIn: "1h", algorithm: "HS256" });
    console.log("生成されたトークン:", registrationToken);

    const verificationLink = `http://localhost:3000/api/confirm-registration?registrationToken=${registrationToken}`;
    console.log("生成されたリンク:", verificationLink.toString());
    const html = `
      <p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${verificationLink.toString()}">${verificationLink.toString()}</a>
    `;
    console.log("送信するメールのHTML:", html);

    await sendEmail(
      email,
      "メールアドレスの確認",
      `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
      <a href="${verificationLink}">${verificationLink}</a>`
    );

    return verificationLink;
  } catch (error) {
    console.error("確認メール送信エラー:", error.message);
    throw new Error("確認メール送信に失敗しました。");
  }
}
