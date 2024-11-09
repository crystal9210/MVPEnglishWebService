import { auth } from "@/lib/auth"; // サーバー側でセッションを取得する関数
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/signout_button";

export default async function DashboardPage() {
    const session = await auth(); // サーバーでセッションを取得

    // セッションが存在しない場合、またはユーザーのロールが不適切な場合はリダイレクト
    if (!session || session.user?.role !== "user") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    管理者ダッシュボード
                </h1>
                <p className="text-gray-600 mb-6">
                    ようこそ、<span className="font-semibold">{session.user?.email}</span> さん
                </p>
                <SignOutButton />
            </div>
        </div>
    );
}
