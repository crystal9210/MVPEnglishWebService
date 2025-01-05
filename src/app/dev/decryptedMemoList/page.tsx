"use client";

import React from "react";
import { useMemoContext } from "@/contexts/MemoContext";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import ClearMemosButton from "@/components/ClearMemosButton";

/**
 * DecryptedMemoListPage component displays a list of decrypted memos.
 * It shows both active memos and trashed memos.
 * @returns JSX Element for decrypted memo list.
 */
const DecryptedMemoListPage: React.FC = () => {
    const { memoList, trashedMemoList, isLoading, error } = useMemoContext();

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Navbar を削除しました */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center">
                    Decrypted Memo List
                </h1>
            </header>

            {/* エラーメッセージを常に表示 */}
            {error && (
                <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
                    {error}
                </div>
            )}

            {/* メモの読み込み状態とメモ一覧の表示 */}
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                </div>
            ) : (
                <>
                    {/* アクティブメモの表示 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Active Memos
                        </h2>
                        {memoList.length === 0 ? (
                            <p className="text-gray-600 text-center">
                                There are no active memos.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {memoList.map((memo) => (
                                    <DecryptedMemoCard
                                        key={memo.id}
                                        memo={memo}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ゴミ箱メモの表示 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Trashed Memos
                        </h2>
                        {trashedMemoList.length === 0 ? (
                            <p className="text-gray-600 text-center">
                                There are no trashed memos.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {trashedMemoList.map((memo) => (
                                    <DecryptedMemoCard
                                        key={memo.id}
                                        memo={memo}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ClearMemosButton を全てのケースで表示 */}
            <ClearMemosButton />

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

/**
 * DecryptedMemoCard component displays the details of a decrypted memo.
 * @param memo The memo object to display.
 * @returns JSX Element for a decrypted memo card.
 */
interface DecryptedMemoCardProps {
    memo: Memo;
}

const DecryptedMemoCard: React.FC<DecryptedMemoCardProps> = ({ memo }) => {
    return (
        <div className="bg-white shadow-md rounded p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-medium text-gray-800">
                    Memo ID: {memo.id}
                </h3>
                <span className="text-sm text-gray-500">
                    Created: {new Date(memo.createdAt).toLocaleDateString()}
                </span>
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap break-all">
                {memo.content} {/* Decrypted content */}
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
                    Last Updated:{" "}
                    {new Date(memo.lastUpdatedAt).toLocaleDateString()}
                </span>
                <span
                    className={`text-sm ${
                        memo.deleted ? "text-red-500" : "text-green-500"
                    }`}
                >
                    {memo.deleted ? "Trashed" : "Active"}
                </span>
            </div>
        </div>
    );
};

export default DecryptedMemoListPage;
