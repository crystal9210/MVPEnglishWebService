"use client";

import React, { useEffect, useState } from "react";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { useMemoContext } from "@/contexts/MemoContext";

const EncryptedMemosPage: React.FC = () => {
    const { memoList } = useMemoContext();
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchMemos = async () => {
            try {
                const allMemos = await getAllMemos();
                setMemos(allMemos);
            } catch (err) {
                setError("メモの取得に失敗しました。");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMemos();
    }, [memoList]);

    if (loading) return <p>読み込み中...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">暗号化されたメモ一覧</h1>
            {memos.length === 0 ? (
                <p>メモがありません。</p>
            ) : (
                <ul className="space-y-4">
                    {memos.map((memo) => (
                        <li key={memo.id} className="p-4 border rounded-md">
                            <p className="text-gray-700">{memo.content}</p>
                            <div className="mt-2">
                                {memo.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs mr-2"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EncryptedMemosPage;
