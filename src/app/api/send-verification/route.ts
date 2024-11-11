import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "メールアドレスが必要です。" }, { status: 400 });
  }

  try {
    const verificationLink = await sendVerificationEmail(email);
    return NextResponse.json({ message: "確認メールを送信しました。", link: verificationLink });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json({ error: "確認メールの送信に失敗しました。" }, { status: 500 });
  }
}
