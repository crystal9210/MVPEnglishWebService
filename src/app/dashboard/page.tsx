"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignOutButton } from "@/components/signout_button";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // セッションがない場合はログインページにリダイレクト
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // セッションの状態に応じて適切なUIを表示
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null; // ログインページにリダイレクトされるまで何も表示しない
    }

    // ダッシュボードの内容をレンダリング
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">管理者ダッシュボード</h1>
                <p className="text-gray-600 mb-6">
                    ようこそ、<span className="font-semibold">{session?.user?.email}</span> さん
                </p>
                {session?.user?.image && (
                    <img
                        src={session.user.image}
                        alt="User Image"
                        className="rounded-full mb-4"
                        style={{ width: "100px", height: "100px" }}
                    />
                )}
                <p className="text-gray-600 mb-2">メールアドレス: {session?.user?.email}</p>
                <p className="text-gray-600 mb-2">ユーザーID: {session?.user?.id || "未設定"}</p>
                <p className="text-gray-600 mb-6">ロール: {session?.user?.role || "未設定"}</p>
                <SignOutButton />
            </div>

            {/* セッションデータ詳細 */}
            <div className="bg-white shadow-lg rounded-lg p-8 mt-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">セッションデータ詳細</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm text-gray-700">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </div>
    );
}
