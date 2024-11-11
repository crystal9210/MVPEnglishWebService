import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;

if (!ACCESS_TOKEN || !EMAIL_USER) {
  throw new Error("環境変数が不足しています: ACCESS_TOKEN または EMAIL_USER が設定されていません。");
}

// Gmail API クライアントを作成
export const createGmailClient = () => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: ACCESS_TOKEN });

  return google.gmail({ version: "v1", auth: oAuth2Client });
};
