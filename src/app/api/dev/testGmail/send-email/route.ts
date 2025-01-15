import { sendGmail } from "@/lib/dev/gmail/sendGmail";
import { NextResponse } from "next/server";

/**
 * Gmail APIメール送信API
 * @param request - HTTPリクエスト
 * @returns HTTPレスポンス
 */
export async function POST(request: Request) {
    try {
        // リクエストボディを取得
        const { to, subject, body } = await request.json();

        // 必須フィールドの確認
        if (!to || !subject || !body) {
            return NextResponse.json(
                {
                    error: "必要なフィールド (to, subject, body) が不足しています。",
                },
                { status: 400 }
            );
        }

        // Gmail APIを使用してメールを送信
        await sendGmail(to, subject, body);

        // 成功レスポンスを返す
        return NextResponse.json(
            { message: "メール送信成功" },
            { status: 200 }
        );
    } catch (error) {
        console.error("APIエラー:", error);
        return NextResponse.json(
            { error: "メール送信に失敗しました。" },
            { status: 500 }
        );
    }
}
