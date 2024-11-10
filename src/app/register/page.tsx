"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // Googleアイコン
import { FaGithub } from "react-icons/fa"; // GitHubアイコン
import { Modal } from "./_components/Modal";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setModalVisible] = useState(false); // モーダル表示フラグ
    const router = useRouter();

    // メールでの登録処理
    const handleEmailRegister = async () => {
        setLoadingEmail(true);
        setError(null);

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name: "New User" }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "登録に失敗しました。");
            }

            setSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
                setModalVisible(true); // モーダルを表示
            } else {
                setError("登録処理中にエラーが発生しました。");
                setModalVisible(true); // モーダルを表示
            }
        } finally {
            setLoadingEmail(false);
        }
    };

    // OAuth登録処理
    const handleOAuthRegister = async (provider: string) => {
        setLoadingProvider(provider);
        setError(null);

        try {
            const result = await signIn(provider, { redirect: false });

            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
                setModalVisible(true); // モーダルを表示
            } else {
                setError("OAuth登録中にエラーが発生しました。");
                setModalVisible(true); // モーダルを表示
            }
        } finally {
            setLoadingProvider(null);
        }
    };

    // モーダル操作ハンドラ
    const handleNavigateToHome = () => {
        setModalVisible(false); // モーダルを閉じる
        router.push("/"); // ホームページへリダイレクト
    };
    const handleNavigateToRegister = () => {
        setModalVisible(false); // モーダルを閉じる
        router.push("/register"); // 登録ページへリダイレクト
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 px-4">
            <h1 className="text-3xl font-bold mb-8 text-blue-700">新規登録</h1>

            {/* メール送信成功時 */}
            {success ? (
                <p className="text-green-600 text-center text-lg mb-6">
                    確認メールを送信しました！<br />
                    メールを確認してください。
                </p>
            ) : (
                <>
                    {error && (
                        <p className="text-red-600 text-center text-lg mb-4">
                            {error}
                        </p>
                    )}

                    {/* メール登録フォーム */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 w-full max-w-lg">
                        <h2 className="text-gray-800 text-lg font-semibold mb-4">
                            メールで登録
                        </h2>
                        <input
                            type="email"
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                        />
                        <button
                            onClick={handleEmailRegister}
                            disabled={loadingEmail}
                            className={`w-full py-2 rounded-lg text-white font-semibold transition-all duration-200 ${
                                loadingEmail
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {loadingEmail ? "送信中..." : "メールで登録"}
                        </button>
                    </div>

                    {/* ソーシャルアカウント登録 */}
                    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg">
                        <h2 className="text-gray-800 text-lg font-semibold mb-4">
                            ソーシャルアカウントで登録
                        </h2>
                        <button
                            onClick={() => handleOAuthRegister("google")}
                            disabled={loadingProvider === "google"}
                            className={`flex items-center justify-center w-full py-2 mb-4 rounded-lg font-semibold transition-all duration-200 ${
                                loadingProvider === "google"
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                            }`}
                        >
                            <FcGoogle className="text-2xl mr-2" />
                            {loadingProvider === "google"
                                ? "Googleで登録中..."
                                : "Googleで登録"}
                        </button>
                        <button
                            onClick={() => handleOAuthRegister("github")}
                            disabled={loadingProvider === "github"}
                            className={`flex items-center justify-center w-full py-2 rounded-lg font-semibold transition-all duration-200 ${
                                loadingProvider === "github"
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700"
                            }`}
                        >
                            <FaGithub className="text-2xl mr-2" />
                            {loadingProvider === "github"
                                ? "GitHubで登録中..."
                                : "GitHubで登録"}
                        </button>
                    </div>
                </>
            )}

            {/* モーダル */}
            <Modal
                isVisible={isModalVisible}
                onClose={handleNavigateToHome}
                onNavigate={handleNavigateToRegister}
            />
        </div>
    );
}
