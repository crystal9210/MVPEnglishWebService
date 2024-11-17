// Auth.js v5の設定ファイル
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { FirestoreAdapter } from "@auth/firebase-adapter";
// import { handleSignIn, handleSignUp, initializeUserData } from "@/lib/authCallbacks";
import { firestoreAdmin } from "./firebaseAdmin";
// import { User, Account, } from "@auth/core/types";
// import { AdapterUser } from "@auth/core/adapters";
import { sendVerificationEmail } from "./sendVerificationEmail";
import { initializeUserData } from "./authCallbacks";
import { profile } from "console";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // let url = new URL(req.url!, `http://${req.headers.get("host")}`);
  // let processType = url.searchParams.get("processType") || undefined; // デフォルトを "login" に設定
  // console.log("ProcessType:", processType);
    // debug: true,
    adapter: FirestoreAdapter(firestoreAdmin),
    providers: [
        // リンクメモ
        // https://accounts.google.com/o/oauth2/auth?client_id=406930035276-8rqhfui4de5arfks1ae8rhfjb92em1s4.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email&access_type=offline&prompt=consent
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            checks: ["pkce"],
            authorization: {
                params: {
                    // scope変えたりしたときに発行できるサイトリンク
                    // https://developers.google.com/oauthplayground/
                    scope: "openid https://mail.google.com/ https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
                    access_type: "offline", // リフレッシュトークンを取得
                    prompt: "consent", // ユーザに許可を求める
                    redirect_uri: "http://localhost:3000/api/auth/callback/google",
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
        maxAge: 60 * 60 * 24, // 1day
    },
    secret: process.env.AUTH_SECRET,
    callbacks: {
        // サインイン時の処理
        async signIn({ user, account }) {
        if (account?.state) {
          // JSON文字列をパース
          const state = JSON.parse(account.state);
          const processType = state.processType;

          console.log("ProcessType:", processType);

          if (!["register", "login"].includes(processType)) {
            throw new Error(`Invalid processType: ${processType}`);
          }

          // processTypeに応じた処理
          if (processType === "register") {
            console.log("Registration logic here...");
          } else if (processType === "login") {
            console.log("Login logic here...");
          }


        if (!account || account.provider !== "google") {
          console.warn("現在、Googleアカウント以外の認証はサポートされていません。");
          return false;
        }

        if (!user.email) {
          console.error("サインイン失敗: メールアドレスが提供されていません。");
          return false;
        }

        const email = user.email;

        try {
          const userCollection = firestoreAdmin.collection("users");
          const userQuerySnapshot = await userCollection
            .where("email", "==", email)
            .where("provider", "==", "google")
            .limit(1)
            .get();
          const userDocs = userQuerySnapshot.docs;

          if (processType === "signIn") {
            if (userDocs.length === 0) {
              console.warn(`ユーザー ${email} はFirestoreに存在しません。`);
              return "";
            }

            const userData = userDocs[0].data();
            if (!userData.emailVerified) {
              console.log(`ユーザー ${email} のメールアドレスが未確認です。確認メールを送信します。`);
              await sendVerificationEmail(email);
              return false;
            }

            console.log(`確認済みユーザー: ${email}`);
            return true;
          }

          if (processType === "register") {
            if (userDocs.length > 0) {
              const userData = userDocs[0].data();
              if (userData.emailVerified) {
                console.log(`ユーザー ${email} は既に登録されています。`);
                return false;
              }

              console.log(`ユーザー ${email} の登録が未完了です。確認メールを再送信します。`);
              await sendVerificationEmail(email);
              return false;
            }

            console.log(`新規ユーザー ${email} を登録します。`);
            await sendVerificationEmail(email);
            return true;
          }

          throw new Error("無効な processType が指定されました。");
        } catch (error) {
          console.error("サインイン処理中にエラーが発生しました:", error.message);
          return false;
        }
      }},
        // JWTトークン生成時の処理
        async jwt({ token, account }) {
            return await initializeUserData(token, account);
        },
        async session({ session, token }) {
        session.user.role = token.role as string | "user";
        return session;
        },
    },
});





// 参考: Credentials認証を使用した場合の実装
// import NextAuth, { User, NextAuthConfig } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "./firebase";

// // npm info next-auth types - Auth.jsの型エクスポートを確認

// export const authOptions: NextAuthConfig = {
//     providers: [
//         Credentials({
//             name: "Email",
//             credentials: {
//                 email: { label: "Email", type: "email" },
//                 password: { label: "Password", type: "password" },
//             },
//             authorize: async (credentials) => {
//                 if (!credentials?.email || !credentials.password) {
//                     return null;
//                 }

//                 try {
//                     const userCredential = await signInWithEmailAndPassword(
//                         auth,
//                         credentials!.email as string,
//                         credentials!.password as string
//                     );
//                     const user = userCredential.user;
//                     return {
//                         id: user.displayName,
//                         email: user.email,
//                         name: user.displayName || user.email, // 必須ではないがnameが必要な場合
//                     } as User;
//                 } catch (error) {
//                     console.error(error);
//                     return null;
//                 }
//             },
//         }),
//     ],
//     session: {
//         strategy: "jwt",
//     },
//     // jwt: {
//     //     encryption: true,
//     // },
//     secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);

// 【Auth.jsでパスワードベースの認証が推奨されていない理由】
// リスト方攻撃やクレデンシャルスタッフィング
