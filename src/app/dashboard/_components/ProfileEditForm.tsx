// app/dashboard/_components/ProfileEditForm.tsx

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

type ProfileEditFormProps = {
    onClose: () => void;
};

export default function ProfileEditForm({ onClose }: ProfileEditFormProps) {
    const { data: session, update } = useSession();
    const [email, setEmail] = useState<string>(session?.user?.email || "");
    const [role, setRole] = useState<string>(session?.user?.role || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ここで実際にはAPIを呼び出してデータベースを更新する必要があります
        // 今回はモックデータとしてlocalStorageに保存します

        if (typeof window !== "undefined" && session?.user?.id) {
            // ローカルストレージにユーザー情報を保存
            const updatedUser = { ...session.user, email, role };
            localStorage.setItem(`user_${session.user.id}`, JSON.stringify(updatedUser));

            // セッションの更新（next-authのupdateメソッドを使用）
            await update({ user: { ...session.user, email, role } });

            toast.success("プロフィールが更新されました！");
        } else {
            toast.error("プロフィールの更新に失敗しました。");
        }

        // フォーム送信後にモーダルを閉じる
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">プロフィール編集</h2>
            <div>
                <label className="block text-gray-700">メールアドレス</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label className="block text-gray-700">ロール</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="">選択してください</option>
                    <option value="admin">管理者</option>
                    <option value="user">ユーザー</option>
                    {/* 必要に応じて他のロールを追加 */}
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                    保存
                </button>
            </div>
        </form>
    );
}
