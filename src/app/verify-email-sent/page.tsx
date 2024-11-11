"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailSent() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const emailParam = new URLSearchParams(window.location.search).get("email");
      setEmail(emailParam);

      if (!emailParam) {
        setIsVerified(false);
        return;
      }

      try {
        const res = await fetch(`/api/check-registration?email=${emailParam}`);
        const data = await res.json();
        setIsVerified(data.verified);
      } catch {
        setIsVerified(false);
      }
    };

    checkVerificationStatus();
  }, []);

  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <p className="text-lg font-semibold">確認中...</p>
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
        {isVerified ? (
          <div>
            <h1 className="text-3xl font-bold text-green-600">登録完了</h1>
            <p className="mt-4 text-lg text-gray-700">登録が完了しました。</p>
            <a
              href="/login"
              className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              ログイン
            </a>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-red-600">登録未完了</h1>
            <p className="mt-4 text-lg text-gray-700">登録が完了していません。</p>
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
