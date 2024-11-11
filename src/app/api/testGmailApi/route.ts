import { NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 環境変数の読み込み
const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;

// OAuth2 クライアントの設定
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "http://localhost:3000/api/auth/callback/google" // リダイレクトURI
);

// リフレッシュトークンを設定
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Gmail ラベル用の型
type GmailLabel = {
  id: string;
  name?: string;
  type?: string;
};

// GETリクエスト: Gmailラベル一覧の取得
export async function GET() {
  console.log("=== GET: Gmailラベル一覧の取得処理を開始 ===");
  try {
    console.log("アクセストークン取得を試行中...");
    const accessToken = await oAuth2Client.getAccessToken();
    console.log("アクセストークン取得結果:", accessToken);

    if (!accessToken || !accessToken.token) {
      throw new Error("アクセストークンの取得に失敗しました。");
    }

    console.log("Gmail APIクライアントを初期化...");
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    console.log("Gmailラベル一覧を取得中...");
    const response = await gmail.users.labels.list({
      userId: "me",
    });

    console.log("Gmailラベル一覧取得成功:", response.data.labels);

    // Schema$Label[] を GmailLabel[] に変換
    console.log("ラベルデータを整形...");
    const labels: GmailLabel[] = (response.data.labels || [])
      .filter((label): any => label.id !== null && label.id !== undefined)
      .map((label) => ({
        id: label.id as string,
        name: label.name || "Unnamed Label",
        type: label.type || "unknown",
      }));

    console.log("整形されたラベルデータ:", labels);

    console.log("=== GET: Gmailラベル一覧の取得処理を完了 ===");
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

// POSTリクエスト: Nodemailerを使用してメール送信
export async function POST(request: Request) {
  console.log("=== POST: メール送信処理を開始 ===");
  try {
    console.log("リクエストデータを解析中...");
    const { to, subject, html } = await request.json();

    console.log("リクエストデータ:", { to, subject, html });

    if (!to || !subject || !html) {
      console.error("メールの送信先、件名、本文が不足しています。");
      return NextResponse.json(
        { error: "メールの送信先、件名、本文が必要です。" },
        { status: 400 }
      );
    }

    console.log("アクセストークン取得を試行中...");
    const accessToken = await oAuth2Client.getAccessToken();
    console.log("アクセストークン取得結果:", accessToken);

    if (!accessToken || !accessToken.token) {
      throw new Error("アクセストークンの取得に失敗しました。");
    }

    console.log("Nodemailerトランスポートを初期化...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    console.log("メール送信設定を構築...");
    const mailOptions = {
      from: `Your App <${EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log("メール送信オプション:", mailOptions);

    console.log("メール送信を試行中...");
    const result = await transporter.sendMail(mailOptions);
    console.log("メール送信成功:", result);

    console.log("=== POST: メール送信処理を完了 ===");
    return NextResponse.json({ message: "メール送信成功", result });
  } catch (error: any) {
    console.error("メール送信エラー:", error.message);
    console.error("詳細エラー内容:", error);
    return NextResponse.json(
      { error: "メール送信に失敗しました。" },
      { status: 500 }
    );
  }
}
