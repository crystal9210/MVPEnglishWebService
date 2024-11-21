"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // ルーターを使用
import { FcGoogle } from "react-icons/fc"; // Googleアイコン
import { FaGithub } from "react-icons/fa"; // GitHubアイコン

export default function LoginPage() {
    const { status } = useSession();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null); // ログイン中のプロバイダーを追跡
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // ルーターを使用

    useEffect(() => {
        if(status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    // ログイン済みの場合
    if (status === "loading" || status === "authenticated") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>

            </div>
        );
    }

    // ログインボタンのクリック処理
    const handleSignIn = async (provider: string) => {
        setLoadingProvider(provider);
        setError(null);
        try {
            const result = await signIn(provider);
            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("ログインに失敗しました。もう一度お試しください。");
            }
        } finally {
            setLoadingProvider(null);
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
