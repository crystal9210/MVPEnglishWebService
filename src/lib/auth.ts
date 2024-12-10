// Auth.js v5の設定ファイル
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { CustomFirestoreAdapter } from "./customFirestoreAdapter";
// import { handleSignIn, handleSignUp, initializeUserData } from "@/lib/authCallbacks";
import { FirestoreAdmin } from "../domain/services/firebaseAdmin";
// import { User, Account, } from "@auth/core/types";
// import { AdapterUser } from "@auth/core/adapters";
import { sendVerificationEmail } from "./sendVerificationEmail";
import { createAccountEntry, createUser, getUserByEmail } from "./authService";

const adapter = CustomFirestoreAdapter();
console.log("Adapter keys:", Object.keys(adapter));

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
    // debug: true,
    adapter: adapter,
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
            return '/signIn?error=unsupportedProvider';
          }

          if (!user.email) {
            console.error("サインイン失敗: メールアドレスが提供されていません。");
            return "/signIn?error=noEmail";
          }
          console.log(`user.email: ${user.email}`);
          if(!user.email.endsWith("@gmail.com")) {
            console.error("サインイン失敗: 許容規格：...@gmail.com 以外のメールアドレスです。");
            return "/signIn?error=invalidEmail";
          }

          const email = user.email;
          console.log(`debugging signIn callback: user: ${JSON.stringify(user, null, 2)}`);
          console.log(`debugging signIn callback: account: ${JSON.stringify(account, null, 2)}`);

          try {
            let firebaseUser = await getUserByEmail(email);
            if (!firebaseUser) {
              console.log(`Firebase Authentication にユーザが存在しないため、新規作成します。: ${email}`);
              firebaseUser = await createUser(
                email,
                user.name || undefined,
                user.image || undefined
              );
              console.log(`新規 Firebase ユーザ UID: ${firebaseUser.uid}`);
            }

            // 認証プロバイダとの同期状態を反映
            if (account) {
              await createAccountEntry(firebaseUser.uid, account);
            }

            const userDocRef = FirestoreAdmin.collection("users").doc(firebaseUser.uid);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
              console.log(`Firestoreにユーザが存在しないため、新規作成します: ${email}`);
              await userDocRef.set({
                email: firebaseUser.email,
                name: user.name || firebaseUser.displayName || `User_${Date.now()}`,
                iamge: user.image || firebaseUser.photoURL || undefined,
                emailVerified: firebaseUser.emailVerified || false, // TODO 登録確認メールを受け取ったapiでauthentication・firestore両方に対してemailVerified: trueとする
                // createdAt: FieldValue.serverTimestamp(),
                // updatedAt: FieldValue.serverTimestamp(),
              });
              console.log(`Firestoreにユーザデータを作成しました: ${firebaseUser.uid}`);
            } else {
              console.log(`Firestoreに既存ユーザが見つかりました: ${firebaseUser.uid}`);
            }

            const userCollection = FirestoreAdmin.collection("users");
            const userQuerySnapshot = await userCollection
              .where("email", "==", email)
              .limit(1)
              .get();
            const userDocs = userQuerySnapshot.docs;

            if (userDocs.length > 1) {
              console.error(`ユーザ ${email} が存在しますが複数アカウントあり規約に違反しています。`);
              return "/signIn?error=multipleAccounts";
            }
            if (userDocs.length === 1 && userDocs[0].data().emailVerified !== true) {
                console.log(`ユーザー ${email} の登録が未完了です。確認メールを再送信します。`);
                await sendVerificationEmail(email);
                return false;
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
        async jwt({ token, user }) {
          console.log("JWTコールバック開始:", { token}); // TODO (修正)account:undefined
          console.log(`debug: user: ${JSON.stringify(user, null, 2)}`);
          // if(user) {
            token.role = "user";
            token.subscriptionType = "free";
            // token.id = user.id;
            // token.id = user?.id;
          // }
          console.log(`costomized JWT: ${JSON.stringify(token, null, 2)}`);

          if(token.exp === undefined) {
            console.error("Invalid token, you must not  ")
            // return token;
          }

          // if(Date.now() < token.exp!) {

          // }
          return token;
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
