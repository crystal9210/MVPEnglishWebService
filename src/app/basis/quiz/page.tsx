"use client";

import { useRouter } from "next/navigation";
import { FaBook, FaClipboard } from "react-icons/fa"; // 必要なアイコンをインポート

export default function BasisHomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">学習形式を選択してください</h1>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        {/* to / for の基礎 */}
        <button
          onClick={() => router.push("/basis/quiz/begginning")}
          className="flex-1 p-6 bg-gray-200 text-gray-800 rounded-lg shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300 flex flex-col items-center"
        >
          <FaBook className="w-16 h-16 mb-4 text-blue-500 hover:text-white" />
          <p className="text-lg font-semibold">to / for の基礎</p>
        </button>

        {/* 別カテゴリの学習 */}
        <button
          onClick={() => router.push("/basis/other-category")}
          className="flex-1 p-6 bg-gray-200 text-gray-800 rounded-lg shadow-lg hover:bg-green-500 hover:text-white transition-all duration-300 flex flex-col items-center"
        >
          <FaClipboard className="w-16 h-16 mb-4 text-green-500 hover:text-white" />
          <p className="text-lg font-semibold">別カテゴリの問題</p>
        </button>
      </div>
    </div>
  );
}
