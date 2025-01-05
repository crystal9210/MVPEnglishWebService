// 設計
// コンテキスト全体の方針(一貫した設計)：ローカルのセッションとしてコンテキストおよびidbを通じてデータを保持、アクセスを許可されているルートにてアクセス可能
// TODO アクセス制御のセキュリティ機構をどの程度導入するか
// メモコンテキスト機能
// 1. 基本的なCRUD - React context APIによるグローバルな状態管理・提供
// 2. idbへの保存機能(バックグラウンド・非同期)
// 3. データ永続化 -> ユーザにリモートでデータを保持させるかどうかを選択して制御させる
// 4. UI：モーダル
// 5. メモ検索・フィルタリング機能 - 日時、タグ付け・カテゴリ分け
// 6. メモコピーボタン：各問題に取り組む中で特定の問題文IDに関連づけられたユーザごとのメモ内容や、また、オリジナル問題セット作成機能を実装する(先駆けとして/dashboardのgoals領域に同様の方針で機能実装済み)
// TODO 5-日時：昇順・降順 -  バックグラウンドで作成・最終更新日時をデータとして保持するようにするがこれはフィルタイングおよび制御の際に表示するかどうか

"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { useMemoContext } from "@/contexts/MemoContext";
import { toast } from "react-toastify";

interface MemoModalProps {
    isOpen: boolean;
    onClose: () => void;
    memo?: Memo;
}

const MAX_MEMO_CONTENT_LENGTH = 2000;
const MAX_TAG_LENGTH = 100;

const MemoModal: React.FC<MemoModalProps> = ({ isOpen, onClose, memo }) => {
    const { addMemo, editMemo } = useMemoContext();
    const [content, setContent] = useState<string>(memo ? memo.content : "");
    const [tags, setTags] = useState<string[]>(memo ? memo.tags : []);
    const [tagInput, setTagInput] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [tagError, setTagError] = useState<string>("");

    useEffect(() => {
        if (memo) {
            setContent(memo.content);
            setTags(memo.tags);
        } else {
            setContent("");
            setTags([]);
        }
        setError("");
        setTagError("");
    }, [memo, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (content.length > MAX_MEMO_CONTENT_LENGTH) {
            setError(
                `The length of memo's content is limited to ${MAX_MEMO_CONTENT_LENGTH}, but you inputted a memo with length ${content.length}.`
            );
            return;
        }
        for (const tag of tags) {
            if (tag.length > MAX_TAG_LENGTH) {
                setTagError(
                    `The length of a tag is limited to ${MAX_TAG_LENGTH} characters, but you inputted a tag with length ${tag.length}.`
                );
                return;
            }
        }

        if (memo) {
            // Edit existing memo
            try {
                await editMemo(memo.id, { content, tags });
                toast.success("Memo updated successfully!");
            } catch (err) {
                toast.error("Failed to update memo.");
                console.error(err);
            }
        } else {
            // Add new memo
            try {
                await addMemo(content, tags);
                toast.success("Memo added successfully!");
            } catch (err) {
                toast.error("Failed to add memo.");
                console.error(err);
            }
        }
        onClose();
    };

    // Handle adding a new tag
    const handleAddTag = () => {
        const trimmedTag = tagInput.trim();
        if (!trimmedTag) return;
        if (trimmedTag.length > MAX_TAG_LENGTH) {
            setTagError(
                `The length of a tag is limited to ${MAX_TAG_LENGTH} characters, but you inputted a tag with length ${trimmedTag.length}.`
            );
            return;
        }
        if (!tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
            setTagError("");
        } else {
            setTagError("This tag is already added to your tag list.");
            return;
        }
    };

    // Handle removing an existing tag
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
        setTagError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-11/12 max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
                    aria-label="Close"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-gray-500">
                    {memo ? "Edit Memo" : "Add Memo"}
                </h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {tagError && <p className="text-red-500 mb-2">{tagError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            rows={4}
                        ></textarea>
                    </div>
                    <div>
                        <label
                            htmlFor="tags"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Tags
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                type="text"
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Enter a tag"
                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                aria-label="Add tag"
                            >
                                +
                            </button>
                        </div>
                        {/* Display tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 text-red-500 hover:text-red-700"
                                            aria-label={`Remove tag ${tag}`}
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                            {memo ? "Update" : "Add"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemoModal;
