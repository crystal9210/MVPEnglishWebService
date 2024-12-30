"use client";

import React from "react";
import { XMarkIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

interface TrashedMemosModalProps {
    isOpen: boolean;
    onClose: () => void;
    trashedMemos: Memo[];
    onRestore: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>; // 新規追加
    onDeleteAll: () => Promise<void>; // 新規追加
}

const TrashedMemosModal: React.FC<TrashedMemosModalProps> = ({
    isOpen,
    onClose,
    trashedMemos,
    onRestore,
    onDelete,
    onDeleteAll,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-11/12 max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">削除されたメモ</h2>
                    <button onClick={onClose} aria-label="閉じる">
                        <XMarkIcon className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
                {trashedMemos.length === 0 ? (
                    <p className="text-gray-500">
                        削除されたメモはありません。
                    </p>
                ) : (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={onDeleteAll}
                                className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                aria-label="全ての削除済みメモを削除"
                            >
                                <TrashIcon className="h-5 w-5 mr-1" />
                                全削除
                            </button>
                        </div>
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {trashedMemos.map((memo: Memo) => (
                                <li
                                    key={memo.id}
                                    className="border-b pb-2 flex justify-between items-start"
                                >
                                    <div>
                                        <p className="text-gray-700">
                                            {memo.content}
                                        </p>
                                        {/* Display tags */}
                                        {memo.tags && memo.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {memo.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onRestore(memo.id)}
                                            className="flex items-center text-green-500 hover:text-green-600"
                                            aria-label="メモを復元"
                                        >
                                            <ArrowPathIcon className="h-5 w-5 mr-1" />
                                            復元
                                        </button>
                                        <button
                                            onClick={() => onDelete(memo.id)}
                                            className="flex items-center text-red-500 hover:text-red-600"
                                            aria-label="メモを完全に削除"
                                        >
                                            <TrashIcon className="h-5 w-5 mr-1" />
                                            完全削除
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrashedMemosModal;
