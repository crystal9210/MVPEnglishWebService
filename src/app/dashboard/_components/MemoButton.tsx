"use client";

import React, { useState } from "react";
import {
    DocumentTextIcon,
    PencilIcon,
    XMarkIcon,
    PlusIcon,
} from "@heroicons/react/24/solid";
import { useMemoContext } from "@/contexts/MemoContext";
import MemoModal from "./MemoModal";
import DeletedMemosModal from "./TrashedMemosModal"; // Newly added
import { toast } from "react-toastify";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

const MemoButton: React.FC = () => {
    const {
        memoList,
        trashedMemoList, // Use trashedMemoList directly
        deleteMemo,
        restoreMemo,
        deleteTrashedMemo,
        deleteAllTrashedMemos,
    } = useMemoContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMemo, setEditingMemo] = useState<Memo | undefined>(undefined);
    const [isVisible, setIsVisible] = useState(false);
    const [isDeletedMemosModalOpen, setIsDeletedMemosModalOpen] =
        useState(false);

    const handleAdd = () => {
        setEditingMemo(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (memo: Memo) => {
        setEditingMemo(memo);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("本当にこのメモを削除しますか？")) {
            try {
                await deleteMemo(id);
                toast.info("メモを削除しました。3日後に完全削除されます。");
            } catch (err) {
                // Error handling is managed in MemoProvider, so no action needed here
            }
        }
    };

    const openDeletedMemosModal = () => {
        setIsDeletedMemosModalOpen(true);
    };

    const handleRestore = async (id: string) => {
        try {
            await restoreMemo(id);
            toast.success("メモを復元しました！");
        } catch (err) {
            // Error handling is managed in MemoProvider, so no action needed here
        }
    };

    const handleDeleteTrashedMemo = async (id: string) => {
        if (confirm("本当にこの削除済みメモを完全に削除しますか？")) {
            try {
                await deleteTrashedMemo(id);
                toast.info("削除済みメモを完全に削除しました。");
            } catch (err) {
                // Error handling is managed in MemoProvider, so no action needed here
            }
        }
    };

    const handleDeleteAllTrashedMemos = async () => {
        if (confirm("本当に全ての削除済みメモを完全に削除しますか？")) {
            try {
                await deleteAllTrashedMemos();
                toast.info("全ての削除済みメモを完全に削除しました。");
            } catch (err) {
                // Error handling is managed in MemoProvider, so no action needed here
            }
        }
    };

    return (
        <>
            <div className="flex flex-col items-end space-y-4">
                {/* メモ表示トグルボタン */}
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
                    aria-label="メモを開閉"
                >
                    {isVisible ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <DocumentTextIcon className="h-6 w-6" />
                    )}
                </button>

                {/* 削除メモ表示ボタン */}
                <button
                    onClick={openDeletedMemosModal}
                    className="p-3 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 transition"
                    aria-label="削除されたメモを表示"
                >
                    <PencilIcon className="h-6 w-6" />
                </button>

                {/* メモ一覧 */}
                {isVisible && (
                    <div className="w-64 bg-white shadow-lg rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">メモ</h3>
                            <button
                                onClick={handleAdd}
                                className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                aria-label="メモを追加"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                        {memoList.length === 0 ? (
                            <p className="text-gray-500">メモがありません。</p>
                        ) : (
                            <ul className="space-y-2">
                                {memoList.map((memo) => (
                                    <li key={memo.id} className="border-b pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-700">
                                                    {memo.content}
                                                </p>
                                                {/* タグの表示 */}
                                                {memo.tags &&
                                                    memo.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {memo.tags.map(
                                                                (
                                                                    tag,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(memo)
                                                    }
                                                    className="text-blue-500 hover:text-blue-600"
                                                    aria-label="メモを編集"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(memo.id)
                                                    }
                                                    className="text-red-500 hover:text-red-600"
                                                    aria-label="メモを削除"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* メモ追加・編集モーダル */}
            <MemoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                memo={editingMemo}
            />

            {/* 削除メモ表示モーダル */}
            <DeletedMemosModal
                isOpen={isDeletedMemosModalOpen}
                onClose={() => setIsDeletedMemosModalOpen(false)}
                trashedMemos={trashedMemoList}
                onRestore={handleRestore}
                onDelete={handleDeleteTrashedMemo}
                onDeleteAll={handleDeleteAllTrashedMemos}
            />
        </>
    );
};

export default MemoButton;
