// src/pages/send-email.tsx

"use client";

import React, { useState } from "react";

const SendEmailPage: React.FC = () => {
    const [to, setTo] = useState<string>("");
    const [subject, setSubject] = useState<string>("Test Email");
    const [body, setBody] = useState<string>("This is a test email.");
    const [loading, setLoading] = useState<boolean>(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    const handleSendEmail = async () => {
        setLoading(true);
        setResponseMessage(null);

        try {
            const response = await fetch("/api/dev/testGmail/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to, subject, body }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "メール送信に失敗しました。"
                );
            }

            const result = await response.json();
            setResponseMessage(result.message || "メール送信成功！");
        } catch (error) {
            console.error("エラー:", error);
            setResponseMessage(
                error instanceof Error
                    ? error.message
                    : "予期しないエラーが発生しました。"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
                <h1 className="text-2xl font-bold mb-4">メール送信テスト</h1>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        送信先メールアドレス
                    </label>
                    <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="example@gmail.com"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        件名
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="メールの件名"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        本文
                    </label>
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded mt-1"
                        rows={5}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="メール本文を入力してください"
                    />
                </div>

                <button
                    onClick={handleSendEmail}
                    className={`w-full p-2 rounded text-white font-bold ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-700"
                    }`}
                    disabled={loading}
                >
                    {loading ? "送信中..." : "メール送信"}
                </button>

                {responseMessage && (
                    <div
                        className={`mt-4 p-2 rounded ${
                            responseMessage.includes("成功")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {responseMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendEmailPage;
