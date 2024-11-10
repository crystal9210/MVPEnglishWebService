import { authAdmin } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    try {
        const { oobCode } = await request.json();

        if (!oobCode) {
            return new Response("確認コードが不足しています。", { status: 400 });
        }

        // Firebase Admin SDKにはverifyPasswordResetCodeはないので、oobCodeからメールアドレスを取得
        const email = await authAdmin.getUserByEmail(oobCode).then((user) => user.email);

        if (!email) {
            return new Response("無効な確認コードです。", { status: 400 });
        }

        // メールアドレスが確認済みでない場合は更新
        const user = await authAdmin.getUserByEmail(email);
        if (!user.emailVerified) {
            await authAdmin.updateUser(user.uid, { emailVerified: true });
        }

        return new Response("メールアドレスの確認に成功しました。", { status: 200 });
    } catch (error) {
        console.error("メール確認エラー:", error);
        return new Response("メールアドレスの確認に失敗しました。", { status: 500 });
    }
}
