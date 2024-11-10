import { NextResponse } from "next/server";
import { google } from "googleapis";

// 環境変数の読み込み
const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;

// OAuth2 クライアントの設定
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "http://localhost:3000"
);

// リフレッシュトークンを設定
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// GETリクエストの処理
type GmailLabel = {
    id: string;
    name: string;
    type: string;
  };
  
  export async function GET() {
    try {
      const accessToken = await oAuth2Client.getAccessToken();
      console.log("アクセストークン取得結果:", accessToken);
  
      if (!accessToken || !accessToken.token) {
        throw new Error("アクセストークンの取得に失敗しました。");
      }
  
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      const response = await gmail.users.labels.list({
        userId: "me",
      });
  
      const labels: GmailLabel[] = response.data.labels || [];
      console.log("ラベル一覧取得成功:", labels);
  
      return NextResponse.json({ labels });
    } catch (error: any) {
      console.error("Gmail API エラー詳細:", error.message);
      console.error("Gmail API エラー内容:", error);
      return NextResponse.json(
        { error: "Gmail API 呼び出しに失敗しました。" },
        { status: 500 }
      );
    }
  }
  