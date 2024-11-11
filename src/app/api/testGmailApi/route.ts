import { NextRequest, NextResponse } from "next/server";
import { createGmailClient } from "@/utils/auth";

// GETメソッドでGmail APIを呼び出してスレッド一覧を取得
export async function GET(req: NextRequest) {
  try {
    console.log("=== Gmail API テスト開始 ===");

    const gmail = createGmailClient();

    console.log("Gmailスレッド一覧を取得中...");
    const response = await gmail.users.threads.list({
      userId: "me",
      maxResults: 5,
    });

    console.log("スレッド一覧取得成功:", response.data.threads);

    return NextResponse.json({
      message: "Gmail API テスト成功",
      threads: response.data.threads || [],
    });
  } catch (error: any) {
    console.error("Gmail API 呼び出しエラー:", error.message);
    return NextResponse.json(
      { error: "Gmail API 呼び出しに失敗しました。" },
      { status: 500 }
    );
  }
}
