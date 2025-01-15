import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

// Edge Runtimeでのメモリ格納用のオブジェクト
let tokensInMemory: any = null;

// 必須の環境変数
const GMAIL_CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const GMAIL_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_FROM = process.env.EMAIL_FROM!;

if (
    !GMAIL_CLIENT_ID ||
    !GMAIL_CLIENT_SECRET ||
    !REFRESH_TOKEN ||
    !EMAIL_USER ||
    !EMAIL_FROM
) {
    console.error("不足している環境変数:", {
        GMAIL_CLIENT_ID: !!GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET: !!GMAIL_CLIENT_SECRET,
        REFRESH_TOKEN: !!REFRESH_TOKEN,
        EMAIL_USER: !!EMAIL_USER,
        EMAIL_FROM: !!EMAIL_FROM,
    });
    throw new Error("Gmail APIの設定に必要な環境変数が不足しています。");
}

console.log("環境変数:", {
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    REFRESH_TOKEN,
    EMAIL_USER,
    EMAIL_FROM,
});

const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    "http://localhost:3000/api/auth/callback/google"
);

// トークンの取得とリフレッシュ
async function getOrCreateTokens() {
    console.log("getOrCreateTokensを呼び出し");
    if (tokensInMemory) {
        console.log("メモリからトークンを取得:", tokensInMemory);
        return tokensInMemory;
    }

    try {
        console.log("トークンリフレッシュを実行中...");
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log("リフレッシュされたクレデンシャル:", credentials);

        const tokens = credentials.refresh_token;
        tokensInMemory = tokens;
        oauth2Client.setCredentials(credentials);
        console.log("トークンリフレッシュ成功:", tokens);
        return tokens;
    } catch (error) {
        console.error("トークンをリフレッシュできませんでした:", error);
        throw error;
    }
}

const gmail = google.gmail({ version: "v1" });

export async function sendGmail(to: string, subject: string, body: string) {
    console.log("メール送信を開始:", { to, subject, body });

    try {
        // const tokens = await getOrCreateTokens();
        oauth2Client.setCredentials({
            access_token:
                "ya29.a0ARW5m75RX_NevBHQ2bGzQcP5LwZ12TdcOQzGJhppt1EjE5c5NoGarNQWg0yTKJm9yIP8Qg-PJLV7h-geWrP0pImNwPkZVSo-GNDKcDynqkAA6dC18KjEFNMpXZb5GUqcwWAn4JgExmcanenCuQG-C7OiXfl4CaoAWgBRIywfaCgYKAZcSARMSFQHGX2MilIGcm57x-nWFiispUA8SVg0175",
            id_token:
                "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg5Y2UzNTk4YzQ3M2FmMWJkYTRiZmY5NWU2Yzg3MzY0NTAyMDZmYmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDY0OTAyNzY0NjM3MDA5MTY2NjYiLCJlbWFpbCI6Imd1YW55b25neGlhbmc0OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InpNZHVQckZxU3Q5TDhmM28tMC1SZnciLCJuYW1lIjoieSBzIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0toVHd2a1ctVUhyYnRnYnBmWU5zNjFOcFplVnRsdThZN2JwTGpXb0NUMmdoTjR0aGM9czk2LWMiLCJnaXZlbl9uYW1lIjoieSIsImZhbWlseV9uYW1lIjoicyIsImlhdCI6MTczNjgyMTY5NCwiZXhwIjoxNzM2ODI1Mjk0fQ.nK_LKwf_1s4Hv6Hu-mxMPL0jGKttjGa9nb0l9IjDkdfw9uFDIqy5B8iqMIy_peEYV8QQfY_WqbFSukKzaHbjBsoRGzC9YJTgADOIOofegzeefkcy25wzy0A3jFMLSxcq89lNkry24ejjZf3RkTOMbozmQgh4flVbGffXSsOSNjQd6GYgBjVCktTDyxPT2-nYpz8GGeheEKL5TN0Osq2OGyU9i6hr9TD0LCntIuOH1O15H6JIAhAbwiG3_3jHYZNSVlMsowuyuEHckTW0GuKtxBvN4RpJt3KANYNwxKNvm43inBYv3Er6r1NpKr-i4tcrr6dj4RqfHIQjMKRsaI-04w",
            token_type: "Bearer",
            scope: "https://www.googleapis.com/auth/userinfo.email https://mail.google.com/ openid https://www.googleapis.com/auth/userinfo.profile",
            refresh_token:
                "1//046ae8IA3bh99CgYIARAAGAQSNwF-L9IrY5_yBEJC6ChZc_SlKzuD-QWYjWFBeXHF_eNT5e0aygVjw4OeNi-qn6uTscvP10wXwZU",
        });
        console.log(
            "OAuth2クライアントクレデンシャル設定:",
            oauth2Client.credentials
        );

        const email = `
      MIME-Version: 1.0
      Content-Type: text/plain; charset="UTF-8"
      To: ${to}
      Subject: ${subject}

      ${body}
    `;

        const encodedEmail = Buffer.from(email)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        console.log("エンコード済みメール:", encodedEmail);

        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedEmail,
            },
        });

        console.log("メール送信成功:", { to });
    } catch (error) {
        console.error("メール送信エラー:", error);
        throw error;
    }
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { to, subject, body } = req.body;

        console.log("APIリクエスト受信:", { to, subject, body });

        try {
            await sendGmail(to, subject, body);
            res.status(200).json({ message: "メール送信成功" });
        } catch (error) {
            console.error("APIリクエストエラー:", error);
            res.status(500).json({ error: "メール送信に失敗しました。" });
        }
    } else {
        console.log(`不正なメソッド: ${req.method}`);
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
