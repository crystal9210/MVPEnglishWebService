import "@/containers/diContainer";
import { NextAuthConfig } from "next-auth";
import GoogleProvider from "@auth/core/providers/google";
import { container } from "tsyringe";
import { CustomFirestoreAdapter } from "@/adapters/customFirestoreAdapter";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";
import { CustomFirestoreAdapterWrapper } from "@/adapters/customFirestoreAdapterWrapper";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

const adapter = container.resolve<CustomFirestoreAdapter>(
    TSYRINGE_TOKENS.CustomFirestoreAdapter
);
// Optional: Log adapter properties for debugging
console.log("Adapter instance:", adapter);
console.log("Adapter keys:", Object.keys(adapter));
console.log(
    "Adapter prototype keys:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(adapter))
);
console.log(adapter.createUser);
console.log(adapter.getUser);
console.log(adapter.getUserByAccount);
// console.log(`AUTH_SECRET: ${process.env.AUTH_SECRET}`)

export const authOptions: NextAuthConfig = {
    // debug: true,
    adapter: CustomFirestoreAdapterWrapper(),
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
                    redirect_uri:
                        "http://localhost:3000/api/auth/callback/google",
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
        async signIn({ user, account }) {
            if (!account || account.provider !== "google") {
                console.warn(
                    "現在、Googleアカウント以外の認証はサポートされていません。"
                );
                return "/signIn?error=unsupportedProvider";
            }

            if (!user.email) {
                console.error(
                    "サインイン失敗: メールアドレスが提供されていません。"
                );
                return "/signIn?error=noEmail";
            }
            console.log(`user.email: ${user.email}`);
            if (!user.email.endsWith("@gmail.com")) {
                console.error(
                    "サインイン失敗: 許容規格：...@gmail.com 以外のメールアドレスです。"
                );
                return "/signIn?error=invalidEmail";
            }

            const email = user.email;
            console.log(
                `debugging signIn callback: user: ${JSON.stringify(
                    user,
                    null,
                    2
                )}`
            );
            console.log(
                `debugging signIn callback: account: ${JSON.stringify(
                    account,
                    null,
                    2
                )}`
            );

            try {
                const adapter = CustomFirestoreAdapterWrapper();
                const existingUser = await adapter.getUserByEmail!(email);
                if (existingUser && existingUser.emailVerified === null) {
                    await sendVerificationEmail(email);
                    return false;
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error(
                        "サインイン処理中にエラーが発生しました:",
                        error.message
                    );
                    return false;
                } else {
                    console.error(
                        "サインイン中に予期せぬエラーが発生しました。",
                        error
                    );
                    return false;
                }
            }
            return true;
        },
        // JWTトークン生成時の処理
        async jwt({ token, user }) {
            console.log("JWTコールバック開始:", { token }); // TODO (修正)account:undefined
            console.log(`debug: user: ${JSON.stringify(user, null, 2)}`);
            // if(user) {
            token.role = "user";
            token.subscriptionType = "free";
            // token.id = user.id;
            // token.id = user?.id;
            // }
            console.log(`costomized JWT: ${JSON.stringify(token, null, 2)}`);

            if (token.exp === undefined) {
                console.error("Invalid token, you must not  ");
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
            session.user.id = (token.id as string) ?? undefined;

            // 必要に応じてトークンデータを追加
            // session.accessToken = token.accessToken;
            // session.refreshToken = token.refreshToken;

            return session;
        },
    },
};
