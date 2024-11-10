import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground");
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Nodemailerを使用してメールを送信
 * @param to 送信先
 * @param subject メールの件名
 * @param html メール本文（HTML形式）
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLSを使用
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
      from: process.env.EMAIL_FROM || `"No Reply" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("メール送信エラー:", error);
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
