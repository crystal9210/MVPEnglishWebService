// 確認メール送信
import { authAdmin } from "@/lib/firebaseAdmin";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request: Request) {
    const { email } = await request.json();

    if (!email) {
        return new Response("Email is required", { status: 400 });
    }

    try {
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email`, // 確認用リンク
            handleCodeInApp: true,
        };

        // 確認リンクの生成
        const link = await authAdmin.generateEmailVerificationLink(email, actionCodeSettings);

        // メール送信
        await sendEmail(
            email,
            "メールアドレスの確認",
            `<p>以下のリンクをクリックしてメールアドレスを確認してください。</p>
            <a href="${link}">${link}</a>`
        );

        console.log("Verification email sent to:", email);
        return new Response("Verification email sent", { status: 200 });
    } catch (error) {
        console.error("Error sending verification email:", error);
        return new Response("Failed to send verification email", { status: 500 });
    }
}
