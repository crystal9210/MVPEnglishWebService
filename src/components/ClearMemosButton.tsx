/* /src/components/ClearMemosButton.tsx */

"use client";

import React from "react";
import { useMemoContext } from "@/contexts/MemoContext";
import { toast } from "react-toastify";

/**
 * ClearMemosButton component provides a button to clear all memos from IndexedDB.
 * @returns JSX element for the clear memos button.
 */
const ClearMemosButton: React.FC = () => {
    const { clearAllMemos, isLoading } = useMemoContext();

    const handleClearMemos = async () => {
        const confirmed = confirm(
            "本当に全てのメモを削除しますか？この操作は取り消せません。"
        );
        if (!confirmed) return;

        try {
            await clearAllMemos();
            toast.success("全てのメモが削除されました。");
        } catch (error) {
            console.error("Failed to clear memos:", error);
            toast.error("メモの削除に失敗しました。");
        }
    };

    return (
        <button
            onClick={handleClearMemos}
            disabled={isLoading}
            className={`mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            {isLoading ? "削除中..." : "全てのメモを削除"}
        </button>
    );
};

export default ClearMemosButton;
