// Auth.js v5の設定ファイル
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestore } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { firestoreAdmin } from "./firebaseAdmin";

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: FirestoreAdapter(firestoreAdmin),
    providers: [
        GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
        GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24,
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                const userRef = doc(firestore, "users", token.sub!);
                await setDoc(
                    userRef,
                    { role: "user", permissions: ["read"] },
                    { merge: true } // マージで既存データ保持
                );
                token.role = "user";
            }
            return token;
        },
        async session({ session, token }) {
        session.user.role = token.role as string | undefined;
        return session;
        },
    },
    secret: process.env.AUTH_SECRET,
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