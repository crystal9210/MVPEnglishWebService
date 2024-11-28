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

export const { auth, handlers, signIn, signOut } = NextAuth({
    // debug: true,
    adapter: FirestoreAdapter(firestoreAdmin),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
        GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt", // デフォルトでjweを利用し最適化されるようになっている
        maxAge: 60 * 60 , // セッション有効期限:1h
        updateAge: 60 * 60, // セッションを1時間ごとに更新
    },
    // jwt: ,
    // events: ,
    secret: process.env.AUTH_SECRET,
    callbacks: {
        // サインイン時の処理
        async signIn({ user, account }) {

        if (!account || account.provider !== "google") {
          console.warn("現在、Googleアカウント以外の認証はサポートされていません。");
          return '/login?error=unsupportedProvider';
        }

        if (!user.email) {
          console.error("サインイン失敗: メールアドレスが提供されていません。");
          return "/login?error=noEmail";
        }
        console.log(`user.email: ${user.email}`);
        if(!user.email.endsWith("@gmail.com")) {
          console.error("サインイン失敗: お使いのメールアドレスは標準のメールアドレス規格を満たしていません。 許容規格：...@gmail.com");
          return "/login?error=invalidEmail";
        }

        const email = user.email;

        try {
          const userCollection = firestoreAdmin.collection("users");
          const userQuerySnapshot = await userCollection
            .where("email", "==", email)
            .limit(1)
            .get();
          const userDocs = userQuerySnapshot.docs;

          if (userDocs.length === 0) {
            console.warn(`ユーザー ${email} はFirestoreに存在しません。仮登録と同時に確認メールを送信します。`);
            await sendVerificationEmail(email);
            return "/login?verificationSent=true";
          }
          if (userDocs.length > 1) {
            console.error(`ユーザ ${email} が存在しますが複数アカウントあり規約に違反しています。`);
            return "/login?error=multipleAccounts";
          }
          if (userDocs.length === 1 && userDocs[0].data().emailVerified !== true) {
              console.log(`ユーザー ${email} の登録が未完了です。確認メールを再送信します。`);
              await sendVerificationEmail(email);
              return "login?verificationSent=true";
            }
          console.log(`ユーザー ${email} : 登録済み。ログイン処理を開始します。`);
          return true;
        } catch (error) {
          if (error instanceof Error) {
            console.error("サインイン処理中にエラーが発生しました:", error.message);
            return false;
          } else {
            console.error("サインイン中に予期せぬエラーが発生しました。", error);
            return false;
          }
        }
      },
        // JWTトークン生成時の処理
        async jwt({ token, account, user }) {
          console.log("JWTコールバック開始:", { token, account }); // TODO (修正)account:undefined
          console.log(`debug: user: ${JSON.stringify(user, null, 2)}`);
          // if(user) {
            token.role = "user";
            token.subscriptionType = "free";
            token.id = user?.id;
          // }
          console.log(`costomized JWT: ${JSON.stringify(token, null, 2)}`);

          if(token.exp === undefined) {
            console.error("Invalid token, you must not  ")
            // return token;
          }

          // if(Date.now() < token.exp!) {

          // }
          return token;


          // // 初回ログイン時
          // if (account) {
          //   // アカウント情報が存在する場合（ログイン時）
          //   console.log("ログイン時にアクセストークンとリフレッシュトークンを設定します。");
          //   token.accessToken = account.access_token;
          //   token.refreshToken = account.refresh_token;
          //   token.exp = Date.now() + 40 * 60 * 1000, // 40min
          //   token.provider = account.provider;
          //   console.log(`token: ${JSON.stringify(token, null, 2)}`);
          // }

          // if(token.exp && Date.now() < token.exp) {
          //   return token;
          // }

          // return await refreshToken(token);

          // if (user) {
          //   // ユーザー情報が存在する場合（ログイン時）
          //   console.log("ログイン時: ユーザー情報をトークンに追加します。");
          //   token.email = user.email;
          //   token.name = user.name;
          //   token.picture = user.image;
          //   console.log(`token: ${JSON.stringify(token, null, 2)}`);
          // }

          // Firestoreから追加情報を取得してトークンに反映
          // const email = token.email;
          // if (email) {
          //   console.log(`Firestoreからユーザー (${email}) の情報を取得します。`);
          //   const userDocs = await firestoreAdmin.collection("users").
          //     where("email", "==", email)
          //     .limit(1)
          //     .get();
          //   const userDoc = userDocs.docs[0];

          //   if (userDoc.exists) {
          //     const userData = userDoc.data();
          //     token.role = userData?.permissions?.includes("admin") ? "admin" : "user";
          //     console.log(`ユーザー (${email}) のロールは: ${token.role}`);
          //   } else {
          //     console.warn(`Firestoreにユーザー (${email}) の情報が存在しません。`);
          //   }
          // } else {
          //   console.warn("トークンにメールアドレス情報が存在しません。Firestoreの確認はスキップします。");
          // }

          // console.log("JWTコールバック終了: 更新されたトークン", token);

          // return token;
        },
        async session({ session, token }) {
          console.log("セッションコールバック:", { session, token });

          // セッションにトークン情報をコピー
          // session.user.email = token.email as string;
          // session.user.name = token.name;
          // session.user.image = token.picture;
          session.user.role = "user";
          session.user.id = token.id as string ?? undefined;

          // 必要に応じてトークンデータを追加
          // session.accessToken = token.accessToken;
          // session.refreshToken = token.refreshToken;

          return session;
        }
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
