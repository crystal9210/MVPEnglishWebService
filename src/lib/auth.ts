// Auth.js v5の設定ファイル
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestore } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestoreAdmin } from "./firebaseAdmin";
import { sendVerificationEmail } from "./sendVerificationEmail";

export const { auth, handlers, signIn, signOut } = NextAuth({
    debug: true,
    adapter: FirestoreAdapter(firestoreAdmin),
    providers: [
        // リンクメモ
        // https://accounts.google.com/o/oauth2/auth?client_id=406930035276-8rqhfui4de5arfks1ae8rhfjb92em1s4.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email&access_type=offline&prompt=consent
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // checks: ["pkce"],
            authorization: {
                params: {
                    scope: "openid email profile https://mail.google.com/ https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
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
        async signIn({ user }) {
            const userRef = firestoreAdmin.collection("users").doc(user.id!);
            const userSnap = await userRef.get();

            if (!userSnap.exists) {
                throw new Error("NOT_REGISTERED");
            }
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                const userRef = doc(firestore, "users", token.sub!);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        email: token.email,
                        name: token.name,
                        avatar: token.picture,
                        role: "user",
                        emailVerified: false,
                        permissions: ["read"],
                        createdAt: new Date(),
                    },
                    { merge: true } // マージで既存データ保持
                    );
                    await sendVerificationEmail(token.email!); // 初回登録時に確認メール送信
                }
            }
            return token;
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
// リスト方攻撃やクレデンシャルスタッフィングt