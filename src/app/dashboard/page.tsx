// app/dashboard/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/signout_button";
import NavigationButtons from "./_components/NavigationButtons";
import MemoButton from "./_components/MemoButton";
import ActivityChart from "./_components/ActivityChart";
import TodoList from "./_components/TodoList";
import GoalProgress from "./_components/GoalProgress";
import Modal from "./_components/Modal";
import ProfileEditForm from "./_components/ProfileEditForm";
import HistoryPanel from "./_components/HistoryPanel"; // 新規追加
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4">
            {/* ナビゲーションバー */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-indigo-600">User&apos;s ダッシュボード</h1>
                <div className="flex items-center space-x-4">
                    <NavigationButtons />
                    <MemoButton />
                </div>
            </div>

            {/* メインコンテンツ */}
            <div className="flex flex-col">
                <div className="flex flex-col md:flex-row md:space-x-6">
                    {/* プロフィール領域 */}
                    <div className="flex-1 bg-white shadow-lg rounded-lg p-8 mb-6 md:mb-0 flex flex-col items-center">
                        <p className="text-gray-600 mb-6 text-center">
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
                        {/* プロフィール編集ボタン */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 mb-4"
                        >
                            プロフィール編集
                        </button>
                        <SignOutButton />
                    </div>

                    {/* 履歴情報表示パネル */}
                    <div className="flex-1 bg-white shadow-lg rounded-lg p-8">
                        <HistoryPanel />
                    </div>
                </div>
                <div className="flex-1 md:mr-6">
                    {/* サービスごとのセクション */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {/* 英文法問題サービス */}
                        <div className="col-span-1">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">英文法問題サービス</h2>
                            <ActivityChart serviceName="英文法問題サービス" timeframe="月別" />
                            <TodoList serviceName="英文法問題サービス" />
                            <GoalProgress serviceName="英文法問題サービス" />
                        </div>

                        {/* 英文問題サービス */}
                        <div className="col-span-1">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">英文問題サービス</h2>
                            <ActivityChart serviceName="英文問題サービス" timeframe="月別" />
                            <TodoList serviceName="英文問題サービス" />
                            <GoalProgress serviceName="英文問題サービス" />
                        </div>

                        {/* 他のサービスも同様に追加 */}
                    </div>
                </div>
            </div>

            {/* プロフィール編集モーダル */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProfileEditForm onClose={() => setIsModalOpen(false)} />
            </Modal>

            {/* トースト通知コンテナ */}
            <ToastContainer />
        </div>
    )};
