"use client";

import React from "react";
import { useMemoContext } from "@/contexts/MemoContext";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

const EncryptedMemoListPage: React.FC = () => {
    const {
        getEncryptedMemoList, // 暗号化されたメモを取得するメソッド
        isLoading,
        error,
    } = useMemoContext();

    const [encryptedMemos, setEncryptedMemos] = React.useState<Memo[]>([]);

    React.useEffect(() => {
        const fetchEncryptedMemos = async () => {
            try {
                const memos = await getEncryptedMemoList();
                setEncryptedMemos(memos);
            } catch (err) {
                console.error("Failed to fetch encrypted memos:", err);
            }
        };
        fetchEncryptedMemos();
    }, [getEncryptedMemoList]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center">
                    暗号化されたメモ一覧
                </h1>
            </header>

            {isLoading && (
                <div className="flex justify-center items-center">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {encryptedMemos.length === 0 ? (
                        <p className="text-gray-600 text-center">
                            暗号化されたメモがありません。
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {encryptedMemos.map((memo) => (
                                <EncryptedMemoCard key={memo.id} memo={memo} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ローディング用のスピナーのスタイル */}
            <style jsx>{`
                .loader {
                    border-top-color: #3498db;
                    animation: spin 1s ease-in-out infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

interface EncryptedMemoCardProps {
    memo: Memo;
}

const EncryptedMemoCard: React.FC<EncryptedMemoCardProps> = ({ memo }) => {
    return (
        <div className="bg-white shadow-md rounded p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-medium text-gray-800">
                    メモID: {memo.id}
                </h3>
                <span className="text-sm text-gray-500">
                    作成日: {new Date(memo.createdAt).toLocaleDateString()}
                </span>
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap break-all">
                {memo.content} {/* 暗号化された内容を表示 */}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
                {memo.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                    >
                        #{tag}
                    </span>
                ))}
            </div>
            <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                    更新日: {new Date(memo.lastUpdatedAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-yellow-500">暗号化済み</span>
            </div>
        </div>
    );
};

export default EncryptedMemoListPage;