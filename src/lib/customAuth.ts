"use server";
import { authRequestSchema } from "@/schemas/auth";
import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { signIn } from "next-auth/react";
import { sendVerificationEmail } from "./sendVerificationEmail";

const messages = {
    registerCompleted: "Registration is already completed. Please log in from the login page.",
    verificationResent: "Verification email was resent. Please check your Gmail inbox.",
    registrationStarted: "Registration initiated. Verification email has been sent.",
    loginRedirect: "/register",
    unsupportedProvider: "Only Google authentication is supported.",
    verificationEmailSent: "Verification email was sent. Please check your Gmail inbox.",
    signInFailed: "Sign-in failed.",
    registerFailed: "Registration failed during sign-in.",
    internalServerError: "Internal server error.",
};

export async function customAuth(email: string, processType: "signIn" | "register", provider: string) {
    try {
        const data =authRequestSchema.parse({ email, processType, provider });
        // サポートされていないプロバイダーチェック
        if (data.provider !== "google") {
        console.warn(`Unsupported provider: ${data.provider}.`);
        return { success: false, message: messages.unsupportedProvider };
        }

        const userCollection = firestoreAdmin.collection("users");
        const userQuerySnapshot = await userCollection
            .where("email", "==", email)
            .where("provider", "==", "google")
            .limit(1)
            .get();
        const userDocs = userQuerySnapshot.docs;

        if(data.processType == "signIn") {
            // ユーザーが存在しない場合
            if (userDocs.length === 0) {
                console.warn(`ユーザ ${email} はFirestoreに存在しません。ログインする場合にはアカウント登録が必要です。`);
                return { success: false, message: "/register" }; // 登録画面へのリダイレクト指示
            }
            const userData = userDocs[0].data();
            console.log(`Firestore ユーザーデータを取得しました:`, userData);

            if (userData.emailVerified == null || userData.emailVerified == undefined) {
                console.log(`ユーザ ${email} のメールアドレスは未確認です。確認メールをGmailに送信します。確認ができたらリンクをクリックして確認処理を完了してください。`);
                await sendVerificationEmail(data.email);
                return { success: false, message: "Verification email was sent. Please chech your gmail inbox."};
            }

            // メールアドレスが確認済みの場合、signIn 処理を呼び出す
            console.log(`ユーザー ${email} のメールアドレスは確認済みです。サインインを実行します。`);
            const result = await signIn("google", { email, redirect: false });
            if (!result?.ok) {
                throw new Error("サインインに失敗しました。");
            }

            return { success: true, message: "Sign-in successful.", data: result };
        } else if(processType == "register") {
            if (userDocs.length > 0) {
                const userData = userDocs[0].data();
                if (userData.emailVerified) {
                    console.log(`ユーザー ${email} は既に登録処理が完了しています。ログイン画面からログインしてください。`);
                    return {
                        success: false,
                        message: "Registration is already completed. Please log in from the login page.",
                    };
                }
                console.warn(`ユーザー ${email} の登録処理が未完了です。確認メールを再送信します。`);
                await sendVerificationEmail(email);
                return {
                    success: false,
                    message: "Verification email was resent. Please check your Gmail inbox.",
                };
            }

            console.log(`ユーザー ${email} はFirestoreに存在しません。登録処理を開始します。`);
            const result = await signIn("google", { email, redirect: false });
            if (!result?.ok) {
                throw new Error("登録処理中の signIn に失敗しました。");
            }
            await sendVerificationEmail(email);

            return {
                success: true,
                message: "Registration initiated. Verfication email has been sent."
            };
        }


        throw new Error("Invalid process type for this function.");
    } catch (error) {
        console.error("Authentication error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Internal server error." };
    }
};
