"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc"; // Googleアイコン
import { FaGithub } from "react-icons/fa"; // GitHubアイコン

export default function LoginPage() {
    const { data: session, status } = useSession();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null); // ログイン中のプロバイダーを追跡
    const [error, setError] = useState<string | null>(null);

    // ローディング中の表示
    if (status === "loading") {
        return <div>セッションを確認中...</div>;
    }

    // ログイン済みの場合
    if (session) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">ログイン済みです</h1>
                <p className="text-gray-700">
                    ようこそ、<span className="font-semibold">{session.user?.email}</span> さん
                </p>
            </div>
        );
    }

    // ログインボタンのクリック処理
    const handleSignIn = async (provider: string) => {
        setLoadingProvider(provider); // 現在ログイン中のプロバイダーを設定
        setError(null); // エラーをリセット
        try {
            await signIn(provider, { redirectTo: "/dashboard" });
        } catch (err) {
            console.error(err);
            setError("ログインに失敗しました。もう一度お試しください。");
        } finally {
            setLoadingProvider(null); // ログイン処理終了時にリセット
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 pt-16">
            <h1 className="text-2xl font-bold mb-8 text-gray-600">ログイン</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
                onClick={() => handleSignIn("google")}
                disabled={loadingProvider === "google"}
                className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200 mb-4 w-64"
            >
                <FcGoogle className="text-2xl mr-2" />
                {loadingProvider === "google" ? "Googleでログイン中..." : "Googleでログイン"}
            </button>
            <button
                onClick={() => handleSignIn("github")}
                disabled={loadingProvider === "github"}
                className="flex items-center justify-center px-4 py-2 bg-black text-white border border-gray-700 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 w-64"
            >
                <FaGithub className="text-2xl mr-2" />
                {loadingProvider === "github" ? "GitHubでログイン中..." : "GitHubでログイン"}
            </button>

            {/* 新規登録エリア */}
            <div className="mt-16 text-center">
                <p className="text-gray-600">
                    アカウントをお持ちでない場合は、まずGoogleまたはGitHubで登録してください。
                </p>
                <p className="text-gray-600">その後、再度このページからログインしてください。</p>
            </div>
        </div>
    );
}
