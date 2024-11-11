import nodemailer from "nodemailer";

const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN!; // 新たに追加

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER || !ACCESS_TOKEN) {
  console.error("環境変数が不足しています:");
  console.error({
    CLIENT_ID: CLIENT_ID ? "設定済み" : "未設定",
    CLIENT_SECRET: CLIENT_SECRET ? "設定済み" : "未設定",
    REFRESH_TOKEN: REFRESH_TOKEN ? "設定済み" : "未設定",
    EMAIL_USER: EMAIL_USER ? "設定済み" : "未設定",
    ACCESS_TOKEN: ACCESS_TOKEN ? "設定済み" : "未設定",
  });
  throw new Error("メール送信に必要な環境変数が不足しています");
}

/**
 * メールを送信する
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  console.log("=== メール送信処理を開始 ===");
  console.log("送信対象:", { to, subject });

  try {
    console.log("Nodemailerトランスポートを初期化...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN, // 環境変数から直接設定
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
      console.error("アクセストークンが無効である可能性があります。");
    }

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
