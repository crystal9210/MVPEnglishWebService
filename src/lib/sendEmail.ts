import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.AUTH_GOOGLE_ID;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_FROM = process.env.EMAIL_FROM || `"No Reply" <${EMAIL_USER}>`;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER) {
  throw new Error("メール送信に必要な環境変数が不足しています");
}

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "http://localhost:3000/api/auth/callback/google" // リダイレクトURI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken.token) {
      throw new Error("アクセストークンの取得に失敗しました");
    }

    const transporter = nodemailer.createTransport({
      pool: true, // 接続プールを有効化
      rateDelta: 1000, // 1秒間の測定期間
      rateLimit: 1, // 1秒間に最大5通
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

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("メール送信成功:", result);
    return result;
  } catch (error: any) {
    console.error("メール送信エラー:", error.message);

    // リフレッシュトークンの無効エラーをチェック
    if (error.message.includes("invalid_grant")) {
      console.warn("リフレッシュトークンが無効です。再認証が必要です。");

      // 再認証用のURLを生成
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: "openid https://mail.google.com/ https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        prompt: "consent", // ユーザーに再認証を促す
      });

      console.log("再認証を行ってください:", authUrl);

      throw new Error("リフレッシュトークンが無効です。再認証を行ってください。");
    }

    throw new Error("メール送信に失敗しました");
  }
};





// SendGridを利用する場合の実装

// export const sendEmail = async (to: string, subject: string, html: string) => {
//     const transporter = nodemailer.createTransport({
//         host: "smtp.sendgrid.net",
//         port: 587,
//         auth: {
//             user: "apikey", // 固定値
//             pass: process.env.EMAIL_API_KEY,
//         },
//     });

//     await transporter.sendMail({
//         from: process.env.EMAIL_FROM,
//         to,
//         subject,
//         html,
//     });
// };
