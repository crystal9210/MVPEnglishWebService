"use client";

import { useState } from "react";

export default function RegistrationForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification email.");
            }

            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("登録に失敗しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">新規登録</h1>
            {success ? (
                <p className="text-green-500 mb-4">確認メールを送信しました！</p>
            ) : (
                <>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input mb-4"
                    />
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? "送信中..." : "登録"}
                    </button>
                </>
            )}
        </div>
    );
}
