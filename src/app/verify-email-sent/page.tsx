"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailSent() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const emailParam = new URLSearchParams(window.location.search).get("email");
      setEmail(emailParam);

      if (!emailParam) {
        setIsVerified(false);
        setError("メールアドレスが指定されていません。");
        return;
      }

      try {
        const res = await fetch(`/api/check-registration?email=${emailParam}`);
        if (!res.ok) {
          throw new Error("登録ステータスの確認に失敗しました。");
        }

        const data = await res.json();
        setIsVerified(data.emailVerified);
      } catch (error) {
        if (error instanceof Error) {
          console.error("エラー:", error.message);
        } else {
          console.error("予期しないエラーが発生しました:", error);
        }
        setIsVerified(false);
        setError("登録ステータスの確認に失敗しました。");
      }
    };

    checkVerificationStatus();
  }, []);

  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-700 mb-4"></div>
          <p className="text-lg font-semibold">確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700">
      <div className="text-center bg-white shadow-md p-8 rounded-lg">
        {email && (
          <p className="mb-4 text-sm text-gray-500">
            対象メールアドレス: <span className="font-medium text-gray-800">{email}</span>
          </p>
        )}
        {error ? (
          <div>
            <h1 className="text-3xl font-bold text-red-600">エラー発生</h1>
            <p className="mt-4 text-lg text-gray-700">{error}</p>
            <a
              href="/register"
              className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              登録ページへ戻る
            </a>
          </div>
        ) : isVerified ? (
          <div>
            <h1 className="text-3xl font-bold text-green-600">登録完了</h1>
            <p className="mt-4 text-lg text-gray-700">登録が完了しました。</p>
            <a
              href="/signIn"
              className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              ログイン
            </a>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-red-600">登録未完了</h1>
            <p className="mt-4 text-lg text-gray-700">
              登録が完了していません。確認メールからリンクを踏むか、サインイン/サインアップ画面から再度ステップを踏み、メールの再送信をしてください。
            </p>
            <a
              href="/register"
              className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              登録ページへ戻る
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
