"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Modal from "./_components/Modal";

export default function SignInPage() {
    const { status } = useSession();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showVerificationSent, setShowVerificationSent] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        const verificationSent = searchParams.get('verificationSent');
        if (verificationSent) {
            setShowVerificationSent(true);
        }
        const errorParam = searchParams.get('error');
        if (errorParam) {
        switch (errorParam) {
            case 'unsupportedProvider':
                setError("サポートされていないプロバイダーです。");
                break;
            case 'noEmail':
                setError("メールアドレスが提供されていません。");
                break;
            case 'invalidEmail':
                setError("許容されていないメールアドレスです。");
                break;
            case 'multipleAccounts':
                setError("複数のアカウントが存在します。サポートにお問い合わせください。");
                break;
            case 'serverError':
                setError("サーバーエラーが発生しました。しばらくしてから再度お試しください。");
                break;
            default:
                setError("ログインに失敗しました。もう一度お試しください。");
            }
        }
    }, [searchParams]);

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

    const handleCloseModal = () => {
        setShowVerificationSent(false);
        router.replace('/signIn'); // クエリパラメータを削除
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

        {/* モーダル表示 */}
        {showVerificationSent && (
            <Modal
            title="確認メールを送信しました"
            message="選択されたメールアドレスに確認用メールを送信しました。登録/ログインを完了するにはメールボックスからメールのリンクをクリックしてください。"
            onClose={handleCloseModal}
            />
        )}
        </div>
    );
}
