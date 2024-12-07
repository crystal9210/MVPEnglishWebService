// src/handlers/authHandler.ts
import "@/containers/diContainer";
import { NextAuthConfig } from "next-auth";
import GoogleProvider from "@auth/core/providers/google"; // `@auth/core/providers` からインポート
import { container } from "tsyringe";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { CustomFirestoreAdapter } from "@/adapters/customFirestoreAdapter";

// カスタムアダプターの初期化とログ出力
const adapter = CustomFirestoreAdapter();
console.log("Adapter keys:", Object.keys(adapter));

export const authOptions: NextAuthConfig = { // `AuthConfig` を使用
    debug: true,
    adapter: adapter,
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            checks: ["pkce", "nonce"],
            authorization: {
                params: {
                    scope: "openid https://mail.google.com/ https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
                    access_type: "offline", // リフレッシュトークンを取得
                    prompt: "consent", // ユーザに許可を求める
                    redirect_uri: "http://localhost:3000/api/auth/callback/google",
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 1時間
        updateAge: 60 * 60, // 1時間
    },
    secret: process.env.AUTH_SECRET,
    callbacks: {
        /**
         * サインイン処理
         */
        async signIn({ user, account }) {
            // コールバック関数内で依存関係を解決
            const logger = container.resolve<ILoggerService>("ILoggerService");

            logger.info("signIn callback started");

            try {
                // Googleプロバイダー以外をブロック
                if (!account || account.provider !== "google") {
                    logger.warn("現在、Googleアカウント以外の認証はサポートされていません。");
                    return "/login?error=unsupportedProvider";
                }

                // メールアドレスの検証
                if (!user.email) {
                    logger.error("サインイン失敗: メールアドレスが提供されていません。");
                    return "/login?error=noEmail";
                }
                if (!user.email.endsWith("@gmail.com")) {
                    logger.error("サインイン失敗: 許容規格：...@gmail.com 以外のメールアドレスです。");
                    return "/login?error=invalidEmail";
                }

                logger.info(`Sign-in allowed for email: ${user.email}`);
                return true;
            } catch (error) {
                logger.error("サインイン処理中にエラーが発生しました", { error });
                return "/login?error=serverError"; // エラー時にリダイレクト先を指定
            }
        },

        /**
         * JWT トークン生成時の処理
         */
        async jwt({ token, user }) {
            if (user) {
                token.role = "user";
                token.subscriptionType = "free";
                token.id = user.id;
            }
            return token;
        },

        /**
         * セッション生成時の処理
         */
        async session({ session, token }) {
            // session.user.role = token.role as string;
            session.user.id = token.id as string;
            return session;
        },
    },
};
