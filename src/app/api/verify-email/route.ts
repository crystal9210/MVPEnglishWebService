// 確認メール送信エンドポイント
import { authAdmin } from "@/services/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
    const { email } = await req.json();

    if (!email) {
        return new Response("Email is required", { status: 400 });
    }

    try {
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm-email`,
            handleCodeInApp: true,
        };

        const verificationLink = await authAdmin.generateEmailVerificationLink(email, actionCodeSettings);
        await sendEmail(
            email,
            "メールアドレスの確認",
            `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p><a href="${verificationLink}">${verificationLink}</a>`
        );

        return new Response("Verification email sent", { status: 200 });
    } catch (error) {
        console.error("Error sending verification email:", error);
        return new Response("Failed to send verification email", { status: 500 });
    }
}
