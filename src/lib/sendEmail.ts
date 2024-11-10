import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_FROM = process.env.EMAIL_FROM || `"No Reply" <${EMAIL_USER}>`;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, "http://localhost:3000/api/auth/callback/google");
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Nodemailerを使用してメールを送信
 * @param to 送信先
 * @param subject メールの件名
 * @param html メール本文（HTML形式）
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      console.log("=== メール送信設定の確認開始 ===");
      console.log(`EMAIL_USER: ${EMAIL_USER}`);
      console.log(`CLIENT_ID: ${CLIENT_ID}`);
      console.log(`CLIENT_SECRET: ${CLIENT_SECRET}`);
      console.log(`REFRESH_TOKEN: ${REFRESH_TOKEN}`);
      console.log(`EMAIL_FROM: ${EMAIL_FROM}`);
      console.log(`送信先 (to): ${to}`);
      console.log(`件名 (subject): ${subject}`);
      console.log("=== メール送信設定の確認終了 ===");
  
      const accessToken = await oAuth2Client.getAccessToken();
  
      console.log("アクセストークン取得結果:");
      console.log(`AccessToken: ${accessToken?.token}`);
      console.log(`Token Expiry Date: ${accessToken?.res?.data?.expiry_date}`);
  
      if (!accessToken.token) {
        throw new Error("アクセストークンの取得に失敗しました。");
      }
  
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
  
      const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject,
        html,
      };
  
      console.log("メール送信オプション:");
      console.log(mailOptions);
  
      const result = await transporter.sendMail(mailOptions);
      console.log("メール送信成功:", result);
  
      return result;
    } catch (error) {
      console.error("メール送信エラー詳細:", error);
      console.error(`エラー発生箇所のスタックトレース: ${error}`);
      throw new Error("メール送信に失敗しました。");
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
