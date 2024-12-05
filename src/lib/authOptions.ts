// src/handlers/authOptions.ts

import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { CustomFirestoreAdapter } from "@/services/customFirestoreAdapter";
import { AuthService } from "@/services/authService";
import { UserService } from "@/services/userService";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { container } from "tsyringe";
import { Logger } from "@/utils/logger";

const authService = container.resolve(AuthService);
const userService = container.resolve(UserService);

const adapter: CustomFirestoreAdapter = container.resolve(CustomFirestoreAdapter);

export const authOptions: NextAuthConfig = {
  // debug: true,
  adapter: adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["pkce", "nonce"],
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1時間
    updateAge: 60 * 60, // セッションを1時間ごとに更新
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    // サインイン時の処理
    async signIn({ user, account }) {
      if (!account || account.provider !== "google") {
        Logger.warn("現在、Googleアカウント以外の認証はサポートされていません。");
        return '/login?error=unsupportedProvider';
      }

      if (!user.email) {
        Logger.error("サインイン失敗: メールアドレスが提供されていません。");
        return "/login?error=noEmail";
      }

      if (!user.email.endsWith("@gmail.com")) {
        Logger.error("サインイン失敗: 許容規格：...@gmail.com 以外のメールアドレスです。");
        return "/login?error=invalidEmail";
      }

      const email = user.email;
      Logger.debug(`signIn callback: user: ${JSON.stringify(user, null, 2)}`);
      Logger.debug(`signIn callback: account: ${JSON.stringify(account, null, 2)}`);

      try {
        let firebaseUser = await authService.getUserByEmail(email);
        if (!firebaseUser) {
          Logger.info(`Firebase Authentication にユーザが存在しないため、新規作成します。: ${email}`);
          firebaseUser = await authService.createUser(
            email,
            user.name || undefined,
            user.image || undefined
          );
          Logger.info(`新規 Firebase ユーザ UID: ${firebaseUser.uid}`);
        }

        // 認証プロバイダとの同期状態を反映
        if (account) {
          await authService.createAccountEntry(firebaseUser.uid, account);
        }

        // Firestoreにユーザーデータがなければ作成
        const userData = await userService.getUserById(firebaseUser.uid);
        if (!userData) {
          Logger.info(`Firestoreにユーザが存在しないため、新規作成します: ${email}`);
          // User 型に適合するデータを作成
          const newUserData = {
            email: firebaseUser.email || email,
            name: firebaseUser.displayName || user.name || `User_${Date.now()}`,
            image: firebaseUser.photoURL || user.image || undefined,
            emailVerified: firebaseUser.emailVerified || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await userService.createUser(firebaseUser.uid, newUserData);
        } else {
          Logger.info(`Firestoreに既存ユーザが見つかりました: ${firebaseUser.uid}`);
        }

        // メールアドレス確認済みかチェック
        if (!firebaseUser.emailVerified) {
          Logger.warn(`ユーザ ${email} の登録が未完了です。確認メールを再送信します。`);
          await sendVerificationEmail(email);
          return false;
        }

        Logger.info(`ユーザー ${email} : 登録済み。ログイン処理を開始します。`);
        return true;
      } catch (error) {
        Logger.error("サインイン処理中にエラーが発生しました:", error);
        return false;
      }
    },
    // JWTトークン生成時の処理
    async jwt({ token, user }) {
      Logger.debug("JWTコールバック開始:", { token });
      if (user) {
        token.role = "user";
        token.subscriptionType = "free";
        token.id = user.id;
      }
      Logger.debug(`カスタマイズされた JWT: ${JSON.stringify(token, null, 2)}`);
      return token;
    },
    async session({ session, token }) {
      Logger.debug("セッションコールバック:", { session, token });
      session.user.role = token.role as string;
      session.user.id = token.id as string ?? undefined;
      return session;
    },
  },

};
