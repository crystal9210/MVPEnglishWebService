import { sendEmail } from "@/lib/sendEmail";
import { sign } from "jsonwebtoken";
import { privateKey } from "@/utils/keys";

// export const runtime = "nodejs";

export async function sendVerificationEmail(email: string): Promise<string> {
    try {
        const registrationToken = sign({ email }, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
        });
        console.log("生成されたトークン:", registrationToken);
        console.log(`privateKey: ${privateKey}`);

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
        if (error instanceof Error) {
            console.error("確認メール送信エラー:", error.message);
        } else {
            console.error("確認メール送信中に予期しないエラーが発生しました");
        }
        throw new Error("確認メール送信に失敗しました。");
    }
}
