// Auth.js v5の設定ファイル
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { handleSignIn, handleSignUp, initializeUserData } from "@/lib/authCallbacks";
import { firestoreAdmin } from "./firebaseAdmin";

export const { auth, handlers, signIn, signOut } = NextAuth({
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
        async signIn({ user }) {
            if (!user?.email) {
              console.error("サインイン失敗: メールアドレスが存在しません。");
              return false;
            }
        
            const loginResult = await handleSignIn(user.email);
        
            if (loginResult === true) {
              return true;
            }
        
            if (typeof loginResult === "string") {
              console.log(`ユーザー ${user.email} は未登録または未確認。登録処理を実行します。`);
        
              const signUpResult = await handleSignUp({
                email: user.email,
                name: user.name || "Unknown",
                image: user.image || "",
              });
        
              if (typeof signUpResult === "string") {
                console.log(`確認メール送信済み。リダイレクト先: ${signUpResult}`);
                return signUpResult;
              }
        
              console.error(`登録処理中にエラーが発生しました: ${signUpResult}`);
              return false;
            }
        
            return false;
          },
        // JWTトークン生成時の処理
        async jwt({ token, account }) {
            return await initializeUserData(token, account);
        },
        async session({ session, token }) {
        session.user.role = token.role as string | undefined;
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