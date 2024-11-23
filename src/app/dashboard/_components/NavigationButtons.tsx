// app/dashboard/_components/NavigationButtons.tsx

"use client";

import Link from "next/link";
import { AcademicCapIcon, ClipboardIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

export default function NavigationButtons() {
  return (
    <div className="flex flex-col space-y-4">
      {/* 文法ダッシュボードへ */}
      <Link href="/grammar/dashboard">
        <button className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200">
          <AcademicCapIcon className="h-6 w-6 mr-2" />
          文法ダッシュボードへ
        </button>
      </Link>

      {/* 文法問題一覧へ */}
      <Link href="/grammar/list">
        <button className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition duration-200">
          <ClipboardIcon className="h-6 w-6 mr-2" />
          文法問題一覧へ
        </button>
      </Link>

      {/* クイズ設定へ */}
      <Link href="/grammar/quiz/select">
        <button className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition duration-200">
          <Cog6ToothIcon className="h-6 w-6 mr-2" />
          クイズ設定へ
        </button>
      </Link>
    </div>
  );
}
