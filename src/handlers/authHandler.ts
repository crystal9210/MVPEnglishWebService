import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AuthService } from "@/services/authService";
import { UserService } from "@/services/userService";
import { container } from "tsyringe";
import { Logger } from "@/utils/logger";

const authService = container.resolve(AuthService);
const userService = container.resolve(UserService);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    // 他のプロバイダも同様に設定
  ],
  callbacks: {
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
        const userData = await userService.getUserData(firebaseUser.uid);
        if (!userData) {
          Logger.info(`Firestoreにユーザが存在しないため、新規作成します: ${email}`);
          await userService.createUserData(firebaseUser);
        } else {
          Logger.info(`Firestoreに既存ユーザが見つかりました: ${firebaseUser.uid}`);
        }

        // メールアドレス確認済みかチェック（必要に応じて）
        if (!firebaseUser.emailVerified) {
          Logger.warn(`ユーザ ${email} のメールアドレスは未確認です。`);
          // ここで確認メールを送信する処理を追加できます
          return "/verify-email";
        }

        Logger.info(`ユーザー ${email} : 登録済み。ログイン処理を開始します。`);
        return true;
      } catch (error) {
        Logger.error("サインイン処理中にエラーが発生しました:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = "user";
        token.subscriptionType = "free";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1時間
  },
};
