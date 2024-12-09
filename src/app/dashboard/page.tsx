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
import HistoryPanel from "./_components/HistoryPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import ActivityManagerComponent from "@/components/ActivityManagerComponent"; // 追加

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // セッションがない場合はログインページにリダイレクト
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4">
            {/* ナビゲーションバー */}
            <div className="flex justify-between items-center mb-12 mt-8">
                <h1 className="text-4xl font-bold text-indigo-600">User&apos;s ダッシュボード</h1>
                <div className="fixed top-4 right-4 flex flex-col space-y-4 z-50">
                    <NavigationButtons />
                    <MemoButton />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="flex flex-col md:flex-row md:space-x-6 mb-12">
                    {/* プロフィール領域 */}
                    <div
                        className="flex-[1_1_50%] bg-white shadow-lg rounded-lg p-8 mb-6 md:mb-0 flex flex-col items-center"
                    >
                        <p className="text-gray-600 mb-6 text-center">
                            ようこそ、<span className="font-semibold">{session?.user?.email}</span> さん
                        </p>
                        {session?.user?.image && (
                            <Image
                                src={session.user.image}
                                alt="User Image"
                                width={100}
                                height={100}
                                className="rounded-full mb-4"
                                priority
                            />
                        )}
                        <p className="text-gray-600 mb-2">メールアドレス: {session?.user?.email}</p>
                        <p className="text-gray-600 mb-2">ユーザーID: {session?.user?.id || "未設定"}</p>
                        <p className="text-gray-600 mb-6">ロール: {session?.user?.role || "未設定"}</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 mb-4"
                        >
                            プロフィール編集
                        </button>
                        <SignOutButton />
                    </div>

                    {/* 履歴情報表示パネル */}
                    <div
                        className="flex-[1_1_50%] bg-white shadow-lg rounded-lg p-4"
                        style={{ height: "460px" }}
                    >
                        <HistoryPanel />
                    </div>
                </div>

                <div className="flex-1 md:mr-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">英文法問題サービス</h2>
                            <ActivityChart serviceName="英文法問題サービス" timeframe="月別" />
                            <TodoList serviceName="英文法問題サービス" />
                            <GoalProgress serviceName="英文法問題サービス" />
                        </div>
                        <div className="col-span-1">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">英文問題サービス</h2>
                            <ActivityChart serviceName="英文問題サービス" timeframe="月別" />
                            <TodoList serviceName="英文問題サービス" />
                            <GoalProgress serviceName="英文問題サービス" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TODO */}
            <div className="mt-12">
                <ActivityManagerComponent />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProfileEditForm onClose={() => setIsModalOpen(false)} />
            </Modal>

            <ToastContainer />
        </div>
    );
}
