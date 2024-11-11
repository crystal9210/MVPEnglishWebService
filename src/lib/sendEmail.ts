import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;
const REDIRECT_URI = "http://localhost:3000/api/auth/callback/google";

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER) {
  throw new Error("環境変数が不足しています。");
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * アクセストークンを取得し、必要に応じて再認証を行う
 */
const getAccessToken = async (): Promise<string> => {
  try {
    console.log("アクセストークンを取得中...");
    const { token } = await oAuth2Client.getAccessToken();
    if (!token) {
      throw new Error("アクセストークンが取得できませんでした。");
    }
    console.log("取得したアクセストークン:", token);
    return token;
  } catch (error: any) {
    console.error("アクセストークンの取得エラー:", error.message);

    if (error.message.includes("invalid_grant")) {
      console.warn("リフレッシュトークンが無効です。再認証を開始します...");
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "openid",
          "https://mail.google.com/",
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
        ],
        prompt: "consent",
      });
      console.log("再認証URL:", authUrl);

      throw new Error("リフレッシュトークンが無効です。再認証を行ってください。");
    }

    throw error;
  }
};

/**
 * メールを送信する
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  console.log("=== メール送信処理を開始 ===");
  console.log("送信対象:", { to, subject });

  try {
    const accessToken = await getAccessToken();

    console.log("Nodemailerトランスポートを初期化...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `Your App <${EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log("メールオプション:", mailOptions);

    console.log("メール送信中...");
    const result = await transporter.sendMail(mailOptions);
    console.log("メール送信成功:", result);

    console.log("=== メール送信処理が完了しました ===");
    return result;
  } catch (error: any) {
    console.error("メール送信エラー:", error.message);

    if (error.message.includes("invalid_grant")) {
      console.error("リフレッシュトークンが無効である可能性があります。");
    }

    throw error;
  }
};

/**
 * 再認証後のトークンを保存する関数 (トークンを更新して環境変数に保存する例)
 */
export const saveNewRefreshToken = async (code: string) => {
  try {
    console.log("新しいトークンを取得中...");
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("新しいトークン取得成功:", tokens);

    // 保存処理を追加 (例: ファイルやデータベースに保存)
    // fs.writeFileSync(".env", `REFRESH_TOKEN=${tokens.refresh_token}`);

    return tokens.refresh_token;
  } catch (error) {
    console.error("新しいトークンの取得エラー:", error);
    throw error;
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
