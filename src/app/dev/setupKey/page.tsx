"use client";

import React, { useState } from "react";
import { useMemoContext } from "@/contexts/MemoContext";
import { useRouter } from "next/navigation";
import { EncryptionOptions } from "@/utils/crypto/cryptoFactory";

const SetupKeyPage: React.FC = () => {
    const [passphrase, setPassphrase] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { initializeEncryption } = useMemoContext();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passphrase) {
            setError("パスフレーズを入力してください。");
            return;
        }
        const options: EncryptionOptions = {
            algorithm: "AES-GCM",
            keyLength: 256, // デフォルト値
        };
        try {
            await initializeEncryption(options);
            // 必要に応じてパスフレーズからキーを導出するロジックを追加
            router.push("/decrypted-memos");
        } catch (err) {
            setError("キーの初期化に失敗しました。");
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-96"
            >
                <h1 className="text-xl font-bold mb-4">パスフレーズの設定</h1>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <div className="mb-4">
                    <label
                        htmlFor="passphrase"
                        className="block text-sm font-medium text-gray-700"
                    >
                        パスフレーズ
                    </label>
                    <input
                        type="password"
                        id="passphrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                    キーを設定
                </button>
            </form>
        </div>
    );
};

export default SetupKeyPage;
